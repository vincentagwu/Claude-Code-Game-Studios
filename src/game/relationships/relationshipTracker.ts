/**
 * Relationship Tracker — manages NPC lifecycle, closeness dynamics,
 * and relationship-driven timeline events.
 *
 * @see production/milestones/vertical-slice.md — Sprint 9
 */

import type {
  Relationship,
  RelationshipType,
  CharacterState,
} from "../state/types";
import type { TimelineEntry } from "../engine/timelineEngine";
import { generateNpcTraits, getClosenessModifier, getTraitDescriptor, NPC_TRAITS } from "./npcTraits";
import { NAME_POOLS } from "../data/namePool";

// ---------------------------------------------------------------------------
// Relationship phases
// ---------------------------------------------------------------------------

export type RelationshipPhase =
  | "stranger"
  | "acquaintance"
  | "friend"
  | "close"
  | "deep_bond"
  | "estranged"
  | "reconciling";

const PHASE_THRESHOLDS: { phase: RelationshipPhase; min: number }[] = [
  { phase: "deep_bond", min: 85 },
  { phase: "close", min: 65 },
  { phase: "friend", min: 40 },
  { phase: "acquaintance", min: 15 },
  { phase: "stranger", min: 0 },
];

/** Determine the relationship phase from closeness. */
export function getRelationshipPhase(rel: Relationship): RelationshipPhase {
  if (rel.status === "estranged") return "estranged";
  for (const { phase, min } of PHASE_THRESHOLDS) {
    if (rel.closeness >= min) return phase;
  }
  return "stranger";
}

/** Human-readable phase label. */
export function getPhaseLabel(phase: RelationshipPhase): string {
  const labels: Record<RelationshipPhase, string> = {
    stranger: "Stranger",
    acquaintance: "Acquaintance",
    friend: "Friend",
    close: "Close friend",
    deep_bond: "Deep bond",
    estranged: "Estranged",
    reconciling: "Reconciling",
  };
  return labels[phase];
}

// ---------------------------------------------------------------------------
// Dynamic NPC generation
// ---------------------------------------------------------------------------

/** NPC meeting contexts by life stage. */
const MEETING_CONTEXTS: Record<string, readonly string[]> = {
  earlyChildhood: ["at the playground", "in your neighborhood"],
  childhood: ["at school", "in your neighborhood", "at summer camp", "through a shared hobby"],
  adolescence: ["at school", "through friends", "at a part-time job", "online", "at a club"],
  youngAdult: ["at college", "at work", "through mutual friends", "at a bar", "volunteering"],
  adult: ["at work", "through your kids", "in your neighborhood", "at a class", "through your partner"],
  midlife: ["at work", "in your community", "through a shared interest", "at a reunion"],
  elder: ["in your community", "at a senior center", "through family", "at a volunteer group"],
};

export interface GeneratedNpc {
  readonly relationship: Relationship;
  readonly meetingText: string;
}

/**
 * Generate a new NPC appropriate for the character's current life stage.
 */
export function generateNpc(
  state: CharacterState,
  type: RelationshipType,
  stage: string,
  rng: () => number = Math.random
): GeneratedNpc {
  // Get name from region
  const regionTag = state.tags.find((t) => t.id.startsWith("region_"));
  const regionKey = regionTag?.id.replace("region_", "") ?? "north_american_suburban";
  const names = NAME_POOLS[regionKey] ?? NAME_POOLS["north_american_suburban"];
  const name = names[Math.floor(rng() * names.length)];

  // Don't generate a person with the same name as the player
  const finalName = name === state.identity.name
    ? names[(Math.floor(rng() * names.length) + 1) % names.length]
    : name;

  const traits = generateNpcTraits(rng);
  const contexts = MEETING_CONTEXTS[stage] ?? MEETING_CONTEXTS["adult"];
  const context = contexts[Math.floor(rng() * contexts.length)];

  const startingCloseness = type === "family"
    ? Math.floor(rng() * 30) + 50
    : Math.floor(rng() * 20) + 15;

  const relationship: Relationship = {
    id: `npc_${finalName.toLowerCase().replace(/\s/g, "_")}_${Date.now()}_${Math.floor(rng() * 1000)}`,
    name: finalName,
    type,
    closeness: startingCloseness,
    status: "active",
    traits,
    metAge: state.identity.currentAge,
    history: [],
  };

  const traitDesc = traits.length > 0 ? getTraitDescriptor(traits[0], rng) : "seemed interesting";

  const meetingText =
    type === "romantic"
      ? `You met ${finalName} ${context}. Something about them ${traitDesc.replace("you", "felt different")}.`
      : `You met ${finalName} ${context}. They ${traitDesc}.`;

  return { relationship, meetingText };
}

// ---------------------------------------------------------------------------
// Relationship event triggers
// ---------------------------------------------------------------------------

interface PhaseTransition {
  readonly relationship: Relationship;
  readonly fromPhase: RelationshipPhase;
  readonly toPhase: RelationshipPhase;
  readonly text: string;
}

/**
 * Check if any relationships crossed phase thresholds this tick.
 * Call after closeness changes are applied.
 */
export function checkPhaseTransitions(
  prevRelationships: readonly Relationship[],
  currentRelationships: readonly Relationship[],
  rng: () => number = Math.random
): PhaseTransition[] {
  const transitions: PhaseTransition[] = [];

  for (const current of currentRelationships) {
    const prev = prevRelationships.find((r) => r.id === current.id);
    if (!prev) continue;

    const prevPhase = getRelationshipPhase(prev);
    const currentPhase = getRelationshipPhase(current);

    if (prevPhase !== currentPhase) {
      transitions.push({
        relationship: current,
        fromPhase: prevPhase,
        toPhase: currentPhase,
        text: generateTransitionText(current, prevPhase, currentPhase, rng),
      });
    }
  }

  return transitions;
}

function generateTransitionText(
  rel: Relationship,
  from: RelationshipPhase,
  to: RelationshipPhase,
  rng: () => number
): string {
  const name = rel.name;

  // Upgrading
  if (phaseRank(to) > phaseRank(from)) {
    const upgrades: Record<string, string[]> = {
      acquaintance: [`You and ${name} started spending more time together.`, `${name} became a familiar face in your life.`],
      friend: [`${name} became a real friend — someone you could count on.`, `You and ${name} found your rhythm. It felt easy.`],
      close: [`You and ${name} grew closer than ever.`, `${name} became someone you couldn't imagine life without.`],
      deep_bond: [`${name} became one of the most important people in your life.`, `The bond between you and ${name} deepened into something rare and precious.`],
    };
    const pool = upgrades[to] ?? [`You and ${name} grew closer.`];
    return pool[Math.floor(rng() * pool.length)];
  }

  // Downgrading
  if (to === "estranged") {
    const pool = [
      `The distance between you and ${name} became a silence.`,
      `You and ${name} drifted apart. Neither of you reached out.`,
      `${name} became a person you used to know.`,
    ];
    return pool[Math.floor(rng() * pool.length)];
  }

  const pool = [
    `Something shifted between you and ${name}.`,
    `You and ${name} weren't as close as before.`,
  ];
  return pool[Math.floor(rng() * pool.length)];
}

function phaseRank(phase: RelationshipPhase): number {
  const ranks: Record<RelationshipPhase, number> = {
    stranger: 0, acquaintance: 1, friend: 2, close: 3, deep_bond: 4,
    estranged: -1, reconciling: 1,
  };
  return ranks[phase];
}

// ---------------------------------------------------------------------------
// Relationship-aware decay
// ---------------------------------------------------------------------------

/**
 * Apply relationship decay with phase-aware rates.
 * Deep bonds decay slowly; acquaintances fade fast.
 */
export function applyRelationshipDecay(
  relationships: Relationship[],
  activeThisYear: Set<string>
): { updated: Relationship[]; entries: string[] } {
  const entries: string[] = [];

  const updated = relationships.map((r) => {
    if (r.status !== "active") return r;
    if (r.type === "family") return r;
    if (activeThisYear.has(r.id)) return r;

    const phase = getRelationshipPhase(r);
    let decayRate: number;

    switch (phase) {
      case "deep_bond": decayRate = 0.3; break;
      case "close": decayRate = 0.5; break;
      case "friend": decayRate = 1.0; break;
      case "acquaintance": decayRate = 2.0; break;
      default: decayRate = 1.0;
    }

    const newCloseness = Math.max(0, r.closeness - decayRate);
    const newStatus = newCloseness < 10 ? "estranged" as const : r.status;

    if (newStatus === "estranged" && r.status === "active") {
      entries.push(`You lost touch with ${r.name}.`);
    }

    return { ...r, closeness: Math.round(newCloseness), status: newStatus };
  });

  return { updated, entries };
}

// ---------------------------------------------------------------------------
// NPC meeting schedule
// ---------------------------------------------------------------------------

/**
 * Determine if a new NPC should be generated this year based on
 * stage, existing relationship count, and randomness.
 */
export function shouldGenerateNpc(
  state: CharacterState,
  stage: string,
  rng: () => number = Math.random
): { generate: boolean; type: RelationshipType } | null {
  const activeCount = state.relationships.filter((r) => r.status === "active").length;

  // Don't exceed max relationships
  if (activeCount >= 20) return null;

  // Meeting probability by stage
  const meetingChance: Record<string, number> = {
    infancy: 0,
    earlyChildhood: 0.1,
    childhood: 0.25,
    adolescence: 0.3,
    youngAdult: 0.35,
    adult: 0.2,
    midlife: 0.15,
    elder: 0.1,
  };

  const chance = meetingChance[stage] ?? 0.15;
  if (rng() >= chance) return null;

  // Type probabilities by stage
  const type = pickRelationshipType(stage, state, rng);
  return { generate: true, type };
}

function pickRelationshipType(
  stage: string,
  state: CharacterState,
  rng: () => number
): RelationshipType {
  const hasRomantic = state.relationships.some(
    (r) => r.type === "romantic" && r.status === "active"
  );

  if (stage === "adolescence" || stage === "youngAdult") {
    if (!hasRomantic && rng() < 0.3) return "romantic";
  }
  if (stage === "adult" || stage === "midlife") {
    if (!hasRomantic && rng() < 0.2) return "romantic";
    if (rng() < 0.4) return "professional";
  }

  return "friend";
}

// ---------------------------------------------------------------------------
// Timeline entry generation
// ---------------------------------------------------------------------------

let relEntryCounter = 0;

/**
 * Generate timeline entries for relationship events in a year.
 */
export function generateRelationshipEntries(
  transitions: PhaseTransition[],
  meetingTexts: string[],
  decayTexts: string[],
  age: number
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const text of meetingTexts) {
    entries.push({
      id: `rel_entry_${relEntryCounter++}`,
      age,
      type: "minor_event",
      text,
    });
  }

  for (const t of transitions) {
    entries.push({
      id: `rel_entry_${relEntryCounter++}`,
      age,
      type: "minor_event",
      text: t.text,
    });
  }

  for (const text of decayTexts) {
    entries.push({
      id: `rel_entry_${relEntryCounter++}`,
      age,
      type: "minor_event",
      text,
    });
  }

  return entries;
}
