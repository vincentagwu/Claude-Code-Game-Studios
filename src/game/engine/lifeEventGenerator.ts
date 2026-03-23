/**
 * Life Event Generator — full query-filter-weight-select pipeline.
 *
 * Determines what happens each year based on character state, stage,
 * event history, freshness, and relevance scoring.
 *
 * @see design/gdd/life-event-generator.md
 */

import type { CharacterState, DerivedFlags } from "../state/types";
import type { LifeEvent, MinorEventTemplate } from "../events/types";
import type { LifeStage } from "../stages/lifeStages";
import { evaluateConditions } from "../events/evaluateConditions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventHistory {
  /** Map of event ID → list of ages when it fired. */
  readonly firedEvents: Map<string, number[]>;
}

export interface GeneratorConfig {
  /** Weight reduction per recent firing (0-1). Default 0.5. */
  readonly freshnessDecay: number;
  /** How many years before freshness fully recovers. Default 10. */
  readonly freshnessRecoveryYears: number;
  /** Floor for effective weight (prevents events from being completely blocked). */
  readonly weightFloor: number;
}

const DEFAULT_CONFIG: GeneratorConfig = {
  freshnessDecay: 0.5,
  freshnessRecoveryYears: 10,
  weightFloor: 0.05,
};

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Generate events for a single year tick.
 */
export function generateEventsForYear(
  state: CharacterState,
  flags: DerivedFlags,
  stage: LifeStage,
  age: number,
  eventPool: readonly LifeEvent[],
  history: EventHistory,
  config: GeneratorConfig = DEFAULT_CONFIG,
  rng: () => number = Math.random
): LifeEvent[] {
  // 1. DETERMINE EVENT BUDGET
  const socialModifier = Math.floor(
    (state.attributes.relationships - 50) / 25
  );
  const minorBudget = clamp(
    randomInt(
      stage.eventDensity.minEventsPerYear,
      stage.eventDensity.maxEventsPerYear,
      rng
    ) + socialModifier,
    1,
    8
  );

  // 2. QUERY ELIGIBLE EVENTS
  const eligible = filterEligible(state, flags, stage, age, eventPool, history);

  const milestones = eligible.filter((e) => e.isMilestone);
  const majorCandidates = eligible.filter(
    (e) => (e.type === "major" || e.type === "crisis") && !e.isMilestone
  );
  const minorCandidates = eligible.filter((e) => e.type === "minor");

  const selected: LifeEvent[] = [...milestones];

  // 3. SELECT MAJOR EVENT (at most 1 per year, non-milestone)
  if (majorCandidates.length > 0) {
    const weighted = majorCandidates.map((e) => ({
      event: e,
      weight: calculateEffectiveWeight(e, state, age, history, config),
    }));
    const major = weightedSelect(weighted, rng);
    if (major) selected.push(major);
  }

  // 4. SELECT MINOR EVENTS
  const remainingBudget = minorBudget - selected.filter((e) => e.type === "minor").length;
  if (remainingBudget > 0 && minorCandidates.length > 0) {
    const weighted = minorCandidates.map((e) => ({
      event: e,
      weight: calculateEffectiveWeight(e, state, age, history, config),
    }));
    const minors = weightedSelectMultiple(weighted, remainingBudget, rng);
    selected.push(...minors);
  }

  // 5. ORDER: major first, then minor
  selected.sort((a, b) => {
    const order: Record<string, number> = { major: 0, crisis: 1, minor: 2 };
    return (order[a.type] ?? 2) - (order[b.type] ?? 2);
  });

  return selected;
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

function filterEligible(
  state: CharacterState,
  flags: DerivedFlags,
  stage: LifeStage,
  age: number,
  eventPool: readonly LifeEvent[],
  history: EventHistory
): LifeEvent[] {
  return eventPool.filter((event) => {
    // Stage
    if (!event.stages.includes(stage.name)) return false;
    // Age range
    if (age < event.minAge || age > event.maxAge) return false;
    // Category unlocked for this stage
    if (
      event.category &&
      !stage.eventCategories.includes(event.category) &&
      event.category !== "fallback"
    ) {
      return false;
    }
    // Max occurrences
    const timesUsed = history.firedEvents.get(event.id)?.length ?? 0;
    if (timesUsed >= event.maxOccurrences) return false;
    // Prerequisites
    if (
      event.prerequisites.length > 0 &&
      !event.prerequisites.every((p) => history.firedEvents.has(p))
    ) {
      return false;
    }
    // Exclusions
    if (event.exclusions.some((ex) => history.firedEvents.has(ex))) {
      return false;
    }
    // Conditions
    if (!evaluateConditions(event.conditions, state, flags)) return false;

    return true;
  });
}

// ---------------------------------------------------------------------------
// Weighting
// ---------------------------------------------------------------------------

function calculateEffectiveWeight(
  event: LifeEvent,
  state: CharacterState,
  age: number,
  history: EventHistory,
  config: GeneratorConfig
): number {
  let weight = event.weight;

  // Freshness modifier
  const firings = history.firedEvents.get(event.id);
  if (firings && firings.length > 0) {
    const lastFiredAge = Math.max(...firings);
    const yearsSince = age - lastFiredAge;
    if (yearsSince < config.freshnessRecoveryYears) {
      const freshnessReduction =
        config.freshnessDecay *
        (1 - yearsSince / config.freshnessRecoveryYears);
      weight *= 1 - freshnessReduction;
    }
  }

  // Relevance modifier — boost events matching personality
  weight *= calculateRelevance(event, state);

  // Rarity modifier (already baked into base weight, but ensure rare events stay rare)
  const rarityFactor: Record<string, number> = {
    common: 1.0,
    uncommon: 0.6,
    rare: 0.3,
    legendary: 0.1,
  };
  weight *= rarityFactor[event.rarity] ?? 1.0;

  // Floor
  return Math.max(weight * config.weightFloor, weight);
}

function calculateRelevance(event: LifeEvent, state: CharacterState): number {
  let score = 1.0;

  // Boost events with tags matching character tags
  for (const tag of event.tags) {
    if (state.tags.some((t) => t.id === tag)) {
      score += 0.15;
    }
  }

  // Boost social events for social characters, etc.
  if (event.category === "friendships" || event.category === "romance") {
    if (state.spectrums.sociability > 30) score += 0.2;
  }
  if (event.category === "rebellion" || event.category === "identity") {
    if (state.spectrums.conformity < -30) score += 0.2;
  }
  if (event.category === "education_choices" || event.category === "school") {
    if (state.attributes.education > 60) score += 0.15;
  }

  return score;
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

function weightedSelect<T>(
  items: { event: T; weight: number }[],
  rng: () => number
): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((s, i) => s + i.weight, 0);
  if (total <= 0) return items[0].event;
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.event;
  }
  return items[items.length - 1].event;
}

function weightedSelectMultiple<T>(
  items: { event: T; weight: number }[],
  count: number,
  rng: () => number
): T[] {
  const result: T[] = [];
  const pool = [...items];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const selected = weightedSelect(pool, rng);
    if (!selected) break;
    result.push(selected);
    const idx = pool.findIndex((p) => p.event === selected);
    if (idx >= 0) pool.splice(idx, 1);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/**
 * Record that an event fired at a given age.
 */
export function recordEventFired(
  history: EventHistory,
  eventId: string,
  age: number
): EventHistory {
  const newMap = new Map(history.firedEvents);
  const existing = newMap.get(eventId) ?? [];
  newMap.set(eventId, [...existing, age]);
  return { firedEvents: newMap };
}

/**
 * Create an empty event history.
 */
export function createEventHistory(): EventHistory {
  return { firedEvents: new Map() };
}
