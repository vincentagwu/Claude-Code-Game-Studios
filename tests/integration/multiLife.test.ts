/**
 * Integration test — multi-life tree simulation.
 *
 * Simulates 2 full lives, verifies branch points are tracked,
 * verifies a 3rd life can be started from a branch snapshot.
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
import type { LifeEvent } from "../../src/game/events/types";
import type { DelayedEffect } from "../../src/game/state/types";
import type { BranchPoint, LifeRecord } from "../../src/game/tree/types";

const EVENT_POOL: readonly LifeEvent[] = [
  ...MINOR_EVENT_TEMPLATES,
  ...MAJOR_EVENTS,
  ...FALLBACK_EVENTS,
];

function makeSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function simulateLifeWithBranches(seed: number, lifeId: string) {
  const rng = makeSeededRng(seed);
  const start = generateStartingConditions(rng);
  useGameStore.getState().initializeCharacter(start);
  resetEntryCounter();

  let history = createEventHistory();
  let delayedEffects: DelayedEffect[] = [];
  const branchPoints: BranchPoint[] = [];

  for (let year = 0; year < 120; year++) {
    const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
      EVENT_POOL, history, delayedEffects, rng
    );
    history = updatedHistory;
    delayedEffects = updatedDelayedEffects;

    // Track branch points from major events
    for (const entry of result.entries) {
      if (entry.type === "major_event" && entry.event) {
        const content = entry.event.content;
        const choices = "choices" in content ? content.choices : [];
        const branchChoices = choices.filter((c) => c.branchPoint);
        if (branchChoices.length >= 2) {
          const char = useGameStore.getState().character!;
          branchPoints.push({
            id: `bp_${lifeId}_${year}`,
            lifeId,
            age: char.identity.currentAge,
            eventId: entry.event.id,
            chosenOptionId: branchChoices[0].id,
            alternateOptionIds: branchChoices.slice(1).map((c) => c.id),
            stateSnapshot: deserialize(serialize(char)),
            explored: false,
          });
        }
      }
    }

    if (result.isDead) break;
  }

  const finalChar = useGameStore.getState().character!;
  const epitaph = generateEpitaph(finalChar);

  const record: LifeRecord = {
    id: lifeId,
    name: finalChar.identity.name,
    deathAge: finalChar.identity.currentAge,
    region: finalChar.tags.find((t) => t.id.startsWith("region_"))?.id ?? "unknown",
    epitaph,
    branchPoints,
    completedAt: Date.now(),
  };

  return record;
}

describe("multi-life tree simulation", () => {
  it("simulates 2 lives and creates valid life records", () => {
    const life1 = simulateLifeWithBranches(42, "life_1");
    const life2 = simulateLifeWithBranches(99, "life_2");

    expect(life1.id).toBe("life_1");
    expect(life2.id).toBe("life_2");
    expect(life1.deathAge).toBeGreaterThan(0);
    expect(life2.deathAge).toBeGreaterThan(0);
    expect(life1.epitaph.name).toBe(life1.name);
    expect(life2.epitaph.name).toBe(life2.name);
  });

  it("branch points track state snapshots correctly", () => {
    const life = simulateLifeWithBranches(42, "life_bp");

    if (life.branchPoints.length > 0) {
      const bp = life.branchPoints[0];
      expect(bp.stateSnapshot.identity.name).toBe(life.name);
      expect(bp.age).toBeGreaterThan(0);
      expect(bp.chosenOptionId).toBeTruthy();
      expect(bp.alternateOptionIds.length).toBeGreaterThan(0);
      expect(bp.explored).toBe(false);
    }
  });

  it("can start a 3rd life from a branch point snapshot", () => {
    const life1 = simulateLifeWithBranches(42, "life_origin");

    if (life1.branchPoints.length > 0) {
      const bp = life1.branchPoints[0];

      // Restore state from branch snapshot
      const restoredState = deserialize(serialize(bp.stateSnapshot));
      useGameStore.getState().initializeCharacter(restoredState);

      // Verify state is at the branch point
      const char = useGameStore.getState().character!;
      expect(char.identity.name).toBe(life1.name);
      expect(char.identity.currentAge).toBe(bp.age);

      // Simulate the rest of this alternate life
      resetEntryCounter();
      let history = createEventHistory();
      let delayedEffects: DelayedEffect[] = [];
      const rng = makeSeededRng(777); // Different seed for alternate path

      let isDead = false;
      for (let year = 0; year < 120 && !isDead; year++) {
        const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
          EVENT_POOL, history, delayedEffects, rng
        );
        history = updatedHistory;
        delayedEffects = updatedDelayedEffects;
        isDead = result.isDead;
      }

      // The alternate life should also complete
      expect(isDead).toBe(true);

      const altChar = useGameStore.getState().character!;
      // Same name (same person, different choices)
      expect(altChar.identity.name).toBe(life1.name);
      // But potentially different death age
      expect(altChar.identity.currentAge).toBeGreaterThan(bp.age);
    }
  });

  it("different lives produce different epitaphs", () => {
    const life1 = simulateLifeWithBranches(10, "l1");
    const life2 = simulateLifeWithBranches(20, "l2");

    // At least something should differ between two lives
    const differ =
      life1.name !== life2.name ||
      life1.deathAge !== life2.deathAge ||
      life1.epitaph.headline !== life2.epitaph.headline;
    expect(differ).toBe(true);
  });
});
