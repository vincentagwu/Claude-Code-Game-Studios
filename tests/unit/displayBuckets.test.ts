/**
 * Tests for display bucket helpers.
 */

import {
  getDisplayBucket,
  getPersonalityLabel,
} from "../../src/game/state/displayBuckets";

describe("getDisplayBucket", () => {
  it.each([
    ["health", 100, "Thriving"],
    ["health", 80, "Thriving"],
    ["health", 79, "Healthy"],
    ["health", 60, "Healthy"],
    ["health", 59, "Fair"],
    ["health", 40, "Fair"],
    ["health", 39, "Struggling"],
    ["health", 20, "Struggling"],
    ["health", 19, "Critical"],
    ["health", 0, "Critical"],
  ] as const)("%s at %d → %s", (attr, val, expected) => {
    expect(getDisplayBucket(attr, val)).toBe(expected);
  });

  it("returns correct labels for wealth", () => {
    expect(getDisplayBucket("wealth", 90)).toBe("Wealthy");
    expect(getDisplayBucket("wealth", 50)).toBe("Getting By");
    expect(getDisplayBucket("wealth", 5)).toBe("Poverty");
  });

  it("returns correct labels for stress (reversed scale)", () => {
    expect(getDisplayBucket("stress", 90)).toBe("Breaking Point");
    expect(getDisplayBucket("stress", 50)).toBe("Manageable");
    expect(getDisplayBucket("stress", 10)).toBe("Serene");
  });

  it("returns correct labels for all 7 attributes at boundary", () => {
    expect(getDisplayBucket("education", 80)).toBe("Scholar");
    expect(getDisplayBucket("career", 60)).toBe("Established");
    expect(getDisplayBucket("relationships", 40)).toBe("Some Friends");
    expect(getDisplayBucket("happiness", 20)).toBe("Unhappy");
  });
});

describe("getPersonalityLabel", () => {
  it.each([
    ["courage", 100, "Brave"],
    ["courage", 60, "Brave"],
    ["courage", 59, "Somewhat brave"],
    ["courage", 30, "Somewhat brave"],
    ["courage", 29, "Neutral"],
    ["courage", 0, "Neutral"],
    ["courage", -29, "Neutral"],
    ["courage", -30, "Somewhat cautious"],
    ["courage", -59, "Somewhat cautious"],
    ["courage", -60, "Cautious"],
    ["courage", -100, "Cautious"],
  ] as const)("%s at %d → %s", (spectrum, val, expected) => {
    expect(getPersonalityLabel(spectrum, val)).toBe(expected);
  });

  it("returns correct labels for all spectrums at extremes", () => {
    expect(getPersonalityLabel("generosity", 80)).toBe("Generous");
    expect(getPersonalityLabel("generosity", -80)).toBe("Selfish");
    expect(getPersonalityLabel("sociability", 70)).toBe("Social");
    expect(getPersonalityLabel("sociability", -70)).toBe("Introverted");
    expect(getPersonalityLabel("ambition", 50)).toBe("Somewhat ambitious");
    expect(getPersonalityLabel("empathy", -40)).toBe("Somewhat detached");
    expect(getPersonalityLabel("conformity", 0)).toBe("Neutral");
  });
});
