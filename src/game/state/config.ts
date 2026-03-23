/**
 * Tuning knobs — externalized gameplay constants.
 *
 * All gameplay values live here, never hardcoded in logic.
 * @see design/gdd/character-state-model.md — Tuning Knobs
 */

export const TUNING = {
  // --- Personality ---
  PERSONALITY_DECAY_RATE: 1,
  PERSONALITY_INERTIA_MAX: 0.2,

  // --- Health & Aging ---
  HEALTH_BASE_AGING_RATE: 0.5,
  HEALTH_AGING_START_AGE: 40,
  HEALTH_AGING_ACCELERATION: 0.05,
  STRESS_HEALTH_RATE: 1.0,

  // --- Stress ---
  STRESS_NATURAL_RECOVERY: 2.0,
  POVERTY_STRESS_RATE: 2.0,

  // --- Happiness ---
  HAPPINESS_ADAPTATION_RATE: 1.0,
  RELATIONSHIP_HAPPINESS_RATE: 1.0,

  // --- Relationships ---
  RELATIONSHIP_PASSIVE_DECAY: 1.0,
  MAX_ACTIVE_RELATIONSHIPS: 20,

  // --- Death ---
  DEATH_BASE_RATE: 0.02,
  DEATH_START_AGE: 65,
  DEATH_ACCELERATION: 0.03,

  // --- Socioeconomic Class Thresholds ---
  WEALTH_CLASS_THRESHOLDS: { upper: 80, middle: 50, working: 25, lower: 0 },
} as const;
