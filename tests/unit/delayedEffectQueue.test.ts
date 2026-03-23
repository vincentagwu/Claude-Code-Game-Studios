/**
 * Tests for the delayed effect queue.
 *
 * Covers: add, process by age, expire, cap at 50, lowest-impact eviction.
 */

import {
  addDelayedEffect,
  processDelayedEffects,
  expireAll,
  activeCount,
} from "../../src/game/state/delayedEffectQueue";
import type { DelayedEffect } from "../../src/game/state/types";

function makeDelayedEffect(
  overrides?: Partial<DelayedEffect>
): DelayedEffect {
  return {
    id: "de_1",
    sourceEventId: "event_1",
    sourceChoiceId: "choice_1",
    sourceAge: 20,
    targetAge: 25,
    effect: { type: "attribute", target: "wealth", operation: "add", value: 10 },
    probability: 1.0,
    narrative: "Test narrative",
    fired: false,
    expired: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// addDelayedEffect
// ---------------------------------------------------------------------------

describe("addDelayedEffect", () => {
  it("adds an effect to an empty queue", () => {
    const queue = addDelayedEffect([], makeDelayedEffect());
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe("de_1");
  });

  it("adds to existing queue", () => {
    const existing = [makeDelayedEffect({ id: "de_0" })];
    const queue = addDelayedEffect(existing, makeDelayedEffect({ id: "de_1" }));
    expect(queue).toHaveLength(2);
  });

  it("evicts lowest-impact effect when exceeding 50", () => {
    // Fill queue with 50 effects of magnitude 10
    const queue: DelayedEffect[] = [];
    for (let i = 0; i < 50; i++) {
      queue.push(
        makeDelayedEffect({
          id: `de_${i}`,
          effect: { type: "attribute", target: "wealth", operation: "add", value: 10 },
        })
      );
    }

    // Add one more with magnitude 20 — should evict one of the magnitude-10 effects
    const newQueue = addDelayedEffect(
      queue,
      makeDelayedEffect({
        id: "de_50",
        effect: { type: "attribute", target: "career", operation: "add", value: 20 },
      })
    );

    // Queue has 51 entries but one is expired
    expect(activeCount(newQueue)).toBe(50);
    const expiredOnes = newQueue.filter((de) => de.expired);
    expect(expiredOnes).toHaveLength(1);
  });

  it("evicts the lowest magnitude effect", () => {
    const queue: DelayedEffect[] = [
      makeDelayedEffect({ id: "small", effect: { type: "attribute", target: "wealth", operation: "add", value: 2 } }),
      makeDelayedEffect({ id: "big", effect: { type: "attribute", target: "wealth", operation: "add", value: 30 } }),
    ];

    // Fill to 49 more with magnitude 10
    for (let i = 2; i < 50; i++) {
      queue.push(makeDelayedEffect({ id: `de_${i}` }));
    }

    const newQueue = addDelayedEffect(
      queue,
      makeDelayedEffect({ id: "de_new" })
    );

    // "small" (magnitude 2) should be evicted
    const smallEffect = newQueue.find((de) => de.id === "small")!;
    expect(smallEffect.expired).toBe(true);

    const bigEffect = newQueue.find((de) => de.id === "big")!;
    expect(bigEffect.expired).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// processDelayedEffects
// ---------------------------------------------------------------------------

describe("processDelayedEffects", () => {
  it("fires effects at the target age", () => {
    const queue = [makeDelayedEffect({ targetAge: 25 })];
    const { results, updatedQueue } = processDelayedEffects(queue, 25);

    expect(results).toHaveLength(1);
    expect(results[0].effect.type).toBe("attribute");
    expect(results[0].narrative).toBe("Test narrative");
    expect(updatedQueue[0].fired).toBe(true);
  });

  it("does not fire effects at wrong age", () => {
    const queue = [makeDelayedEffect({ targetAge: 25 })];
    const { results, updatedQueue } = processDelayedEffects(queue, 20);

    expect(results).toHaveLength(0);
    expect(updatedQueue[0].fired).toBe(false);
  });

  it("respects probability — effect fires when roll < probability", () => {
    const queue = [makeDelayedEffect({ targetAge: 25, probability: 0.5 })];
    // rng returns 0.3 < 0.5 → fires
    const { results } = processDelayedEffects(queue, 25, () => 0.3);
    expect(results).toHaveLength(1);
  });

  it("respects probability — effect expires when roll >= probability", () => {
    const queue = [makeDelayedEffect({ targetAge: 25, probability: 0.5 })];
    // rng returns 0.7 >= 0.5 → expires
    const { results, updatedQueue } = processDelayedEffects(queue, 25, () => 0.7);
    expect(results).toHaveLength(0);
    expect(updatedQueue[0].expired).toBe(true);
  });

  it("skips already-fired effects", () => {
    const queue = [makeDelayedEffect({ targetAge: 25, fired: true })];
    const { results } = processDelayedEffects(queue, 25);
    expect(results).toHaveLength(0);
  });

  it("skips already-expired effects", () => {
    const queue = [makeDelayedEffect({ targetAge: 25, expired: true })];
    const { results } = processDelayedEffects(queue, 25);
    expect(results).toHaveLength(0);
  });

  it("processes multiple effects at the same age", () => {
    const queue = [
      makeDelayedEffect({ id: "de_1", targetAge: 30 }),
      makeDelayedEffect({ id: "de_2", targetAge: 30 }),
      makeDelayedEffect({ id: "de_3", targetAge: 35 }),
    ];
    const { results } = processDelayedEffects(queue, 30);
    expect(results).toHaveLength(2);
  });

  it("includes source info in results", () => {
    const queue = [makeDelayedEffect({ sourceEventId: "ev_college", sourceAge: 18, targetAge: 25 })];
    const { results } = processDelayedEffects(queue, 25);
    expect(results[0].sourceEventId).toBe("ev_college");
    expect(results[0].sourceAge).toBe(18);
  });
});

// ---------------------------------------------------------------------------
// expireAll
// ---------------------------------------------------------------------------

describe("expireAll", () => {
  it("expires all unfired effects", () => {
    const queue = [
      makeDelayedEffect({ id: "de_1" }),
      makeDelayedEffect({ id: "de_2" }),
    ];
    const result = expireAll(queue);
    expect(result.every((de) => de.expired)).toBe(true);
  });

  it("does not modify already-fired effects", () => {
    const queue = [
      makeDelayedEffect({ id: "de_1", fired: true }),
      makeDelayedEffect({ id: "de_2" }),
    ];
    const result = expireAll(queue);
    expect(result[0].fired).toBe(true);
    expect(result[0].expired).toBe(false);
    expect(result[1].expired).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// activeCount
// ---------------------------------------------------------------------------

describe("activeCount", () => {
  it("counts only non-fired, non-expired effects", () => {
    const queue = [
      makeDelayedEffect({ id: "de_1" }),
      makeDelayedEffect({ id: "de_2", fired: true }),
      makeDelayedEffect({ id: "de_3", expired: true }),
      makeDelayedEffect({ id: "de_4" }),
    ];
    expect(activeCount(queue)).toBe(2);
  });

  it("returns 0 for empty queue", () => {
    expect(activeCount([])).toBe(0);
  });
});
