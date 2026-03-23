/**
 * Delayed Effect Queue — manages scheduled future consequences.
 *
 * Effects are queued when choices are made and processed each year tick.
 * Cap at 50 with lowest-impact eviction.
 *
 * @see design/gdd/choice-consequence-system.md — Delayed Effect Queue
 */

import type { DelayedEffect, Effect } from "./types";

const MAX_QUEUE_SIZE = 50;

export interface DelayedEffectResult {
  readonly effect: Effect;
  readonly narrative: string;
  readonly sourceEventId: string;
  readonly sourceAge: number;
}

/**
 * Add a delayed effect to the queue.
 * If the queue exceeds MAX_QUEUE_SIZE, the oldest effect with the
 * lowest impact magnitude is expired to make room.
 */
export function addDelayedEffect(
  queue: DelayedEffect[],
  effect: DelayedEffect
): DelayedEffect[] {
  const newQueue = [...queue, effect];

  if (newQueue.length > MAX_QUEUE_SIZE) {
    return evictLowestImpact(newQueue);
  }

  return newQueue;
}

/**
 * Process all delayed effects that target the given age.
 * Returns the effects that fired (passed probability check)
 * and the updated queue with fired/expired effects marked.
 */
export function processDelayedEffects(
  queue: DelayedEffect[],
  currentAge: number,
  rng: () => number = Math.random
): { results: DelayedEffectResult[]; updatedQueue: DelayedEffect[] } {
  const results: DelayedEffectResult[] = [];
  const updatedQueue = queue.map((de) => {
    if (de.fired || de.expired) return de;
    if (de.targetAge !== currentAge) return de;

    const roll = rng();
    if (roll < de.probability) {
      results.push({
        effect: de.effect,
        narrative: de.narrative,
        sourceEventId: de.sourceEventId,
        sourceAge: de.sourceAge,
      });
      return { ...de, fired: true };
    } else {
      return { ...de, expired: true };
    }
  });

  return { results, updatedQueue };
}

/**
 * Expire all unfired effects (called on character death).
 */
export function expireAll(queue: DelayedEffect[]): DelayedEffect[] {
  return queue.map((de) =>
    de.fired || de.expired ? de : { ...de, expired: true }
  );
}

/**
 * Get count of active (not fired, not expired) effects.
 */
export function activeCount(queue: DelayedEffect[]): number {
  return queue.filter((de) => !de.fired && !de.expired).length;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

/** Estimate the magnitude of an effect for eviction prioritization. */
function getEffectMagnitude(effect: Effect): number {
  switch (effect.type) {
    case "attribute":
      return Math.abs(effect.value);
    case "spectrum":
      return Math.abs(effect.delta);
    case "tag":
      return 5; // tags are moderate impact
    case "relationship":
      return Math.abs(effect.closenessChange ?? 10);
  }
}

/**
 * Expire the oldest effect with the lowest impact magnitude.
 */
function evictLowestImpact(queue: DelayedEffect[]): DelayedEffect[] {
  let lowestIdx = -1;
  let lowestMagnitude = Infinity;

  for (let i = 0; i < queue.length; i++) {
    const de = queue[i];
    if (de.fired || de.expired) continue;

    const magnitude = getEffectMagnitude(de.effect);
    if (magnitude < lowestMagnitude) {
      lowestMagnitude = magnitude;
      lowestIdx = i;
    }
  }

  if (lowestIdx === -1) return queue;

  return queue.map((de, i) =>
    i === lowestIdx ? { ...de, expired: true } : de
  );
}
