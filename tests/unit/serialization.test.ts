/**
 * Tests for state serialization/deserialization.
 *
 * Covers: round-trip fidelity, missing fields get defaults,
 * corrupted input doesn't crash, clamping on deserialize.
 */

import { serialize, deserialize } from "../../src/game/state/serialization";
import type { CharacterState } from "../../src/game/state/types";

const fullState: CharacterState = {
  identity: {
    name: "Alice",
    gender: "female",
    birthYear: 1990,
    currentAge: 35,
    location: "Portland",
    familyBackground: {
      parentTraits: [{ name: "Dad", spectrums: { courage: 30 } }],
      originClass: "working",
      originLocation: "Seattle",
    },
    socioeconomicClass: "middle",
  },
  spectrums: {
    courage: 60,
    generosity: -20,
    sociability: 45,
    ambition: 80,
    empathy: -50,
    conformity: 10,
  },
  attributes: {
    health: 75,
    wealth: 55,
    education: 70,
    career: 60,
    relationships: 65,
    happiness: 50,
    stress: 35,
  },
  tags: [
    { id: "college_graduate", category: "education", earnedAtAge: 22 },
    { id: "married", category: "family", earnedAtAge: 28 },
  ],
  relationships: [
    {
      id: "spouse_bob",
      name: "Bob",
      type: "romantic",
      closeness: 85,
      status: "active",
      traits: ["supportive", "funny"],
      metAge: 24,
      history: ["event_001"],
    },
  ],
};

// ---------------------------------------------------------------------------
// Round-trip
// ---------------------------------------------------------------------------

describe("round-trip serialization", () => {
  it("preserves all data through serialize → deserialize", () => {
    const json = serialize(fullState);
    const restored = deserialize(json);
    expect(restored).toEqual(fullState);
  });

  it("produces valid JSON", () => {
    const json = serialize(fullState);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Missing fields — graceful defaults
// ---------------------------------------------------------------------------

describe("deserialize with missing fields", () => {
  it("returns defaults for completely empty object", () => {
    const result = deserialize("{}");
    expect(result.identity.name).toBe("Unknown");
    expect(result.identity.gender).toBe("nonbinary");
    expect(result.identity.currentAge).toBe(0);
    expect(result.spectrums.courage).toBe(0);
    expect(result.attributes.health).toBe(50);
    expect(result.tags).toEqual([]);
    expect(result.relationships).toEqual([]);
  });

  it("fills missing spectrums with 0", () => {
    const partial = { spectrums: { courage: 30 } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.spectrums.courage).toBe(30);
    expect(result.spectrums.generosity).toBe(0);
    expect(result.spectrums.sociability).toBe(0);
  });

  it("fills missing attributes with 50", () => {
    const partial = { attributes: { health: 80 } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.attributes.health).toBe(80);
    expect(result.attributes.wealth).toBe(50);
    expect(result.attributes.education).toBe(50);
  });

  it("fills missing identity fields with defaults", () => {
    const partial = { identity: { name: "Test" } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.identity.name).toBe("Test");
    expect(result.identity.gender).toBe("nonbinary");
    expect(result.identity.birthYear).toBe(2000);
    expect(result.identity.location).toBe("Unknown");
    expect(result.identity.socioeconomicClass).toBe("middle");
  });

  it("handles missing familyBackground", () => {
    const partial = { identity: { name: "Test" } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.identity.familyBackground.parentTraits).toEqual([]);
    expect(result.identity.familyBackground.originClass).toBe("middle");
  });
});

// ---------------------------------------------------------------------------
// Corrupted input
// ---------------------------------------------------------------------------

describe("deserialize with corrupted input", () => {
  it("handles invalid JSON string", () => {
    const result = deserialize("not valid json {{{");
    expect(result.identity.name).toBe("Unknown");
    expect(result.attributes.health).toBe(50);
  });

  it("handles null input", () => {
    const result = deserialize("null");
    expect(result.identity.name).toBe("Unknown");
  });

  it("handles number input", () => {
    const result = deserialize("42");
    expect(result.identity.name).toBe("Unknown");
  });

  it("handles array input", () => {
    const result = deserialize("[]");
    expect(result.identity.name).toBe("Unknown");
  });

  it("handles string values where numbers expected", () => {
    const partial = { attributes: { health: "not a number" } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.attributes.health).toBe(50); // default
  });

  it("handles invalid enum values", () => {
    const partial = { identity: { gender: "invalid_gender" } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.identity.gender).toBe("nonbinary"); // fallback
  });

  it("filters out tags without id", () => {
    const partial = {
      tags: [
        { id: "valid_tag", category: "education", earnedAtAge: 20 },
        { category: "family", earnedAtAge: 25 }, // missing id
        "not an object",
        null,
      ],
    };
    const result = deserialize(JSON.stringify(partial));
    expect(result.tags).toHaveLength(1);
    expect(result.tags[0].id).toBe("valid_tag");
  });

  it("filters out relationships without id", () => {
    const partial = {
      relationships: [
        { id: "friend_a", name: "A", type: "friend", closeness: 50 },
        { name: "B" }, // missing id
        null,
      ],
    };
    const result = deserialize(JSON.stringify(partial));
    expect(result.relationships).toHaveLength(1);
    expect(result.relationships[0].id).toBe("friend_a");
  });

  it("defaults invalid tag category", () => {
    const partial = {
      tags: [{ id: "test", category: "invalid_category", earnedAtAge: 10 }],
    };
    const result = deserialize(JSON.stringify(partial));
    expect(result.tags[0].category).toBe("life_event"); // fallback
  });

  it("defaults invalid relationship type", () => {
    const partial = {
      relationships: [{ id: "r1", name: "X", type: "nemesis", closeness: 50 }],
    };
    const result = deserialize(JSON.stringify(partial));
    expect(result.relationships[0].type).toBe("friend"); // fallback
  });
});

// ---------------------------------------------------------------------------
// Clamping on deserialize
// ---------------------------------------------------------------------------

describe("deserialize clamping", () => {
  it("clamps attributes above 100 to 100", () => {
    const partial = { attributes: { health: 150 } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.attributes.health).toBe(100);
  });

  it("clamps attributes below 0 to 0", () => {
    const partial = { attributes: { wealth: -30 } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.attributes.wealth).toBe(0);
  });

  it("clamps spectrums above 100 to 100", () => {
    const partial = { spectrums: { courage: 200 } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.spectrums.courage).toBe(100);
  });

  it("clamps spectrums below -100 to -100", () => {
    const partial = { spectrums: { empathy: -150 } };
    const result = deserialize(JSON.stringify(partial));
    expect(result.spectrums.empathy).toBe(-100);
  });

  it("clamps relationship closeness to 0-100", () => {
    const partial = {
      relationships: [{ id: "r1", name: "X", closeness: 200 }],
    };
    const result = deserialize(JSON.stringify(partial));
    expect(result.relationships[0].closeness).toBe(100);
  });

  it("handles NaN values", () => {
    const partial = { attributes: { health: NaN } };
    const result = deserialize(JSON.stringify(partial));
    // NaN becomes null in JSON, which falls back to default
    expect(result.attributes.health).toBe(50);
  });
});
