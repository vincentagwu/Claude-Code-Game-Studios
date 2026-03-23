/**
 * Tests for consequence magnitude scaling and narrative hints.
 */

import {
  scaleEffectMagnitude,
  getConsequenceHint,
} from "../../src/game/state/magnitudeScaling";
import type { LifeAttributes } from "../../src/game/state/types";

const baseAttributes: LifeAttributes = {
  health: 80, wealth: 50, education: 50, career: 50,
  relationships: 50, happiness: 50, stress: 30,
};

describe("scaleEffectMagnitude", () => {
  it("returns unscaled magnitude at attribute 100 for negative effects", () => {
    const attrs = { ...baseAttributes, wealth: 100 };
    // vulnerability_factor = 1.0 + 0.5 * (1 - 100/100) = 1.0
    expect(scaleEffectMagnitude(-15, "wealth", attrs)).toBe(-15);
  });

  it("amplifies negative effects at low attribute (vulnerability)", () => {
    const attrs = { ...baseAttributes, wealth: 20 };
    // vulnerability_factor = 1.0 + 0.5 * (1 - 20/100) = 1.4
    // -15 * 1.4 = -21
    expect(scaleEffectMagnitude(-15, "wealth", attrs)).toBe(-21);
  });

  it("amplifies positive effects at low attribute (resilience)", () => {
    const attrs = { ...baseAttributes, wealth: 20 };
    // resilience_factor = 1.0 + 0.5 * (1 - 20/100) = 1.4
    // 15 * 1.4 = 21
    expect(scaleEffectMagnitude(15, "wealth", attrs)).toBe(21);
  });

  it("caps at MAX_SINGLE_EFFECT (30)", () => {
    const attrs = { ...baseAttributes, wealth: 0 };
    // -25 * 1.5 = -37.5 → clamped to -30
    expect(scaleEffectMagnitude(-25, "wealth", attrs)).toBe(-30);
  });

  it("caps positive at MAX_SINGLE_EFFECT (30)", () => {
    const attrs = { ...baseAttributes, wealth: 0 };
    // 25 * 1.5 = 37.5 → clamped to 30
    expect(scaleEffectMagnitude(25, "wealth", attrs)).toBe(30);
  });

  it("handles zero magnitude", () => {
    expect(scaleEffectMagnitude(0, "health", baseAttributes)).toBe(0);
  });

  it("moderate attribute gives moderate scaling", () => {
    const attrs = { ...baseAttributes, health: 50 };
    // factor = 1.0 + 0.5 * (1 - 50/100) = 1.25
    // -10 * 1.25 = -12.5 → Math.round(-12.5) = -12
    expect(scaleEffectMagnitude(-10, "health", attrs)).toBe(-12);
  });
});

describe("getConsequenceHint", () => {
  it("returns a hint for large positive attribute change", () => {
    const hint = getConsequenceHint("wealth", 10);
    expect(hint).toBe("Financial pressure eases a little.");
  });

  it("returns a hint for large negative attribute change", () => {
    const hint = getConsequenceHint("health", -8);
    expect(hint).toBe("Something weighs on your body.");
  });

  it("returns null for small changes (< 5)", () => {
    expect(getConsequenceHint("wealth", 3)).toBeNull();
    expect(getConsequenceHint("health", -4)).toBeNull();
  });

  it("handles stress correctly (positive stress = bad)", () => {
    expect(getConsequenceHint("stress", 10)).toBe(
      "The weight on your shoulders gets heavier."
    );
    expect(getConsequenceHint("stress", -10)).toBe(
      "A tension you didn't notice releases."
    );
  });

  it("returns hints for all 7 attributes", () => {
    const attrs = ["health", "wealth", "education", "career", "relationships", "happiness", "stress"] as const;
    for (const attr of attrs) {
      expect(getConsequenceHint(attr, 10)).not.toBeNull();
      expect(getConsequenceHint(attr, -10)).not.toBeNull();
    }
  });
});
