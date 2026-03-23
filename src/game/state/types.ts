/**
 * Character State Model — TypeScript type definitions
 *
 * Central data structure representing a human life at any point in time.
 * All values are numeric internally; the player sees qualitative labels.
 *
 * @see design/gdd/character-state-model.md
 */

// ---------------------------------------------------------------------------
// Layer 1: Identity
// ---------------------------------------------------------------------------

export type Gender = "male" | "female" | "nonbinary";

export type SocioeconomicClass = "lower" | "working" | "middle" | "upper";

/** Immutable snapshot of the character's parents and upbringing. */
export interface FamilyBackground {
  readonly parentTraits: readonly ParentTrait[];
  readonly originClass: SocioeconomicClass;
  readonly originLocation: string;
}

export interface ParentTrait {
  readonly name: string;
  readonly spectrums: Partial<Readonly<PersonalitySpectrums>>;
}

export interface Identity {
  readonly name: string;
  gender: Gender;
  readonly birthYear: number;
  currentAge: number;
  location: string;
  readonly familyBackground: FamilyBackground;
  socioeconomicClass: SocioeconomicClass;
}

// ---------------------------------------------------------------------------
// Layer 2: Personality Spectrums
// ---------------------------------------------------------------------------

/** Each axis ranges from -100 (left pole) to +100 (right pole). */
export interface PersonalitySpectrums {
  /** -100 Cautious ↔ +100 Brave */
  courage: number;
  /** -100 Selfish ↔ +100 Generous */
  generosity: number;
  /** -100 Introverted ↔ +100 Social */
  sociability: number;
  /** -100 Content ↔ +100 Ambitious */
  ambition: number;
  /** -100 Detached ↔ +100 Empathetic */
  empathy: number;
  /** -100 Rebellious ↔ +100 Conformist */
  conformity: number;
}

export type SpectrumName = keyof PersonalitySpectrums;

// ---------------------------------------------------------------------------
// Layer 3: Life Attributes
// ---------------------------------------------------------------------------

/** Each attribute ranges from 0 to 100. */
export interface LifeAttributes {
  health: number;
  wealth: number;
  education: number;
  career: number;
  relationships: number;
  happiness: number;
  stress: number;
}

export type AttributeName = keyof LifeAttributes;

// ---------------------------------------------------------------------------
// Layer 4: Life Tags
// ---------------------------------------------------------------------------

export type TagCategory =
  | "education"
  | "family"
  | "career"
  | "life_event";

export interface LifeTag {
  readonly id: string;
  readonly category: TagCategory;
  /** Age when this tag was earned. */
  readonly earnedAtAge: number;
}

// ---------------------------------------------------------------------------
// Layer 5: Relationships
// ---------------------------------------------------------------------------

export type RelationshipType =
  | "family"
  | "friend"
  | "romantic"
  | "professional"
  | "rival";

export type RelationshipStatus = "active" | "estranged" | "deceased";

export interface Relationship {
  readonly id: string;
  readonly name: string;
  readonly type: RelationshipType;
  closeness: number;
  status: RelationshipStatus;
  readonly traits: readonly string[];
  readonly metAge: number;
  readonly history: string[];
}

// ---------------------------------------------------------------------------
// Layer 6: Derived Flags
// ---------------------------------------------------------------------------

/** Boolean gates derived from Layers 1-5. Recomputed, never stored. */
export interface DerivedFlags {
  readonly isEmployed: boolean;
  readonly isMarried: boolean;
  readonly hasChildren: boolean;
  readonly hasDebt: boolean;
  readonly ownsHome: boolean;
  readonly hasCriminalRecord: boolean;
  readonly isRetired: boolean;
}

// ---------------------------------------------------------------------------
// Effects: State modification operations
// ---------------------------------------------------------------------------

/** How an attribute value is modified. */
export type EffectOperation = "add" | "multiply" | "set";

/** A single attribute modification. */
export interface AttributeEffect {
  readonly type: "attribute";
  readonly target: AttributeName;
  readonly operation: EffectOperation;
  readonly value: number;
}

/** A personality spectrum shift. Inertia is applied automatically. */
export interface SpectrumEffect {
  readonly type: "spectrum";
  readonly target: SpectrumName;
  readonly delta: number;
}

/** Adds a tag to the character's life story. */
export interface TagEffect {
  readonly type: "tag";
  readonly tagId: string;
  readonly category: TagCategory;
}

/** Modifies a relationship's closeness or status. */
export interface RelationshipEffect {
  readonly type: "relationship";
  readonly relationshipId: string;
  readonly closenessChange?: number;
  readonly newStatus?: RelationshipStatus;
}

/** Union of all effect types that can be applied to a character. */
export type Effect =
  | AttributeEffect
  | SpectrumEffect
  | TagEffect
  | RelationshipEffect;

// ---------------------------------------------------------------------------
// Delayed Effects: future consequence queue
// ---------------------------------------------------------------------------

/** A scheduled effect that fires at a future age. */
export interface DelayedEffect {
  readonly id: string;
  readonly sourceEventId: string;
  readonly sourceChoiceId: string;
  readonly sourceAge: number;
  readonly targetAge: number;
  readonly effect: Effect;
  /** 0-1, chance this actually fires. Default 1.0. */
  readonly probability: number;
  /** Narrative text connecting this to the original choice. */
  readonly narrative: string;
  fired: boolean;
  expired: boolean;
}

// ---------------------------------------------------------------------------
// Composite: Full Character State
// ---------------------------------------------------------------------------

export interface CharacterState {
  identity: Identity;
  spectrums: PersonalitySpectrums;
  attributes: LifeAttributes;
  tags: LifeTag[];
  relationships: Relationship[];
}
