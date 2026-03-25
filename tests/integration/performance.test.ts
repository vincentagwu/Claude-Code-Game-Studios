/**
 * Performance verification — tick processing speed and memory.
 *
 * Targets:
 * - Year tick processing: < 5ms per tick
 * - Full life simulation: < 500ms total
 * - Epitaph generation: < 10ms
 */

import { useGameStore } from "../../src/game/state/useGameStore";
import { generateStartingConditions } from "../../src/game/state/startingConditions";
import { processYearTick, resetEntryCounter } from "../../src/game/engine/timelineEngine";
import { createEventHistory } from "../../src/game/engine/lifeEventGenerator";
import { generateEpitaph } from "../../src/game/engine/epitaphGenerator";
import { serialize, deserialize } from "../../src/game/state/serialization";
import { MINOR_EVENT_TEMPLATES } from "../../src/game/data/minorEvents";
import { MAJOR_EVENTS } from "../../src/game/data/majorEvents";
import { FALLBACK_EVENTS } from "../../src/game/data/fallbackEvents";
import { RELATIONSHIP_MAJOR_EVENTS } from "../../src/game/data/relationshipMajorEvents";
import { RELATIONSHIP_MINOR_EVENTS } from "../../src/game/data/relationshipMinorEvents";
import type { LifeEvent } from "../../src/game/events/types";
import type { DelayedEffect } from "../../src/game/state/types";

const EVENT_POOL: readonly LifeEvent[] = [
  ...MINOR_EVENT_TEMPLATES,
  ...MAJOR_EVENTS,
  ...RELATIONSHIP_MAJOR_EVENTS,
  ...RELATIONSHIP_MINOR_EVENTS,
  ...FALLBACK_EVENTS,
];

function makeSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

describe("performance", () => {
  it("full life simulation completes in < 500ms", () => {
    const rng = makeSeededRng(42);
    const start = generateStartingConditions(rng);
    useGameStore.getState().initializeCharacter(start);
    resetEntryCounter();

    let history = createEventHistory();
    let delayedEffects: DelayedEffect[] = [];

    const startTime = performance.now();

    for (let year = 0; year < 120; year++) {
      const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
        EVENT_POOL, history, delayedEffects, rng
      );
      history = updatedHistory;
      delayedEffects = updatedDelayedEffects;
      if (result.isDead) break;
    }

    const elapsed = performance.now() - startTime;
    expect(elapsed).toBeLessThan(500);
  });

  it("individual tick completes in < 5ms (average)", () => {
    const rng = makeSeededRng(99);
    const start = generateStartingConditions(rng);
    useGameStore.getState().initializeCharacter(start);
    resetEntryCounter();

    let history = createEventHistory();
    let delayedEffects: DelayedEffect[] = [];
    let tickCount = 0;

    const startTime = performance.now();

    for (let year = 0; year < 120; year++) {
      const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
        EVENT_POOL, history, delayedEffects, rng
      );
      history = updatedHistory;
      delayedEffects = updatedDelayedEffects;
      tickCount++;
      if (result.isDead) break;
    }

    const elapsed = performance.now() - startTime;
    const avgTick = elapsed / tickCount;
    expect(avgTick).toBeLessThan(5);
  });

  it("epitaph generation completes in < 10ms", () => {
    const rng = makeSeededRng(42);
    const start = generateStartingConditions(rng);
    useGameStore.getState().initializeCharacter(start);

    // Advance to death
    resetEntryCounter();
    let history = createEventHistory();
    let delayedEffects: DelayedEffect[] = [];

    for (let year = 0; year < 120; year++) {
      const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
        EVENT_POOL, history, delayedEffects, rng
      );
      history = updatedHistory;
      delayedEffects = updatedDelayedEffects;
      if (result.isDead) break;
    }

    const char = useGameStore.getState().character!;
    const startTime = performance.now();
    generateEpitaph(char);
    const elapsed = performance.now() - startTime;

    expect(elapsed).toBeLessThan(10);
  });

  it("serialization round-trip completes in < 10ms", () => {
    const rng = makeSeededRng(42);
    const start = generateStartingConditions(rng);

    const startTime = performance.now();
    const json = serialize(start);
    deserialize(json);
    const elapsed = performance.now() - startTime;

    expect(elapsed).toBeLessThan(10);
  });
});
