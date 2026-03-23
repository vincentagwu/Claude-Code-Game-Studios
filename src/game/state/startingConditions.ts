/**
 * Starting Conditions Generator — randomized birth circumstances.
 *
 * Produces a complete CharacterState for a new life with randomized
 * region, class, family structure, parent traits, and health lottery.
 *
 * @see design/gdd/starting-conditions-generator.md
 */

import type {
  CharacterState,
  Identity,
  PersonalitySpectrums,
  LifeAttributes,
  LifeTag,
  Relationship,
  SocioeconomicClass,
  Gender,
  FamilyBackground,
  ParentTrait,
  TagCategory,
} from "./types";
import { NAME_POOLS, REGION_LOCATIONS } from "../data/namePool";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RegionId = keyof typeof NAME_POOLS;

interface FamilyStructureDef {
  readonly id: string;
  readonly relationships: (region: RegionId, rng: () => number) => Relationship[];
  readonly happinessModifier: number;
  readonly stressModifier: number;
  readonly relationshipsModifier: number;
}

// ---------------------------------------------------------------------------
// Weighted random helper
// ---------------------------------------------------------------------------

function weightedRandom<T>(options: readonly { value: T; weight: number }[], rng: () => number): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let roll = rng() * total;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return option.value;
  }
  return options[options.length - 1].value;
}

function randomInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// ---------------------------------------------------------------------------
// Region definitions
// ---------------------------------------------------------------------------

const REGIONS: readonly { value: RegionId; weight: number }[] = [
  { value: "north_american_suburban", weight: 20 },
  { value: "european_urban", weight: 15 },
  { value: "east_asian_metro", weight: 15 },
  { value: "latin_american", weight: 15 },
  { value: "south_asian", weight: 15 },
  { value: "african_urban", weight: 8 },
  { value: "rural_small_town", weight: 7 },
  { value: "immigrant_experience", weight: 5 },
];

const REGION_WEALTH_MODIFIER: Record<string, number> = {
  north_american_suburban: 10,
  european_urban: 5,
  east_asian_metro: 5,
  latin_american: -5,
  south_asian: -5,
  african_urban: -10,
  rural_small_town: -5,
  immigrant_experience: -10,
};

// ---------------------------------------------------------------------------
// Class definitions
// ---------------------------------------------------------------------------

const CLASSES: readonly { value: SocioeconomicClass; weight: number }[] = [
  { value: "upper", weight: 10 },
  { value: "middle", weight: 40 },
  { value: "working", weight: 35 },
  { value: "lower", weight: 15 },
];

const CLASS_RANGES: Record<SocioeconomicClass, {
  wealth: [number, number];
  education: [number, number];
  stress: [number, number];
}> = {
  upper: { wealth: [75, 85], education: [60, 70], stress: [20, 30] },
  middle: { wealth: [45, 55], education: [45, 55], stress: [30, 40] },
  working: { wealth: [25, 35], education: [30, 40], stress: [40, 50] },
  lower: { wealth: [10, 20], education: [15, 25], stress: [50, 65] },
};

// ---------------------------------------------------------------------------
// Health lottery
// ---------------------------------------------------------------------------

const HEALTH_LOTTERY: readonly { value: { range: [number, number]; tag?: string }; weight: number }[] = [
  { value: { range: [85, 95] }, weight: 40 },
  { value: { range: [70, 84] }, weight: 35 },
  { value: { range: [50, 69], tag: "minor_health_condition" }, weight: 15 },
  { value: { range: [30, 49], tag: "chronic_condition" }, weight: 8 },
  { value: { range: [15, 29], tag: "severe_condition" }, weight: 2 },
];

// ---------------------------------------------------------------------------
// Parent traits
// ---------------------------------------------------------------------------

const POSITIVE_TRAITS = ["supportive", "encouraging", "hardworking", "creative", "patient", "funny", "wise"] as const;
const NEGATIVE_TRAITS = ["demanding", "absent", "strict", "unpredictable", "critical", "anxious", "controlling"] as const;
const NEUTRAL_TRAITS = ["quiet", "traditional", "ambitious", "religious", "practical", "free-spirited"] as const;

const TRAIT_SPECTRUM_MAP: Record<string, { spectrum: keyof PersonalitySpectrums; delta: number }> = {
  supportive: { spectrum: "empathy", delta: 5 },
  encouraging: { spectrum: "courage", delta: 5 },
  hardworking: { spectrum: "ambition", delta: 5 },
  creative: { spectrum: "conformity", delta: -5 },
  patient: { spectrum: "empathy", delta: 3 },
  funny: { spectrum: "sociability", delta: 5 },
  wise: { spectrum: "empathy", delta: 3 },
  demanding: { spectrum: "ambition", delta: 5 },
  absent: { spectrum: "sociability", delta: -5 },
  strict: { spectrum: "conformity", delta: 5 },
  unpredictable: { spectrum: "courage", delta: -3 },
  critical: { spectrum: "ambition", delta: 3 },
  anxious: { spectrum: "courage", delta: -5 },
  controlling: { spectrum: "conformity", delta: 5 },
  quiet: { spectrum: "sociability", delta: -3 },
  traditional: { spectrum: "conformity", delta: 5 },
  ambitious: { spectrum: "ambition", delta: 5 },
  religious: { spectrum: "conformity", delta: 3 },
  practical: { spectrum: "ambition", delta: 3 },
  "free-spirited": { spectrum: "conformity", delta: -5 },
};

function generateParentTraits(rng: () => number): string[] {
  const traits: string[] = [];
  // 1-2 positive traits
  const posCount = randomInt(1, 2, rng);
  for (let i = 0; i < posCount; i++) {
    traits.push(pick(POSITIVE_TRAITS, rng));
  }
  // 0-1 negative traits
  if (rng() < 0.5) {
    traits.push(pick(NEGATIVE_TRAITS, rng));
  }
  // Optional neutral trait
  if (rng() < 0.3) {
    traits.push(pick(NEUTRAL_TRAITS, rng));
  }
  return [...new Set(traits)]; // deduplicate
}

// ---------------------------------------------------------------------------
// Family structure
// ---------------------------------------------------------------------------

function makeParent(
  name: string,
  closenessMin: number,
  closenessMax: number,
  rng: () => number
): Relationship {
  return {
    id: `parent_${name.toLowerCase().replace(/\s/g, "_")}`,
    name,
    type: "family",
    closeness: randomInt(closenessMin, closenessMax, rng),
    status: "active",
    traits: generateParentTraits(rng),
    metAge: 0,
    history: [],
  };
}

function makeSibling(name: string, rng: () => number): Relationship {
  return {
    id: `sibling_${name.toLowerCase().replace(/\s/g, "_")}`,
    name,
    type: "family",
    closeness: randomInt(40, 70, rng),
    status: "active",
    traits: [],
    metAge: 0,
    history: [],
  };
}

const FAMILY_STRUCTURES: readonly { value: FamilyStructureDef; weight: number }[] = [
  {
    value: {
      id: "two_parent_stable",
      relationships: (region, rng) => [
        makeParent(pick(NAME_POOLS[region], rng), 70, 90, rng),
        makeParent(pick(NAME_POOLS[region], rng), 70, 90, rng),
      ],
      happinessModifier: 10,
      stressModifier: 0,
      relationshipsModifier: 0,
    },
    weight: 35,
  },
  {
    value: {
      id: "two_parent_strained",
      relationships: (region, rng) => [
        makeParent(pick(NAME_POOLS[region], rng), 30, 60, rng),
        makeParent(pick(NAME_POOLS[region], rng), 30, 60, rng),
      ],
      happinessModifier: -5,
      stressModifier: 10,
      relationshipsModifier: 0,
    },
    weight: 20,
  },
  {
    value: {
      id: "single_parent",
      relationships: (region, rng) => [
        makeParent(pick(NAME_POOLS[region], rng), 60, 80, rng),
      ],
      happinessModifier: 0,
      stressModifier: 5,
      relationshipsModifier: 0,
    },
    weight: 20,
  },
  {
    value: {
      id: "extended_family",
      relationships: (region, rng) => [
        makeParent(pick(NAME_POOLS[region], rng), 60, 80, rng),
        { ...makeParent(pick(NAME_POOLS[region], rng), 50, 70, rng), id: "grandparent" },
        { ...makeParent(pick(NAME_POOLS[region], rng), 40, 60, rng), id: "aunt_uncle" },
      ],
      happinessModifier: 0,
      stressModifier: 0,
      relationshipsModifier: 15,
    },
    weight: 10,
  },
  {
    value: {
      id: "blended_family",
      relationships: (region, rng) => [
        makeParent(pick(NAME_POOLS[region], rng), 50, 75, rng),
        { ...makeParent(pick(NAME_POOLS[region], rng), 30, 55, rng), id: "step_parent" },
        makeSibling(pick(NAME_POOLS[region], rng), rng),
      ],
      happinessModifier: -5,
      stressModifier: 5,
      relationshipsModifier: 0,
    },
    weight: 10,
  },
  {
    value: {
      id: "foster_institutional",
      relationships: (region, rng) => [
        {
          id: "caregiver",
          name: pick(NAME_POOLS[region], rng),
          type: "professional" as const,
          closeness: randomInt(20, 40, rng),
          status: "active" as const,
          traits: [],
          metAge: 0,
          history: [],
        },
      ],
      happinessModifier: -15,
      stressModifier: 20,
      relationshipsModifier: 0,
    },
    weight: 5,
  },
];

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate randomized starting conditions for a new life.
 *
 * @param rng Optional random number generator (0-1). Defaults to Math.random.
 */
export function generateStartingConditions(
  rng: () => number = Math.random
): CharacterState {
  // 1. Roll components
  const region = weightedRandom(REGIONS, rng);
  const socioeconomicClass = weightedRandom(CLASSES, rng);
  const familyStructure = weightedRandom(FAMILY_STRUCTURES, rng);
  const healthRoll = weightedRandom(HEALTH_LOTTERY, rng);

  // 2. Generate name and location
  const names = NAME_POOLS[region];
  const locations = REGION_LOCATIONS[region];
  const characterName = pick(names, rng);
  const location = pick(locations, rng);
  const gender: Gender = pick(["male", "female", "nonbinary"] as const, rng);

  // 3. Generate family relationships
  const familyRelationships = familyStructure.relationships(region, rng);

  // 4. Generate siblings
  const siblingCount = weightedRandom([
    { value: 0, weight: 30 },
    { value: 1, weight: 35 },
    { value: 2, weight: 25 },
    { value: 3, weight: 10 },
  ], rng);
  for (let i = 0; i < siblingCount; i++) {
    familyRelationships.push(makeSibling(pick(names, rng), rng));
  }

  // 5. Calculate parent trait spectrum seeds
  const spectrumSeeds: Partial<PersonalitySpectrums> = {};
  const parentTraits: ParentTrait[] = [];

  for (const rel of familyRelationships) {
    if (rel.type === "family" && rel.id.startsWith("parent_")) {
      const pt: ParentTrait = { name: rel.name, spectrums: {} };
      const ptSpectrums: Partial<PersonalitySpectrums> = {};
      for (const trait of rel.traits) {
        const mapping = TRAIT_SPECTRUM_MAP[trait];
        if (mapping) {
          const current = spectrumSeeds[mapping.spectrum] ?? 0;
          spectrumSeeds[mapping.spectrum] = current + mapping.delta;
          ptSpectrums[mapping.spectrum] = (ptSpectrums[mapping.spectrum] ?? 0) + mapping.delta;
        }
      }
      parentTraits.push({ ...pt, spectrums: ptSpectrums });
    }
  }

  // Clamp seeds to ±15
  const spectrums: PersonalitySpectrums = {
    courage: clamp(spectrumSeeds.courage ?? 0, -15, 15),
    generosity: clamp(spectrumSeeds.generosity ?? 0, -15, 15),
    sociability: clamp(spectrumSeeds.sociability ?? 0, -15, 15),
    ambition: clamp(spectrumSeeds.ambition ?? 0, -15, 15),
    empathy: clamp(spectrumSeeds.empathy ?? 0, -15, 15),
    conformity: clamp(spectrumSeeds.conformity ?? 0, -15, 15),
  };

  // 6. Calculate starting attributes
  const classRange = CLASS_RANGES[socioeconomicClass];
  const regionWealthMod = REGION_WEALTH_MODIFIER[region] ?? 0;

  const activeRels = familyRelationships.filter((r) => r.status === "active");
  const avgCloseness = activeRels.length > 0
    ? Math.round(activeRels.reduce((s, r) => s + r.closeness, 0) / activeRels.length)
    : 0;

  const attributes: LifeAttributes = {
    health: randomInt(healthRoll.range[0], healthRoll.range[1], rng),
    wealth: clamp(randomInt(classRange.wealth[0], classRange.wealth[1], rng) + regionWealthMod, 0, 100),
    education: randomInt(classRange.education[0], classRange.education[1], rng),
    career: 0,
    relationships: avgCloseness,
    happiness: clamp(50 + familyStructure.happinessModifier + randomInt(-10, 10, rng), 0, 100),
    stress: clamp(randomInt(classRange.stress[0], classRange.stress[1], rng) + familyStructure.stressModifier, 0, 100),
  };

  // 7. Starting tags
  const tags: LifeTag[] = [
    { id: `region_${region}`, category: "life_event" as TagCategory, earnedAtAge: 0 },
    { id: `class_${socioeconomicClass}`, category: "life_event" as TagCategory, earnedAtAge: 0 },
    { id: `family_${familyStructure.id}`, category: "family" as TagCategory, earnedAtAge: 0 },
  ];
  if (healthRoll.tag) {
    tags.push({ id: healthRoll.tag, category: "life_event" as TagCategory, earnedAtAge: 0 });
  }

  // 8. Build identity
  const familyBackground: FamilyBackground = {
    parentTraits,
    originClass: socioeconomicClass,
    originLocation: location,
  };

  const identity: Identity = {
    name: characterName,
    gender,
    birthYear: 2000 + randomInt(-30, 10, rng),
    currentAge: 0,
    location,
    familyBackground,
    socioeconomicClass,
  };

  return {
    identity,
    spectrums,
    attributes,
    tags,
    relationships: familyRelationships,
  };
}
