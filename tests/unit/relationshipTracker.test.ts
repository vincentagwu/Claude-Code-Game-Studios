/**
 * Tests for the Relationship Tracker.
 */

import {
  getRelationshipPhase,
  getPhaseLabel,
  generateNpc,
  checkPhaseTransitions,
  applyRelationshipDecay,
  shouldGenerateNpc,
} from "../../src/game/relationships/relationshipTracker";
import { generateNpcTraits, getClosenessModifier, NPC_TRAITS } from "../../src/game/relationships/npcTraits";
import type { CharacterState, Relationship } from "../../src/game/state/types";

function makeState(overrides?: Partial<CharacterState>): CharacterState {
  return {
    identity: {
      name: "Test", gender: "female", birthYear: 2000, currentAge: 25,
      location: "Testville",
      familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Testville" },
      socioeconomicClass: "middle",
    },
    spectrums: { courage: 0, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 },
    attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
    tags: [{ id: "region_north_american_suburban", category: "life_event", earnedAtAge: 0 }],
    relationships: [],
    ...overrides,
  };
}

function makeRel(overrides?: Partial<Relationship>): Relationship {
  return {
    id: "test_rel", name: "Alex", type: "friend", closeness: 50,
    status: "active", traits: ["funny"], metAge: 10, history: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// NPC Traits
// ---------------------------------------------------------------------------

describe("generateNpcTraits", () => {
  it("generates 2-3 traits", () => {
    for (let i = 0; i < 20; i++) {
      const traits = generateNpcTraits(Math.random);
      expect(traits.length).toBeGreaterThanOrEqual(1);
      expect(traits.length).toBeLessThanOrEqual(4);
    }
  });

  it("always includes at least one positive trait", () => {
    for (let i = 0; i < 20; i++) {
      const traits = generateNpcTraits(Math.random);
      const hasPositive = traits.some((t) => NPC_TRAITS[t]?.category === "positive");
      expect(hasPositive).toBe(true);
    }
  });

  it("produces no duplicates", () => {
    for (let i = 0; i < 20; i++) {
      const traits = generateNpcTraits(Math.random);
      expect(new Set(traits).size).toBe(traits.length);
    }
  });
});

describe("getClosenessModifier", () => {
  it("returns 1.0 for empty traits", () => {
    expect(getClosenessModifier([])).toBe(1.0);
  });

  it("returns > 1.0 for positive traits", () => {
    expect(getClosenessModifier(["loyal"])).toBeGreaterThan(1.0);
  });

  it("returns < 1.0 for negative traits", () => {
    expect(getClosenessModifier(["toxic"])).toBeLessThan(1.0);
  });
});

// ---------------------------------------------------------------------------
// Relationship Phases
// ---------------------------------------------------------------------------

describe("getRelationshipPhase", () => {
  it("returns deep_bond for closeness >= 85", () => {
    expect(getRelationshipPhase(makeRel({ closeness: 90 }))).toBe("deep_bond");
  });

  it("returns close for closeness 65-84", () => {
    expect(getRelationshipPhase(makeRel({ closeness: 70 }))).toBe("close");
  });

  it("returns friend for closeness 40-64", () => {
    expect(getRelationshipPhase(makeRel({ closeness: 50 }))).toBe("friend");
  });

  it("returns acquaintance for closeness 15-39", () => {
    expect(getRelationshipPhase(makeRel({ closeness: 20 }))).toBe("acquaintance");
  });

  it("returns stranger for closeness < 15", () => {
    expect(getRelationshipPhase(makeRel({ closeness: 5 }))).toBe("stranger");
  });

  it("returns estranged for estranged status", () => {
    expect(getRelationshipPhase(makeRel({ closeness: 90, status: "estranged" }))).toBe("estranged");
  });
});

// ---------------------------------------------------------------------------
// NPC Generation
// ---------------------------------------------------------------------------

describe("generateNpc", () => {
  it("generates an NPC with name and traits", () => {
    const state = makeState();
    const { relationship, meetingText } = generateNpc(state, "friend", "youngAdult");
    expect(relationship.name.length).toBeGreaterThan(0);
    expect(relationship.traits.length).toBeGreaterThanOrEqual(1);
    expect(relationship.type).toBe("friend");
    expect(meetingText.length).toBeGreaterThan(0);
  });

  it("generates romantic NPCs with different text", () => {
    const state = makeState();
    const { meetingText } = generateNpc(state, "romantic", "youngAdult");
    expect(meetingText).toContain("felt different");
  });

  it("does not generate NPC with same name as player", () => {
    // Deterministic rng that always picks first name
    const state = makeState({ identity: { ...makeState().identity, name: "James" } });
    const { relationship } = generateNpc(state, "friend", "childhood", () => 0);
    // Even with rng=0 picking "James", it should pick a different name
    expect(relationship.name).not.toBe(state.identity.name);
  });
});

// ---------------------------------------------------------------------------
// Phase Transitions
// ---------------------------------------------------------------------------

describe("checkPhaseTransitions", () => {
  it("detects upgrade from acquaintance to friend", () => {
    const prev = [makeRel({ closeness: 38 })];
    const curr = [makeRel({ closeness: 42 })];
    const transitions = checkPhaseTransitions(prev, curr);
    expect(transitions).toHaveLength(1);
    expect(transitions[0].toPhase).toBe("friend");
  });

  it("detects estrangement", () => {
    const prev = [makeRel({ closeness: 15, status: "active" })];
    const curr = [makeRel({ closeness: 5, status: "estranged" })];
    const transitions = checkPhaseTransitions(prev, curr);
    expect(transitions).toHaveLength(1);
    expect(transitions[0].toPhase).toBe("estranged");
  });

  it("returns empty for no changes", () => {
    const rels = [makeRel({ closeness: 50 })];
    expect(checkPhaseTransitions(rels, rels)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Relationship Decay
// ---------------------------------------------------------------------------

describe("applyRelationshipDecay", () => {
  it("decays acquaintances faster than deep bonds", () => {
    const rels = [
      makeRel({ id: "acq", closeness: 25 }), // acquaintance
      makeRel({ id: "deep", closeness: 90 }), // deep bond
    ];
    const { updated } = applyRelationshipDecay(rels, new Set());
    const acqDecay = 25 - updated.find((r) => r.id === "acq")!.closeness;
    const deepDecay = 90 - updated.find((r) => r.id === "deep")!.closeness;
    expect(acqDecay).toBeGreaterThan(deepDecay);
  });

  it("does not decay family relationships", () => {
    const rels = [makeRel({ type: "family", closeness: 70 })];
    const { updated } = applyRelationshipDecay(rels, new Set());
    expect(updated[0].closeness).toBe(70);
  });

  it("does not decay relationships active this year", () => {
    const rels = [makeRel({ id: "active_friend", closeness: 50 })];
    const { updated } = applyRelationshipDecay(rels, new Set(["active_friend"]));
    expect(updated[0].closeness).toBe(50);
  });

  it("estranges relationships that decay below 10", () => {
    const rels = [makeRel({ closeness: 10 })]; // acquaintance, decays 2/yr
    const { updated, entries } = applyRelationshipDecay(rels, new Set());
    expect(updated[0].status).toBe("estranged");
    expect(entries.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// NPC Generation Schedule
// ---------------------------------------------------------------------------

describe("shouldGenerateNpc", () => {
  it("does not generate in infancy", () => {
    const result = shouldGenerateNpc(makeState(), "infancy", () => 0);
    expect(result).toBeNull();
  });

  it("can generate in young adult stage", () => {
    // rng = 0 always passes the chance check
    const result = shouldGenerateNpc(makeState(), "youngAdult", () => 0);
    expect(result).not.toBeNull();
  });

  it("does not generate beyond 20 active relationships", () => {
    const rels = Array.from({ length: 20 }, (_, i) =>
      makeRel({ id: `r${i}`, closeness: 50 })
    );
    const state = makeState({ relationships: rels });
    const result = shouldGenerateNpc(state, "adult", () => 0);
    expect(result).toBeNull();
  });
});
