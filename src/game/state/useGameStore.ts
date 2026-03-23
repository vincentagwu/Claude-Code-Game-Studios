/**
 * Zustand game store — central state management for LifePath.
 *
 * Implements CharacterState as the core slice with actions for applying
 * effects, passive drifts, and flag recalculation.
 *
 * @see design/gdd/character-state-model.md
 * @see docs/architecture/ADR-001 (Zustand)
 */

import { create } from "zustand";
import type {
  CharacterState,
  DerivedFlags,
  Effect,
  AttributeName,
  SpectrumName,
  SocioeconomicClass,
} from "./types";
import { TUNING } from "./config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a value between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Determine socioeconomic class from wealth value. */
function classFromWealth(wealth: number): SocioeconomicClass {
  const t = TUNING.WEALTH_CLASS_THRESHOLDS;
  if (wealth >= t.upper) return "upper";
  if (wealth >= t.middle) return "middle";
  if (wealth >= t.working) return "working";
  return "lower";
}

/**
 * Apply personality inertia for opposite-direction shifts.
 * Same-direction deltas apply at full strength.
 */
function applyInertia(currentValue: number, delta: number): number {
  const isOpposite =
    (delta > 0 && currentValue < 0) || (delta < 0 && currentValue > 0);
  if (!isOpposite) return delta;

  const inertiaFactor =
    1.0 - TUNING.PERSONALITY_INERTIA_MAX * (Math.abs(currentValue) / 100);
  return Math.round(delta * inertiaFactor);
}

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

interface GameStore {
  /** The active character's state. Null when no life is in progress. */
  character: CharacterState | null;

  /**
   * Tracks which spectrums were modified this year (by choices).
   * Reset each year tick. Spectrums not in this set decay passively.
   */
  spectrumsReinforcedThisYear: Set<SpectrumName>;

  /**
   * Tracks which relationships had events this year.
   * Non-family relationships not in this set decay passively.
   */
  relationshipsActiveThisYear: Set<string>;

  // --- Actions ---

  /** Initialize a new character (called by Starting Conditions Generator). */
  initializeCharacter: (state: CharacterState) => void;

  /** Apply a single effect to the character state. */
  applyEffect: (effect: Effect) => void;

  /** Apply all passive drifts for one year tick. */
  applyPassiveDrifts: () => void;

  /** Recalculate derived flags from current state. */
  recalculateFlags: () => DerivedFlags;

  /** Reset the yearly tracking sets (called at start of each year). */
  resetYearTracking: () => void;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useGameStore = create<GameStore>()((set, get) => ({
  character: null,
  spectrumsReinforcedThisYear: new Set(),
  relationshipsActiveThisYear: new Set(),

  initializeCharacter: (state) => {
    set({
      character: state,
      spectrumsReinforcedThisYear: new Set(),
      relationshipsActiveThisYear: new Set(),
    });
  },

  applyEffect: (effect) => {
    const { character } = get();
    if (!character) return;

    switch (effect.type) {
      case "attribute": {
        const attr = effect.target;
        let value = character.attributes[attr];

        switch (effect.operation) {
          case "add":
            value += effect.value;
            break;
          case "multiply":
            value *= effect.value;
            break;
          case "set":
            value = effect.value;
            break;
        }

        set({
          character: {
            ...character,
            attributes: {
              ...character.attributes,
              [attr]: clamp(Math.round(value), 0, 100),
            },
            identity: attr === ("wealth" as AttributeName)
              ? {
                  ...character.identity,
                  socioeconomicClass: classFromWealth(
                    clamp(Math.round(value), 0, 100)
                  ),
                }
              : character.identity,
          },
        });
        break;
      }

      case "spectrum": {
        const spectrum = effect.target;
        const current = character.spectrums[spectrum];
        const effectiveDelta = applyInertia(current, effect.delta);

        set({
          character: {
            ...character,
            spectrums: {
              ...character.spectrums,
              [spectrum]: clamp(current + effectiveDelta, -100, 100),
            },
          },
        });

        // Track that this spectrum was reinforced this year
        get().spectrumsReinforcedThisYear.add(spectrum);
        break;
      }

      case "tag": {
        const alreadyHas = character.tags.some((t) => t.id === effect.tagId);
        if (alreadyHas) return;

        set({
          character: {
            ...character,
            tags: [
              ...character.tags,
              {
                id: effect.tagId,
                category: effect.category,
                earnedAtAge: character.identity.currentAge,
              },
            ],
          },
        });
        break;
      }

      case "relationship": {
        const relationships = character.relationships.map((r) => {
          if (r.id !== effect.relationshipId) return r;

          let closeness = r.closeness;
          if (effect.closenessChange !== undefined) {
            closeness = clamp(closeness + effect.closenessChange, 0, 100);
          }

          let status = effect.newStatus ?? r.status;
          // Auto-estrange at closeness < 10
          if (closeness < 10 && status === "active") {
            status = "estranged";
          }

          return { ...r, closeness, status };
        });

        set({
          character: { ...character, relationships },
        });

        // Track relationship activity
        get().relationshipsActiveThisYear.add(effect.relationshipId);
        break;
      }
    }
  },

  applyPassiveDrifts: () => {
    const { character, spectrumsReinforcedThisYear, relationshipsActiveThisYear } =
      get();
    if (!character) return;

    const age = character.identity.currentAge;
    const attrs = { ...character.attributes };
    const spectrums = { ...character.spectrums };
    const relationships = character.relationships.map((r) => ({ ...r }));

    // --- Attribute passive drifts ---

    // Health aging after HEALTH_AGING_START_AGE
    if (age >= TUNING.HEALTH_AGING_START_AGE) {
      let agingMultiplier = 1.0;
      if (age > 60) {
        agingMultiplier = 1.0 + (age - 60) * TUNING.HEALTH_AGING_ACCELERATION;
      }
      attrs.health -= TUNING.HEALTH_BASE_AGING_RATE * agingMultiplier;
    }

    // Stress → Health penalty
    if (attrs.stress > 80) {
      attrs.health -= TUNING.STRESS_HEALTH_RATE;
    }

    // Stress natural recovery
    attrs.stress -= TUNING.STRESS_NATURAL_RECOVERY;

    // Poverty → Stress
    if (attrs.wealth < 20) {
      attrs.stress += TUNING.POVERTY_STRESS_RATE;
    }

    // Happiness hedonic adaptation
    if (attrs.happiness > 70) {
      attrs.happiness -= TUNING.HAPPINESS_ADAPTATION_RATE;
    } else if (attrs.happiness < 30) {
      attrs.happiness += TUNING.HAPPINESS_ADAPTATION_RATE;
    }

    // Relationships → Happiness bonus
    if (attrs.relationships > 60) {
      attrs.happiness += TUNING.RELATIONSHIP_HAPPINESS_RATE;
    }

    // Clamp all attributes
    for (const key of Object.keys(attrs) as AttributeName[]) {
      attrs[key] = clamp(Math.round(attrs[key]), 0, 100);
    }

    // --- Personality passive decay ---
    for (const key of Object.keys(spectrums) as SpectrumName[]) {
      if (spectrumsReinforcedThisYear.has(key)) continue;
      const val = spectrums[key];
      if (val === 0) continue;
      spectrums[key] = val > 0
        ? val - TUNING.PERSONALITY_DECAY_RATE
        : val + TUNING.PERSONALITY_DECAY_RATE;
    }

    // --- Relationship passive decay ---
    for (const r of relationships) {
      if (r.status !== "active") continue;
      if (r.type === "family") continue;
      if (relationshipsActiveThisYear.has(r.id)) continue;

      r.closeness = clamp(
        r.closeness - TUNING.RELATIONSHIP_PASSIVE_DECAY,
        0,
        100
      );
      if (r.closeness < 10) {
        r.status = "estranged";
      }
    }

    // --- Derive relationships attribute from active relationships ---
    const activeRels = relationships.filter((r) => r.status === "active");
    attrs.relationships =
      activeRels.length > 0
        ? Math.round(
            activeRels.reduce((sum, r) => sum + r.closeness, 0) /
              activeRels.length
          )
        : 0;

    // --- Update socioeconomic class ---
    const socioeconomicClass = classFromWealth(attrs.wealth);

    set({
      character: {
        ...character,
        attributes: attrs,
        spectrums,
        relationships,
        identity: {
          ...character.identity,
          socioeconomicClass,
        },
      },
    });
  },

  recalculateFlags: (): DerivedFlags => {
    const { character } = get();
    if (!character) {
      return {
        isEmployed: false,
        isMarried: false,
        hasChildren: false,
        hasDebt: false,
        ownsHome: false,
        hasCriminalRecord: false,
        isRetired: false,
      };
    }

    const hasTag = (id: string) => character.tags.some((t) => t.id === id);

    return {
      isEmployed: character.attributes.career > 20 && !hasTag("fired") && !hasTag("retired"),
      isMarried: hasTag("married") && !hasTag("divorced") && !hasTag("widowed"),
      hasChildren: hasTag("parent"),
      hasDebt: character.attributes.wealth < 30 && hasTag("debt"),
      ownsHome: character.attributes.wealth > 50 && hasTag("homeowner"),
      hasCriminalRecord: hasTag("criminal_record"),
      isRetired: hasTag("retired"),
    };
  },

  resetYearTracking: () => {
    set({
      spectrumsReinforcedThisYear: new Set(),
      relationshipsActiveThisYear: new Set(),
    });
  },
}));
