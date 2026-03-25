/**
 * NPC personality traits — define how NPCs interact with the player.
 *
 * Each NPC gets 2-3 traits that influence conversation style,
 * closeness dynamics, and event text.
 */

export interface NpcTrait {
  readonly id: string;
  readonly label: string;
  readonly category: "positive" | "negative" | "neutral";
  /** How this trait modifies closeness change rates. */
  readonly closenessModifier: number;
  /** Descriptive text fragments for event templates. */
  readonly descriptors: readonly string[];
}

export const NPC_TRAITS: Record<string, NpcTrait> = {
  // Positive
  supportive: {
    id: "supportive", label: "Supportive", category: "positive",
    closenessModifier: 1.2,
    descriptors: ["always had your back", "listened without judging", "showed up when it mattered"],
  },
  funny: {
    id: "funny", label: "Funny", category: "positive",
    closenessModifier: 1.1,
    descriptors: ["made you laugh until you cried", "found humor in everything", "lightened every room"],
  },
  loyal: {
    id: "loyal", label: "Loyal", category: "positive",
    closenessModifier: 1.3,
    descriptors: ["never wavered", "stood by you through everything", "was there before you asked"],
  },
  generous: {
    id: "generous", label: "Generous", category: "positive",
    closenessModifier: 1.1,
    descriptors: ["gave without counting", "shared everything they had", "put others first"],
  },
  wise: {
    id: "wise", label: "Wise", category: "positive",
    closenessModifier: 1.0,
    descriptors: ["saw things clearly", "gave advice you didn't want but needed", "understood more than they said"],
  },
  adventurous: {
    id: "adventurous", label: "Adventurous", category: "positive",
    closenessModifier: 1.0,
    descriptors: ["always had a plan", "dragged you into the best trouble", "made ordinary days feel alive"],
  },

  // Negative
  demanding: {
    id: "demanding", label: "Demanding", category: "negative",
    closenessModifier: 0.8,
    descriptors: ["expected too much", "was never satisfied", "pushed you past your limits"],
  },
  jealous: {
    id: "jealous", label: "Jealous", category: "negative",
    closenessModifier: 0.7,
    descriptors: ["compared themselves to everyone", "resented your success", "needed constant reassurance"],
  },
  unreliable: {
    id: "unreliable", label: "Unreliable", category: "negative",
    closenessModifier: 0.6,
    descriptors: ["disappeared when you needed them", "made promises they couldn't keep", "was always almost there"],
  },
  critical: {
    id: "critical", label: "Critical", category: "negative",
    closenessModifier: 0.8,
    descriptors: ["pointed out every flaw", "meant well but cut deep", "held everyone to impossible standards"],
  },
  toxic: {
    id: "toxic", label: "Toxic", category: "negative",
    closenessModifier: 0.5,
    descriptors: ["drained your energy", "made everything about them", "left you worse than they found you"],
  },

  // Neutral
  quiet: {
    id: "quiet", label: "Quiet", category: "neutral",
    closenessModifier: 0.9,
    descriptors: ["said little but meant it all", "was comfortable in silence", "observed more than they spoke"],
  },
  ambitious: {
    id: "ambitious", label: "Ambitious", category: "neutral",
    closenessModifier: 1.0,
    descriptors: ["always had the next goal", "inspired you to do more", "sometimes forgot to slow down"],
  },
  independent: {
    id: "independent", label: "Independent", category: "neutral",
    closenessModifier: 0.9,
    descriptors: ["didn't need anyone but chose you", "valued their space", "loved on their own terms"],
  },
  creative: {
    id: "creative", label: "Creative", category: "neutral",
    closenessModifier: 1.0,
    descriptors: ["saw the world differently", "made beautiful things from nothing", "lived in their own orbit"],
  },
};

const POSITIVE_IDS = Object.values(NPC_TRAITS).filter((t) => t.category === "positive").map((t) => t.id);
const NEGATIVE_IDS = Object.values(NPC_TRAITS).filter((t) => t.category === "negative").map((t) => t.id);
const NEUTRAL_IDS = Object.values(NPC_TRAITS).filter((t) => t.category === "neutral").map((t) => t.id);

/**
 * Generate 2-3 personality traits for an NPC.
 * Most NPCs are mixed (1-2 positive, 0-1 negative, 0-1 neutral).
 */
export function generateNpcTraits(rng: () => number = Math.random): string[] {
  const traits: string[] = [];
  const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)];

  // Always 1 positive
  traits.push(pick(POSITIVE_IDS));

  // 60% chance of a second positive or neutral
  if (rng() < 0.6) {
    const pool = [...POSITIVE_IDS, ...NEUTRAL_IDS].filter((t) => !traits.includes(t));
    if (pool.length > 0) traits.push(pick(pool));
  }

  // 35% chance of a negative trait
  if (rng() < 0.35) {
    traits.push(pick(NEGATIVE_IDS));
  }

  // If only 1 trait, add a neutral
  if (traits.length < 2) {
    const pool = NEUTRAL_IDS.filter((t) => !traits.includes(t));
    if (pool.length > 0) traits.push(pick(pool));
  }

  return [...new Set(traits)];
}

/** Get a random descriptor for a trait. */
export function getTraitDescriptor(traitId: string, rng: () => number = Math.random): string {
  const trait = NPC_TRAITS[traitId];
  if (!trait) return "";
  return trait.descriptors[Math.floor(rng() * trait.descriptors.length)];
}

/** Get the average closeness modifier for a set of traits. */
export function getClosenessModifier(traitIds: readonly string[]): number {
  if (traitIds.length === 0) return 1.0;
  const total = traitIds.reduce((sum, id) => {
    const trait = NPC_TRAITS[id];
    return sum + (trait?.closenessModifier ?? 1.0);
  }, 0);
  return total / traitIds.length;
}
