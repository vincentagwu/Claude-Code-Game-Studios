/**
 * Timeline Engine — advances a character's life from birth to death.
 *
 * Pure logic (no UI). Processes one year tick at a time, returning
 * a list of timeline entries for the UI to render.
 *
 * @see design/gdd/timeline-engine.md
 */

import type { CharacterState, DelayedEffect, Effect } from "../state/types";
import type { LifeEvent, MinorEventTemplate } from "../events/types";
import { useGameStore } from "../state/useGameStore";
import { getStageForAge, getNextStage, type LifeStage, type StageName } from "../stages/lifeStages";
import { processDelayedEffects, type DelayedEffectResult } from "../state/delayedEffectQueue";
import { generateEventsForYear, type EventHistory, recordEventFired } from "./lifeEventGenerator";
import { resolveTemplate } from "../events/resolveTemplate";
import { TUNING } from "../state/config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimelineEntryType =
  | "minor_event"
  | "major_event"
  | "stage_transition"
  | "echo_event"
  | "quiet_year"
  | "death";

export interface TimelineEntry {
  readonly id: string;
  readonly age: number;
  readonly type: TimelineEntryType;
  readonly text: string;
  /** For major events, the event data with choices. */
  readonly event?: LifeEvent;
  /** For stage transitions, the new stage. */
  readonly newStage?: StageName;
}

export interface YearTickResult {
  readonly entries: TimelineEntry[];
  readonly isDead: boolean;
  readonly stageChanged: boolean;
  readonly newStage?: LifeStage;
}

// ---------------------------------------------------------------------------
// Year tick processing
// ---------------------------------------------------------------------------

let entryCounter = 0;

/**
 * Process a single year tick. Advances age, applies drifts, selects events,
 * checks death. Returns timeline entries for the UI.
 */
export function processYearTick(
  eventPool: readonly LifeEvent[],
  eventHistory: EventHistory,
  delayedEffects: DelayedEffect[],
  rng: () => number = Math.random
): { result: YearTickResult; updatedDelayedEffects: DelayedEffect[]; updatedHistory: EventHistory } {
  const store = useGameStore.getState();
  const character = store.character;
  if (!character) {
    return {
      result: { entries: [], isDead: false, stageChanged: false },
      updatedDelayedEffects: delayedEffects,
      updatedHistory: eventHistory,
    };
  }

  const entries: TimelineEntry[] = [];

  // 1. INCREMENT AGE
  const newAge = character.identity.currentAge + 1;
  store.applyEffect({
    type: "attribute",
    target: "health",
    operation: "add",
    value: 0, // no-op to trigger state update path
  });
  // Directly update age in store
  useGameStore.setState({
    character: {
      ...useGameStore.getState().character!,
      identity: {
        ...useGameStore.getState().character!.identity,
        currentAge: newAge,
      },
    },
  });

  // 2. CHECK STAGE TRANSITION
  const prevStage = getStageForAge(newAge - 1);
  const currentStage = getStageForAge(newAge);
  const stageChanged = prevStage.name !== currentStage.name;

  if (stageChanged) {
    entries.push({
      id: `entry_${entryCounter++}`,
      age: newAge,
      type: "stage_transition",
      text: `${prevStage.displayName} → ${currentStage.displayName}`,
      newStage: currentStage.name,
    });
  }

  // 3. APPLY PASSIVE DRIFTS
  store.resetYearTracking();
  store.applyPassiveDrifts();

  // 4. PROCESS DELAYED EFFECTS
  const { results: echoResults, updatedQueue } = processDelayedEffects(
    delayedEffects,
    newAge,
    rng
  );

  for (const echo of echoResults) {
    // Apply the effect
    applyGameEffect(echo.effect);
    entries.push({
      id: `entry_${entryCounter++}`,
      age: newAge,
      type: "echo_event",
      text: echo.narrative,
    });
  }

  // 5. CHECK IMMEDIATE DEATH (Health = 0)
  const stateAfterDrifts = useGameStore.getState().character!;
  if (stateAfterDrifts.attributes.health <= 0) {
    entries.push({
      id: `entry_${entryCounter++}`,
      age: newAge,
      type: "death",
      text: `${stateAfterDrifts.identity.name} passed away at age ${newAge}.`,
    });
    return {
      result: { entries, isDead: true, stageChanged, newStage: stageChanged ? currentStage : undefined },
      updatedDelayedEffects: updatedQueue,
      updatedHistory: eventHistory,
    };
  }

  // 6. GENERATE & PRESENT EVENTS
  const currentState = useGameStore.getState().character!;
  const flags = store.recalculateFlags();
  const yearEvents = generateEventsForYear(
    currentState,
    flags,
    currentStage,
    newAge,
    eventPool,
    eventHistory,
    undefined,
    rng
  );

  let updatedHistory = eventHistory;

  for (const event of yearEvents) {
    // Track occurrence in history
    updatedHistory = recordEventFired(updatedHistory, event.id, newAge);

    if (event.type === "major" || event.type === "crisis") {
      entries.push({
        id: `entry_${entryCounter++}`,
        age: newAge,
        type: "major_event",
        text: getEventSetupText(event),
        event,
      });
    } else {
      // Resolve template for minor events
      const text = isMinorTemplate(event)
        ? resolveTemplate(event as MinorEventTemplate, currentState, rng) ?? event.id
        : getEventText(event);

      // Apply minor event effects immediately
      for (const eff of event.effects) {
        applyGameEffect(convertEventEffect(eff));
      }

      entries.push({
        id: `entry_${entryCounter++}`,
        age: newAge,
        type: "minor_event",
        text,
      });
    }
  }

  // If no events, show quiet year
  if (yearEvents.length === 0) {
    entries.push({
      id: `entry_${entryCounter++}`,
      age: newAge,
      type: "quiet_year",
      text: "A quiet year passes.",
    });
  }

  // 7. CHECK DEATH PROBABILITY
  let isDead = false;
  if (newAge >= TUNING.DEATH_START_AGE) {
    const health = useGameStore.getState().character!.attributes.health;
    const healthModifier = 2.0 - health / 100;
    const deathChance =
      TUNING.DEATH_BASE_RATE *
      (1 + (newAge - TUNING.DEATH_START_AGE) * TUNING.DEATH_ACCELERATION) *
      healthModifier;

    if (rng() < deathChance) {
      isDead = true;
      entries.push({
        id: `entry_${entryCounter++}`,
        age: newAge,
        type: "death",
        text: `${useGameStore.getState().character!.identity.name} passed away at age ${newAge}.`,
      });
    }
  }

  return {
    result: {
      entries,
      isDead,
      stageChanged,
      newStage: stageChanged ? currentStage : undefined,
    },
    updatedDelayedEffects: updatedQueue,
    updatedHistory,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function isMinorTemplate(event: LifeEvent): event is MinorEventTemplate {
  return event.type === "minor" && "template" in event;
}

function getEventSetupText(event: LifeEvent): string {
  const content = event.content;
  if ("setup" in content) return content.setup;
  if ("dialogue" in content) return content.dialogue.map((d) => d.text).join(" ");
  if ("text" in content) return content.text;
  if ("pages" in content) return content.pages[0] ?? "";
  return event.id;
}

function getEventText(event: LifeEvent): string {
  const content = event.content;
  if ("text" in content) return content.text;
  if ("setup" in content) return content.setup;
  return event.id;
}

/** Convert an event-level effect to a store-level Effect. */
function convertEventEffect(eff: { type: string; target: string; operation: string; value: unknown }): Effect {
  if (eff.type === "attribute") {
    return {
      type: "attribute",
      target: eff.target as Effect & { type: "attribute" } extends { target: infer T } ? T : never,
      operation: eff.operation as "add" | "multiply" | "set",
      value: eff.value as number,
    } as Effect;
  }
  if (eff.type === "spectrum") {
    return {
      type: "spectrum",
      target: eff.target as Effect & { type: "spectrum" } extends { target: infer T } ? T : never,
      delta: (eff.value as number) ?? 0,
    } as Effect;
  }
  if (eff.type === "tag") {
    return {
      type: "tag",
      tagId: eff.target,
      category: "life_event",
    } as Effect;
  }
  // relationship
  return {
    type: "relationship",
    relationshipId: eff.target,
    closenessChange: typeof eff.value === "number" ? eff.value : 0,
  } as Effect;
}

function applyGameEffect(effect: Effect): void {
  useGameStore.getState().applyEffect(effect);
}

/** Reset the entry counter (useful for tests). */
export function resetEntryCounter(): void {
  entryCounter = 0;
}
