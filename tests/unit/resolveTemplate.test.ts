/**
 * Tests for template variable resolution.
 *
 * Covers: pool selection, state query, relationship resolution,
 * relationship fallbacks, missing variables.
 */

import { resolveTemplate } from "../../src/game/events/resolveTemplate";
import type { CharacterState } from "../../src/game/state/types";
import type { MinorEventTemplate } from "../../src/game/events/types";

const testState: CharacterState = {
  identity: {
    name: "Alice",
    gender: "female",
    birthYear: 2000,
    currentAge: 10,
    location: "Portland",
    familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Portland" },
    socioeconomicClass: "middle",
  },
  spectrums: { courage: 60, generosity: 0, sociability: 30, ambition: 0, empathy: 0, conformity: 0 },
  attributes: { health: 80, wealth: 55, education: 50, career: 30, relationships: 60, happiness: 65, stress: 25 },
  tags: [],
  relationships: [
    { id: "friend_sam", name: "Sam", type: "friend", closeness: 70, status: "active", traits: ["funny"], metAge: 7, history: [] },
    { id: "mom", name: "Mom", type: "family", closeness: 90, status: "active", traits: ["supportive"], metAge: 0, history: [] },
    { id: "old_pal", name: "Jamie", type: "friend", closeness: 5, status: "estranged", traits: [], metAge: 5, history: [] },
  ],
};

function makeTemplate(overrides?: Partial<MinorEventTemplate>): MinorEventTemplate {
  return {
    id: "test_template",
    type: "minor",
    category: "school",
    stages: ["childhood"],
    minAge: 6,
    maxAge: 11,
    conditions: [],
    exclusions: [],
    prerequisites: [],
    weight: 50,
    maxOccurrences: 3,
    isMilestone: false,
    format: "timeline_popup",
    content: { text: "" },
    effects: [],
    tags: [],
    rarity: "common",
    author: "test",
    template: "Hello {name}!",
    variables: [{ name: "name", source: "pool", pool: ["World"] }],
    ...overrides,
  };
}

// Deterministic rng that always returns 0 (selects first item)
const firstItem = () => 0;

// ---------------------------------------------------------------------------
// Pool resolution
// ---------------------------------------------------------------------------

describe("pool variables", () => {
  it("resolves a pool variable", () => {
    const tmpl = makeTemplate({
      template: "You {action} today.",
      variables: [{ name: "action", source: "pool", pool: ["ran", "jumped", "swam"] }],
    });
    const result = resolveTemplate(tmpl, testState, firstItem);
    expect(result).toBe("You ran today.");
  });

  it("selects different items based on rng", () => {
    const tmpl = makeTemplate({
      template: "{word}",
      variables: [{ name: "word", source: "pool", pool: ["alpha", "beta", "gamma"] }],
    });
    // rng=0.5 → index floor(0.5 * 3) = 1 → "beta"
    expect(resolveTemplate(tmpl, testState, () => 0.5)).toBe("beta");
    // rng=0.99 → index floor(0.99 * 3) = 2 → "gamma"
    expect(resolveTemplate(tmpl, testState, () => 0.99)).toBe("gamma");
  });

  it("returns null for empty pool", () => {
    const tmpl = makeTemplate({
      template: "{x}",
      variables: [{ name: "x", source: "pool", pool: [] }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBeNull();
  });

  it("returns null for missing pool", () => {
    const tmpl = makeTemplate({
      template: "{x}",
      variables: [{ name: "x", source: "pool" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// State query resolution
// ---------------------------------------------------------------------------

describe("state variables", () => {
  it("resolves identity.name", () => {
    const tmpl = makeTemplate({
      template: "Hello {name}!",
      variables: [{ name: "name", source: "state", stateQuery: "identity.name" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("Hello Alice!");
  });

  it("resolves attributes.wealth", () => {
    const tmpl = makeTemplate({
      template: "Wealth: {w}",
      variables: [{ name: "w", source: "state", stateQuery: "attributes.wealth" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("Wealth: 55");
  });

  it("resolves spectrums.courage", () => {
    const tmpl = makeTemplate({
      template: "Courage: {c}",
      variables: [{ name: "c", source: "state", stateQuery: "spectrums.courage" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("Courage: 60");
  });

  it("resolves identity.location", () => {
    const tmpl = makeTemplate({
      template: "Living in {loc}",
      variables: [{ name: "loc", source: "state", stateQuery: "identity.location" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("Living in Portland");
  });

  it("returns null for invalid state path", () => {
    const tmpl = makeTemplate({
      template: "{x}",
      variables: [{ name: "x", source: "state", stateQuery: "nonexistent.path" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBeNull();
  });

  it("returns null for missing stateQuery", () => {
    const tmpl = makeTemplate({
      template: "{x}",
      variables: [{ name: "x", source: "state" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Relationship resolution
// ---------------------------------------------------------------------------

describe("relationship variables", () => {
  it("resolves type:friend to an active friend's name", () => {
    const tmpl = makeTemplate({
      template: "You played with {friend}.",
      variables: [{ name: "friend", source: "relationship", relationshipQuery: "type:friend" }],
    });
    const result = resolveTemplate(tmpl, testState, firstItem);
    // Sam is the only active friend (Jamie is estranged)
    expect(result).toBe("You played with Sam.");
  });

  it("resolves type:family to a family member's name", () => {
    const tmpl = makeTemplate({
      template: "Your {parent} smiled.",
      variables: [{ name: "parent", source: "relationship", relationshipQuery: "type:family" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("Your Mom smiled.");
  });

  it("falls back to generic text when no matching relationship", () => {
    const tmpl = makeTemplate({
      template: "You met {person}.",
      variables: [{ name: "person", source: "relationship", relationshipQuery: "type:romantic" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("You met someone special.");
  });

  it("excludes estranged relationships", () => {
    // Jamie is a friend but estranged — should not be selected
    const stateNoActiveFriends: CharacterState = {
      ...testState,
      relationships: [
        { id: "old_pal", name: "Jamie", type: "friend", closeness: 5, status: "estranged", traits: [], metAge: 5, history: [] },
      ],
    };
    const tmpl = makeTemplate({
      template: "{f}",
      variables: [{ name: "f", source: "relationship", relationshipQuery: "type:friend" }],
    });
    expect(resolveTemplate(tmpl, stateNoActiveFriends, firstItem)).toBe("a friend");
  });

  it("falls back for specific ID not found", () => {
    const tmpl = makeTemplate({
      template: "{p}",
      variables: [{ name: "p", source: "relationship", relationshipQuery: "nonexistent_id" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe("someone");
  });

  it("returns null for missing relationshipQuery", () => {
    const tmpl = makeTemplate({
      template: "{x}",
      variables: [{ name: "x", source: "relationship" }],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Multiple variables
// ---------------------------------------------------------------------------

describe("multiple variables", () => {
  it("resolves all variables in a template", () => {
    const tmpl = makeTemplate({
      template: "{name} played {game} with {friend} in {location}.",
      variables: [
        { name: "name", source: "state", stateQuery: "identity.name" },
        { name: "game", source: "pool", pool: ["tag"] },
        { name: "friend", source: "relationship", relationshipQuery: "type:friend" },
        { name: "location", source: "state", stateQuery: "identity.location" },
      ],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBe(
      "Alice played tag with Sam in Portland."
    );
  });

  it("returns null if any variable fails", () => {
    const tmpl = makeTemplate({
      template: "{good} and {bad}",
      variables: [
        { name: "good", source: "pool", pool: ["fine"] },
        { name: "bad", source: "pool", pool: [] }, // fails
      ],
    });
    expect(resolveTemplate(tmpl, testState, firstItem)).toBeNull();
  });
});
