/**
 * Integration test — simulate a full life from birth to death.
 *
 * Verifies: events fire, drifts apply, stage transitions happen,
 * death triggers, no crashes across an entire lifespan.
 */

import { useGameStore } from "../../src/game/state/useGameStore";
import { generateStartingConditions } from "../../src/game/state/startingConditions";
import { processYearTick, resetEntryCounter } from "../../src/game/engine/timelineEngine";
import { createEventHistory } from "../../src/game/engine/lifeEventGenerator";
import { MINOR_EVENT_TEMPLATES } from "../../src/game/data/minorEvents";
import { MAJOR_EVENTS } from "../../src/game/data/majorEvents";
import { EARLY_LIFE_EVENTS } from "../../src/game/data/earlyLifeEvents";
import { FALLBACK_EVENTS } from "../../src/game/data/fallbackEvents";
import { LATER_MINOR_EVENTS, LATER_MAJOR_EVENTS_EXPORT } from "../../src/game/data/laterLifeEvents";
import type { LifeEvent } from "../../src/game/events/types";
import type { DelayedEffect } from "../../src/game/state/types";

const ALL_EVENTS: readonly LifeEvent[] = [
  ...EARLY_LIFE_EVENTS,
  ...MINOR_EVENT_TEMPLATES,
  ...MAJOR_EVENTS,
  ...LATER_MINOR_EVENTS,
  ...LATER_MAJOR_EVENTS_EXPORT,
  ...FALLBACK_EVENTS,
];

// Seeded rng for deterministic tests
function makeSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

beforeEach(() => {
  useGameStore.setState({
    character: null,
    spectrumsReinforcedThisYear: new Set(),
    relationshipsActiveThisYear: new Set(),
  });
  resetEntryCounter();
});

describe("full life simulation", () => {
  it("simulates a complete life from birth to death without crashing", () => {
    const rng = makeSeededRng(42);
    const startState = generateStartingConditions(rng);
    useGameStore.getState().initializeCharacter(startState);

    let history = createEventHistory();
    let delayedEffects: DelayedEffect[] = [];
    let totalEntries = 0;
    let isDead = false;
    let stageTransitions = 0;
    let majorEvents = 0;
    let yearsTicked = 0;

    // Run up to 120 years (safety cap)
    for (let year = 0; year < 120 && !isDead; year++) {
      const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
        ALL_EVENTS,
        history,
        delayedEffects,
        rng
      );

      history = updatedHistory;
      delayedEffects = updatedDelayedEffects;
      totalEntries += result.entries.length;
      isDead = result.isDead;
      yearsTicked++;

      if (result.stageChanged) stageTransitions++;
      majorEvents += result.entries.filter((e) => e.type === "major_event").length;

      // Verify state is always valid
      const char = useGameStore.getState().character!;
      expect(char.identity.currentAge).toBe(year + 1);

      // Attributes should always be in valid range
      for (const val of Object.values(char.attributes)) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      }

      // Spectrums should always be in valid range
      for (const val of Object.values(char.spectrums)) {
        expect(val).toBeGreaterThanOrEqual(-100);
        expect(val).toBeLessThanOrEqual(100);
      }
    }

    // Life must end (death must trigger before 120)
    expect(isDead).toBe(true);

    // Should have lived at least into adulthood
    expect(yearsTicked).toBeGreaterThan(40);

    // Should have had stage transitions
    expect(stageTransitions).toBeGreaterThan(3);

    // Should have generated events
    expect(totalEntries).toBeGreaterThan(50);
  });

  it("different seeds produce different lives", () => {
    const results: { name: string; deathAge: number; tags: number }[] = [];

    for (const seed of [1, 2, 3, 4, 5]) {
      const rng = makeSeededRng(seed);
      const startState = generateStartingConditions(rng);
      useGameStore.getState().initializeCharacter(startState);

      let history = createEventHistory();
      let delayedEffects: DelayedEffect[] = [];
      let isDead = false;

      for (let year = 0; year < 120 && !isDead; year++) {
        const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
          ALL_EVENTS, history, delayedEffects, rng
        );
        history = updatedHistory;
        delayedEffects = updatedDelayedEffects;
        isDead = result.isDead;
      }

      const char = useGameStore.getState().character!;
      results.push({
        name: char.identity.name,
        deathAge: char.identity.currentAge,
        tags: char.tags.length,
      });

      resetEntryCounter();
    }

    // Not all lives should be identical
    const uniqueNames = new Set(results.map((r) => r.name));
    expect(uniqueNames.size).toBeGreaterThan(1);

    // Death ages should vary
    const uniqueAges = new Set(results.map((r) => r.deathAge));
    expect(uniqueAges.size).toBeGreaterThan(1);
  });

  it("all life stages are visited in a full life", () => {
    const rng = makeSeededRng(99);
    const startState = generateStartingConditions(rng);
    useGameStore.getState().initializeCharacter(startState);

    let history = createEventHistory();
    let delayedEffects: DelayedEffect[] = [];
    const stagesVisited = new Set<string>();

    for (let year = 0; year < 120; year++) {
      const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
        ALL_EVENTS, history, delayedEffects, rng
      );
      history = updatedHistory;
      delayedEffects = updatedDelayedEffects;

      if (result.stageChanged && result.newStage) {
        stagesVisited.add(result.newStage.name);
      }

      if (result.isDead) break;
    }

    // Should visit at least childhood through adult
    expect(stagesVisited.has("earlyChildhood")).toBe(true);
    expect(stagesVisited.has("childhood")).toBe(true);
    expect(stagesVisited.has("adolescence")).toBe(true);
    expect(stagesVisited.has("youngAdult")).toBe(true);
    expect(stagesVisited.has("adult")).toBe(true);
  });
});
