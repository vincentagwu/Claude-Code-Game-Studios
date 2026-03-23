/**
 * Tests for Life Stage definitions and lookup helpers.
 */

import {
  STAGES,
  getStageForAge,
  getNextStage,
  getSecondsPerYear,
} from "../../src/game/stages/lifeStages";

describe("STAGES data", () => {
  it("defines exactly 8 stages", () => {
    expect(STAGES).toHaveLength(8);
  });

  it("covers all ages from 0 to Infinity with no gaps", () => {
    for (let i = 0; i < STAGES.length - 1; i++) {
      expect(STAGES[i + 1].ageRange[0]).toBe(STAGES[i].ageRange[1] + 1);
    }
    expect(STAGES[STAGES.length - 1].ageRange[1]).toBe(Infinity);
  });

  it("has unique stage names", () => {
    const names = STAGES.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all stages have non-empty event categories", () => {
    for (const stage of STAGES) {
      expect(stage.eventCategories.length).toBeGreaterThan(0);
    }
  });

  it("all stages have valid theme tokens", () => {
    for (const stage of STAGES) {
      expect(stage.themeTokens.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(stage.themeTokens.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("getStageForAge", () => {
  it("returns infancy for age 0", () => {
    expect(getStageForAge(0).name).toBe("infancy");
  });

  it("returns infancy for age 2", () => {
    expect(getStageForAge(2).name).toBe("infancy");
  });

  it("returns earlyChildhood for age 3", () => {
    expect(getStageForAge(3).name).toBe("earlyChildhood");
  });

  it("returns childhood for age 6", () => {
    expect(getStageForAge(6).name).toBe("childhood");
  });

  it("returns adolescence for age 12", () => {
    expect(getStageForAge(12).name).toBe("adolescence");
  });

  it("returns youngAdult for age 18", () => {
    expect(getStageForAge(18).name).toBe("youngAdult");
  });

  it("returns adult for age 30", () => {
    expect(getStageForAge(30).name).toBe("adult");
  });

  it("returns midlife for age 50", () => {
    expect(getStageForAge(50).name).toBe("midlife");
  });

  it("returns elder for age 65", () => {
    expect(getStageForAge(65).name).toBe("elder");
  });

  it("returns elder for age 100", () => {
    expect(getStageForAge(100).name).toBe("elder");
  });

  it("handles boundary ages correctly", () => {
    expect(getStageForAge(11).name).toBe("childhood");
    expect(getStageForAge(12).name).toBe("adolescence");
    expect(getStageForAge(17).name).toBe("adolescence");
    expect(getStageForAge(18).name).toBe("youngAdult");
    expect(getStageForAge(25).name).toBe("youngAdult");
    expect(getStageForAge(26).name).toBe("adult");
    expect(getStageForAge(45).name).toBe("adult");
    expect(getStageForAge(46).name).toBe("midlife");
    expect(getStageForAge(60).name).toBe("midlife");
    expect(getStageForAge(61).name).toBe("elder");
  });
});

describe("getNextStage", () => {
  it("returns earlyChildhood after infancy", () => {
    expect(getNextStage("infancy")!.name).toBe("earlyChildhood");
  });

  it("returns null for elder (no next stage)", () => {
    expect(getNextStage("elder")).toBeNull();
  });

  it("returns adolescence after childhood", () => {
    expect(getNextStage("childhood")!.name).toBe("adolescence");
  });
});

describe("getSecondsPerYear", () => {
  it("calculates correct interval for infancy (6.0 ypm → 10s)", () => {
    expect(getSecondsPerYear(STAGES[0])).toBe(10);
  });

  it("calculates correct interval for elder (0.8 ypm → 75s)", () => {
    expect(getSecondsPerYear(STAGES[7])).toBe(75);
  });

  it("calculates correct interval for youngAdult (1.0 ypm → 60s)", () => {
    expect(getSecondsPerYear(STAGES[4])).toBe(60);
  });
});
