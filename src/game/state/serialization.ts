/**
 * State serialization — serialize/deserialize CharacterState to/from JSON.
 *
 * Handles graceful defaults for missing or corrupted fields so that
 * a partial save is always recoverable.
 *
 * @see design/gdd/save-state-persistence.md
 * @see design/gdd/character-state-model.md — Edge Cases (save corruption)
 */

import type {
  CharacterState,
  Identity,
  PersonalitySpectrums,
  LifeAttributes,
  LifeTag,
  Relationship,
  Gender,
  SocioeconomicClass,
  FamilyBackground,
  RelationshipStatus,
  RelationshipType,
  TagCategory,
} from "./types";

// ---------------------------------------------------------------------------
// Serialize
// ---------------------------------------------------------------------------

/** Serialize a CharacterState to a JSON string. */
export function serialize(state: CharacterState): string {
  return JSON.stringify(state);
}

// ---------------------------------------------------------------------------
// Deserialize with defaults
// ---------------------------------------------------------------------------

const DEFAULT_SPECTRUMS: PersonalitySpectrums = {
  courage: 0,
  generosity: 0,
  sociability: 0,
  ambition: 0,
  empathy: 0,
  conformity: 0,
};

const DEFAULT_ATTRIBUTES: LifeAttributes = {
  health: 50,
  wealth: 50,
  education: 50,
  career: 50,
  relationships: 50,
  happiness: 50,
  stress: 50,
};

const VALID_GENDERS: Gender[] = ["male", "female", "nonbinary"];
const VALID_CLASSES: SocioeconomicClass[] = ["lower", "working", "middle", "upper"];
const VALID_REL_TYPES: RelationshipType[] = ["family", "friend", "romantic", "professional", "rival"];
const VALID_REL_STATUSES: RelationshipStatus[] = ["active", "estranged", "deceased"];
const VALID_TAG_CATEGORIES: TagCategory[] = ["education", "family", "career", "life_event"];

/**
 * Deserialize a JSON string to a CharacterState.
 * Applies graceful defaults for any missing or invalid fields.
 * Never throws — returns a valid state even from corrupted input.
 */
export function deserialize(json: string): CharacterState {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json) as Record<string, unknown>;
  } catch {
    return makeDefaultState();
  }

  if (typeof raw !== "object" || raw === null) {
    return makeDefaultState();
  }

  return {
    identity: parseIdentity(raw.identity),
    spectrums: parseSpectrums(raw.spectrums),
    attributes: parseAttributes(raw.attributes),
    tags: parseTags(raw.tags),
    relationships: parseRelationships(raw.relationships),
  };
}

// ---------------------------------------------------------------------------
// Field parsers with defaults
// ---------------------------------------------------------------------------

function parseIdentity(raw: unknown): Identity {
  const obj = asObject(raw);
  return {
    name: asString(obj.name, "Unknown"),
    gender: asEnum(obj.gender, VALID_GENDERS, "nonbinary"),
    birthYear: asNumber(obj.birthYear, 2000),
    currentAge: asNumber(obj.currentAge, 0),
    location: asString(obj.location, "Unknown"),
    familyBackground: parseFamilyBackground(obj.familyBackground),
    socioeconomicClass: asEnum(obj.socioeconomicClass, VALID_CLASSES, "middle"),
  };
}

function parseFamilyBackground(raw: unknown): FamilyBackground {
  const obj = asObject(raw);
  return {
    parentTraits: Array.isArray(obj.parentTraits) ? obj.parentTraits : [],
    originClass: asEnum(obj.originClass, VALID_CLASSES, "middle"),
    originLocation: asString(obj.originLocation, "Unknown"),
  };
}

function parseSpectrums(raw: unknown): PersonalitySpectrums {
  const obj = asObject(raw);
  return {
    courage: clampSpectrum(asNumber(obj.courage, DEFAULT_SPECTRUMS.courage)),
    generosity: clampSpectrum(asNumber(obj.generosity, DEFAULT_SPECTRUMS.generosity)),
    sociability: clampSpectrum(asNumber(obj.sociability, DEFAULT_SPECTRUMS.sociability)),
    ambition: clampSpectrum(asNumber(obj.ambition, DEFAULT_SPECTRUMS.ambition)),
    empathy: clampSpectrum(asNumber(obj.empathy, DEFAULT_SPECTRUMS.empathy)),
    conformity: clampSpectrum(asNumber(obj.conformity, DEFAULT_SPECTRUMS.conformity)),
  };
}

function parseAttributes(raw: unknown): LifeAttributes {
  const obj = asObject(raw);
  return {
    health: clampAttribute(asNumber(obj.health, DEFAULT_ATTRIBUTES.health)),
    wealth: clampAttribute(asNumber(obj.wealth, DEFAULT_ATTRIBUTES.wealth)),
    education: clampAttribute(asNumber(obj.education, DEFAULT_ATTRIBUTES.education)),
    career: clampAttribute(asNumber(obj.career, DEFAULT_ATTRIBUTES.career)),
    relationships: clampAttribute(asNumber(obj.relationships, DEFAULT_ATTRIBUTES.relationships)),
    happiness: clampAttribute(asNumber(obj.happiness, DEFAULT_ATTRIBUTES.happiness)),
    stress: clampAttribute(asNumber(obj.stress, DEFAULT_ATTRIBUTES.stress)),
  };
}

function parseTags(raw: unknown): LifeTag[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .filter((item) => typeof item.id === "string")
    .map((item) => ({
      id: item.id as string,
      category: asEnum(item.category, VALID_TAG_CATEGORIES, "life_event"),
      earnedAtAge: asNumber(item.earnedAtAge, 0),
    }));
}

function parseRelationships(raw: unknown): Relationship[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .filter((item) => typeof item.id === "string")
    .map((item) => ({
      id: item.id as string,
      name: asString(item.name, "Unknown"),
      type: asEnum(item.type, VALID_REL_TYPES, "friend"),
      closeness: clampAttribute(asNumber(item.closeness, 50)),
      status: asEnum(item.status, VALID_REL_STATUSES, "active"),
      traits: Array.isArray(item.traits)
        ? item.traits.filter((t): t is string => typeof t === "string")
        : [],
      metAge: asNumber(item.metAge, 0),
      history: Array.isArray(item.history)
        ? item.history.filter((h): h is string => typeof h === "string")
        : [],
    }));
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function makeDefaultState(): CharacterState {
  return {
    identity: parseIdentity(undefined),
    spectrums: { ...DEFAULT_SPECTRUMS },
    attributes: { ...DEFAULT_ATTRIBUTES },
    tags: [],
    relationships: [],
  };
}

function asObject(val: unknown): Record<string, unknown> {
  return typeof val === "object" && val !== null
    ? (val as Record<string, unknown>)
    : {};
}

function asString(val: unknown, fallback: string): string {
  return typeof val === "string" ? val : fallback;
}

function asNumber(val: unknown, fallback: number): number {
  return typeof val === "number" && !Number.isNaN(val) ? val : fallback;
}

function asEnum<T extends string>(val: unknown, valid: T[], fallback: T): T {
  return typeof val === "string" && valid.includes(val as T)
    ? (val as T)
    : fallback;
}

function clampAttribute(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clampSpectrum(value: number): number {
  return Math.min(100, Math.max(-100, Math.round(value)));
}
