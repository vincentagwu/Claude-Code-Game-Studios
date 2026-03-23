/**
 * Life Stage Definitions — configuration data for the 8 phases of life.
 *
 * Pure data consumed by Timeline Engine, Life Event Generator,
 * Event Presentation Layer, and Audio Manager.
 *
 * @see design/gdd/life-stage-definitions.md
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgencyLevel =
  | "none"
  | "minimal"
  | "low"
  | "medium"
  | "full"
  | "declining";

export type StageName =
  | "infancy"
  | "earlyChildhood"
  | "childhood"
  | "adolescence"
  | "youngAdult"
  | "adult"
  | "midlife"
  | "elder";

export interface EventDensity {
  /** Minimum minor events generated per year. */
  readonly minEventsPerYear: number;
  /** Maximum minor events generated per year. */
  readonly maxEventsPerYear: number;
  /** Target total major events across the entire stage. */
  readonly majorEventBudget: [min: number, max: number];
}

export interface ThemeTokens {
  readonly prefix: string;
  readonly primaryColor: string;
  readonly backgroundColor: string;
  readonly typographyWeight: "light" | "regular" | "medium" | "bold";
}

export interface LifeStage {
  readonly name: StageName;
  readonly displayName: string;
  readonly ageRange: [start: number, end: number];
  readonly yearsPerMinute: number;
  readonly agencyLevel: AgencyLevel;
  readonly eventDensity: EventDensity;
  readonly themeTokens: ThemeTokens;
  readonly eventCategories: readonly string[];
}

// ---------------------------------------------------------------------------
// Stage definitions (per ADR-003: TypeScript data files)
// ---------------------------------------------------------------------------

export const STAGES: readonly LifeStage[] = [
  {
    name: "infancy",
    displayName: "Infancy",
    ageRange: [0, 2],
    yearsPerMinute: 6.0,
    agencyLevel: "none",
    eventDensity: {
      minEventsPerYear: 1,
      maxEventsPerYear: 2,
      majorEventBudget: [0, 1],
    },
    themeTokens: {
      prefix: "THEME_INFANCY",
      primaryColor: "#F4C2C2",
      backgroundColor: "#FFF8F0",
      typographyWeight: "light",
    },
    eventCategories: [
      "family_dynamics",
      "health_milestones",
      "temperament_seeds",
    ],
  },
  {
    name: "earlyChildhood",
    displayName: "Early Childhood",
    ageRange: [3, 5],
    yearsPerMinute: 4.0,
    agencyLevel: "minimal",
    eventDensity: {
      minEventsPerYear: 2,
      maxEventsPerYear: 3,
      majorEventBudget: [0, 1],
    },
    themeTokens: {
      prefix: "THEME_EARLY_CHILD",
      primaryColor: "#FFD700",
      backgroundColor: "#FFFFF0",
      typographyWeight: "regular",
    },
    eventCategories: [
      "preschool",
      "sibling_rivalry",
      "early_fears",
      "first_friendships",
    ],
  },
  {
    name: "childhood",
    displayName: "Childhood",
    ageRange: [6, 11],
    yearsPerMinute: 3.0,
    agencyLevel: "low",
    eventDensity: {
      minEventsPerYear: 3,
      maxEventsPerYear: 4,
      majorEventBudget: [1, 2],
    },
    themeTokens: {
      prefix: "THEME_CHILDHOOD",
      primaryColor: "#4CAF50",
      backgroundColor: "#F0FFF0",
      typographyWeight: "regular",
    },
    eventCategories: [
      "school",
      "hobbies",
      "friendships",
      "family_events",
      "bullying",
      "discovery",
    ],
  },
  {
    name: "adolescence",
    displayName: "Adolescence",
    ageRange: [12, 17],
    yearsPerMinute: 1.5,
    agencyLevel: "medium",
    eventDensity: {
      minEventsPerYear: 4,
      maxEventsPerYear: 5,
      majorEventBudget: [2, 3],
    },
    themeTokens: {
      prefix: "THEME_ADOLESCENCE",
      primaryColor: "#FF5722",
      backgroundColor: "#1A1A2E",
      typographyWeight: "bold",
    },
    eventCategories: [
      "identity",
      "romance",
      "rebellion",
      "education_choices",
      "peer_pressure",
      "first_job",
      "self_discovery",
    ],
  },
  {
    name: "youngAdult",
    displayName: "Young Adult",
    ageRange: [18, 25],
    yearsPerMinute: 1.0,
    agencyLevel: "full",
    eventDensity: {
      minEventsPerYear: 4,
      maxEventsPerYear: 6,
      majorEventBudget: [3, 4],
    },
    themeTokens: {
      prefix: "THEME_YOUNG_ADULT",
      primaryColor: "#2196F3",
      backgroundColor: "#FAFAFA",
      typographyWeight: "medium",
    },
    eventCategories: [
      "higher_education",
      "career_start",
      "independence",
      "romance",
      "travel",
      "financial_decisions",
    ],
  },
  {
    name: "adult",
    displayName: "Adult",
    ageRange: [26, 45],
    yearsPerMinute: 1.5,
    agencyLevel: "full",
    eventDensity: {
      minEventsPerYear: 3,
      maxEventsPerYear: 5,
      majorEventBudget: [2, 3],
    },
    themeTokens: {
      prefix: "THEME_ADULT",
      primaryColor: "#795548",
      backgroundColor: "#F5F0EB",
      typographyWeight: "regular",
    },
    eventCategories: [
      "career_progression",
      "marriage",
      "parenthood",
      "financial_milestones",
      "health_events",
      "crisis_events",
    ],
  },
  {
    name: "midlife",
    displayName: "Midlife",
    ageRange: [46, 60],
    yearsPerMinute: 1.0,
    agencyLevel: "full",
    eventDensity: {
      minEventsPerYear: 3,
      maxEventsPerYear: 5,
      majorEventBudget: [2, 3],
    },
    themeTokens: {
      prefix: "THEME_MIDLIFE",
      primaryColor: "#607D8B",
      backgroundColor: "#ECEFF1",
      typographyWeight: "regular",
    },
    eventCategories: [
      "career_plateau",
      "career_change",
      "relationship_evolution",
      "health_concerns",
      "existential_events",
      "empty_nest",
    ],
  },
  {
    name: "elder",
    displayName: "Elder",
    ageRange: [61, Infinity],
    yearsPerMinute: 0.8,
    agencyLevel: "declining",
    eventDensity: {
      minEventsPerYear: 2,
      maxEventsPerYear: 3,
      majorEventBudget: [1, 2],
    },
    themeTokens: {
      prefix: "THEME_ELDER",
      primaryColor: "#9E9E9E",
      backgroundColor: "#FFF3E0",
      typographyWeight: "light",
    },
    eventCategories: [
      "retirement",
      "health_decline",
      "grandchildren",
      "legacy_reflection",
      "loss_of_peers",
      "end_of_life_choices",
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the life stage for a given age. */
export function getStageForAge(age: number): LifeStage {
  for (const stage of STAGES) {
    const [start, end] = stage.ageRange;
    if (age >= start && age <= end) {
      return stage;
    }
  }
  // Fallback to elder for any age beyond defined ranges
  return STAGES[STAGES.length - 1];
}

/** Returns the next stage after the given one, or null if elder. */
export function getNextStage(current: StageName): LifeStage | null {
  const idx = STAGES.findIndex((s) => s.name === current);
  if (idx === -1 || idx >= STAGES.length - 1) return null;
  return STAGES[idx + 1];
}

/** Seconds per year tick for a given stage. */
export function getSecondsPerYear(stage: LifeStage): number {
  return 60 / stage.yearsPerMinute;
}
