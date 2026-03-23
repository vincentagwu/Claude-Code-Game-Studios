/**
 * Tests for condition evaluation — all 6 condition types.
 */

import { evaluateConditions } from "../../src/game/events/evaluateConditions";
import type { CharacterState, DerivedFlags } from "../../src/game/state/types";
import type { Condition } from "../../src/game/events/types";

const baseState: CharacterState = {
  identity: {
    name: "Test",
    gender: "female",
    birthYear: 2000,
    currentAge: 25,
    location: "New York",
    familyBackground: { parentTraits: [], originClass: "middle", originLocation: "NY" },
    socioeconomicClass: "middle",
  },
  spectrums: { courage: 60, generosity: -20, sociability: 30, ambition: 0, empathy: 45, conformity: -80 },
  attributes: { health: 75, wealth: 55, education: 70, career: 40, relationships: 60, happiness: 65, stress: 35 },
  tags: [
    { id: "college_graduate", category: "education", earnedAtAge: 22 },
    { id: "married", category: "family", earnedAtAge: 24 },
  ],
  relationships: [
    { id: "spouse_alex", name: "Alex", type: "romantic", closeness: 85, status: "active", traits: ["supportive"], metAge: 20, history: [] },
    { id: "friend_sam", name: "Sam", type: "friend", closeness: 45, status: "active", traits: ["funny"], metAge: 15, history: [] },
    { id: "old_friend", name: "Pat", type: "friend", closeness: 5, status: "estranged", traits: [], metAge: 10, history: [] },
  ],
};

const baseFlags: DerivedFlags = {
  isEmployed: true,
  isMarried: true,
  hasChildren: false,
  hasDebt: false,
  ownsHome: false,
  hasCriminalRecord: false,
  isRetired: false,
};

describe("attribute conditions", () => {
  it("evaluates >= correctly", () => {
    const conditions: Condition[] = [
      { type: "attribute", target: "wealth", operator: ">=", value: 50 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates < correctly", () => {
    const conditions: Condition[] = [
      { type: "attribute", target: "wealth", operator: "<", value: 50 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(false);
  });

  it("evaluates == correctly", () => {
    const conditions: Condition[] = [
      { type: "attribute", target: "health", operator: "==", value: 75 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates != correctly", () => {
    const conditions: Condition[] = [
      { type: "attribute", target: "health", operator: "!=", value: 50 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });
});

describe("spectrum conditions", () => {
  it("evaluates >= on positive spectrum", () => {
    const conditions: Condition[] = [
      { type: "spectrum", target: "courage", operator: ">=", value: 40 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates < on negative spectrum", () => {
    const conditions: Condition[] = [
      { type: "spectrum", target: "conformity", operator: "<", value: -50 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });
});

describe("tag conditions", () => {
  it("evaluates has for existing tag", () => {
    const conditions: Condition[] = [
      { type: "tag", target: "college_graduate", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates has for missing tag", () => {
    const conditions: Condition[] = [
      { type: "tag", target: "criminal_record", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(false);
  });

  it("evaluates !has correctly", () => {
    const conditions: Condition[] = [
      { type: "tag", target: "criminal_record", operator: "!has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });
});

describe("flag conditions", () => {
  it("evaluates has for true flag", () => {
    const conditions: Condition[] = [
      { type: "flag", target: "isEmployed", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates has for false flag", () => {
    const conditions: Condition[] = [
      { type: "flag", target: "hasChildren", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(false);
  });

  it("evaluates !has for false flag", () => {
    const conditions: Condition[] = [
      { type: "flag", target: "hasCriminalRecord", operator: "!has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });
});

describe("relationship conditions", () => {
  it("evaluates has for active relationship by type", () => {
    const conditions: Condition[] = [
      { type: "relationship", target: "type:romantic", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates has for missing relationship type", () => {
    const conditions: Condition[] = [
      { type: "relationship", target: "type:professional", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(false);
  });

  it("evaluates has for specific relationship ID", () => {
    const conditions: Condition[] = [
      { type: "relationship", target: "spouse_alex", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates !has for estranged relationship", () => {
    // old_friend is estranged — has returns false for estranged
    const conditions: Condition[] = [
      { type: "relationship", target: "old_friend", operator: "has" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(false);
  });

  it("evaluates closeness comparison", () => {
    const conditions: Condition[] = [
      { type: "relationship", target: "spouse_alex", operator: ">=", value: 80 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });
});

describe("identity conditions", () => {
  it("evaluates gender ==", () => {
    const conditions: Condition[] = [
      { type: "identity", target: "gender", operator: "==", value: "female" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates gender !=", () => {
    const conditions: Condition[] = [
      { type: "identity", target: "gender", operator: "!=", value: "male" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates age >=", () => {
    const conditions: Condition[] = [
      { type: "identity", target: "currentAge", operator: ">=", value: 18 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("evaluates location ==", () => {
    const conditions: Condition[] = [
      { type: "identity", target: "location", operator: "==", value: "New York" },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });
});

describe("multiple conditions (AND logic)", () => {
  it("returns true when all conditions pass", () => {
    const conditions: Condition[] = [
      { type: "attribute", target: "education", operator: ">=", value: 60 },
      { type: "tag", target: "college_graduate", operator: "has" },
      { type: "identity", target: "currentAge", operator: ">=", value: 18 },
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(true);
  });

  it("returns false when any condition fails", () => {
    const conditions: Condition[] = [
      { type: "attribute", target: "education", operator: ">=", value: 60 },
      { type: "attribute", target: "wealth", operator: ">=", value: 90 }, // fails
    ];
    expect(evaluateConditions(conditions, baseState, baseFlags)).toBe(false);
  });

  it("returns true for empty conditions", () => {
    expect(evaluateConditions([], baseState, baseFlags)).toBe(true);
  });
});
