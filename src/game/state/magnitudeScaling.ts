/**
 * Consequence magnitude scaling — vulnerability and resilience.
 *
 * Low-attribute characters are hit harder by negative effects.
 * Struggling characters benefit more from positive effects.
 * No single effect can exceed MAX_SINGLE_EFFECT after scaling.
 *
 * @see design/gdd/choice-consequence-system.md — Consequence Magnitude Scaling
 */

import type { LifeAttributes, AttributeName } from "./types";

const VULNERABILITY_SCALE = 0.5;
const RESILIENCE_SCALE = 0.5;
const MAX_SINGLE_EFFECT = 30;

/**
 * Scale an attribute effect magnitude based on the character's current state.
 *
 * Negative effects are amplified when the target attribute is low (vulnerability).
 * Positive effects are amplified when the target attribute is low (resilience).
 *
 * @returns The scaled magnitude, clamped to ±MAX_SINGLE_EFFECT.
 */
export function scaleEffectMagnitude(
  baseMagnitude: number,
  targetAttribute: AttributeName,
  attributes: LifeAttributes
): number {
  const currentValue = attributes[targetAttribute];

  let scaled: number;

  if (baseMagnitude < 0) {
    // Vulnerability: negative effects hit harder when attribute is low
    const vulnerabilityFactor =
      1.0 + VULNERABILITY_SCALE * (1 - currentValue / 100);
    scaled = baseMagnitude * vulnerabilityFactor;
  } else {
    // Resilience: positive effects are amplified when attribute is low
    const resilienceFactor =
      1.0 + RESILIENCE_SCALE * (1 - currentValue / 100);
    scaled = baseMagnitude * resilienceFactor;
  }

  // Clamp to ±MAX_SINGLE_EFFECT
  return Math.max(-MAX_SINGLE_EFFECT, Math.min(MAX_SINGLE_EFFECT, Math.round(scaled)));
}

/**
 * Generate a narrative hint based on an attribute change.
 * Returns null for changes smaller than ±5.
 */
export function getConsequenceHint(
  attribute: AttributeName,
  delta: number
): string | null {
  if (Math.abs(delta) < 5) return null;

  const isPositive = delta > 0;

  const hints: Record<AttributeName, { positive: string; negative: string }> = {
    health: {
      positive: "You feel stronger, more alive.",
      negative: "Something weighs on your body.",
    },
    wealth: {
      positive: "Financial pressure eases a little.",
      negative: "Financial pressure mounts.",
    },
    education: {
      positive: "You feel sharper, more capable.",
      negative: "Doubt creeps in about what you know.",
    },
    career: {
      positive: "Your professional confidence grows.",
      negative: "Your career path feels uncertain.",
    },
    relationships: {
      positive: "You feel more connected to the people around you.",
      negative: "A distance grows between you and others.",
    },
    happiness: {
      positive: "A warm contentment settles over you.",
      negative: "A heaviness you can't quite name.",
    },
    stress: {
      positive: "The weight on your shoulders gets heavier.",
      negative: "A tension you didn't notice releases.",
    },
  };

  const hint = hints[attribute];
  if (!hint) return null;

  // Stress is inverted — positive delta means more stress (bad)
  if (attribute === "stress") {
    return isPositive ? hint.positive : hint.negative;
  }

  return isPositive ? hint.positive : hint.negative;
}
