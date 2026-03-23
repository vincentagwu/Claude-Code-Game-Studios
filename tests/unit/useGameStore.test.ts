/**
 * Tests for the Zustand game store — Character State Model operations.
 *
 * Covers: attribute clamping 0-100, spectrum clamping -100/+100,
 * personality inertia, passive drifts, flag recalculation, effect application.
 */

import { useGameStore } from "../../src/game/state/useGameStore";
import type { CharacterState } from "../../src/game/state/types";

/** Factory for a baseline character state. */
function makeCharacter(overrides?: Partial<CharacterState>): CharacterState {
  return {
    identity: {
      name: "Test Person",
      gender: "nonbinary",
      birthYear: 2000,
      currentAge: 25,
      location: "Testville",
      familyBackground: {
        parentTraits: [],
        originClass: "middle",
        originLocation: "Testville",
      },
      socioeconomicClass: "middle",
    },
    spectrums: {
      courage: 0,
      generosity: 0,
      sociability: 0,
      ambition: 0,
      empathy: 0,
      conformity: 0,
    },
    attributes: {
      health: 80,
      wealth: 50,
      education: 50,
      career: 50,
      relationships: 50,
      happiness: 50,
      stress: 30,
    },
    tags: [],
    relationships: [],
    ...overrides,
  };
}

function resetStore() {
  useGameStore.setState({
    character: null,
    spectrumsReinforcedThisYear: new Set(),
    relationshipsActiveThisYear: new Set(),
  });
}

beforeEach(resetStore);

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

describe("initializeCharacter", () => {
  it("sets the character state", () => {
    const char = makeCharacter();
    useGameStore.getState().initializeCharacter(char);
    expect(useGameStore.getState().character).toEqual(char);
  });

  it("resets yearly tracking sets", () => {
    useGameStore.getState().initializeCharacter(makeCharacter());
    expect(useGameStore.getState().spectrumsReinforcedThisYear.size).toBe(0);
    expect(useGameStore.getState().relationshipsActiveThisYear.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Attribute effects
// ---------------------------------------------------------------------------

describe("applyEffect — attribute", () => {
  beforeEach(() => {
    useGameStore.getState().initializeCharacter(makeCharacter());
  });

  it("adds to an attribute", () => {
    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "wealth",
      operation: "add",
      value: 10,
    });
    expect(useGameStore.getState().character!.attributes.wealth).toBe(60);
  });

  it("clamps attribute to 100 on overflow", () => {
    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "health",
      operation: "add",
      value: 50,
    });
    expect(useGameStore.getState().character!.attributes.health).toBe(100);
  });

  it("clamps attribute to 0 on underflow", () => {
    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "wealth",
      operation: "add",
      value: -100,
    });
    expect(useGameStore.getState().character!.attributes.wealth).toBe(0);
  });

  it("multiplies an attribute", () => {
    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "health",
      operation: "multiply",
      value: 0.5,
    });
    expect(useGameStore.getState().character!.attributes.health).toBe(40);
  });

  it("sets an attribute", () => {
    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "stress",
      operation: "set",
      value: 75,
    });
    expect(useGameStore.getState().character!.attributes.stress).toBe(75);
  });

  it("updates socioeconomic class when wealth changes", () => {
    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "wealth",
      operation: "set",
      value: 90,
    });
    expect(useGameStore.getState().character!.identity.socioeconomicClass).toBe(
      "upper"
    );

    useGameStore.getState().applyEffect({
      type: "attribute",
      target: "wealth",
      operation: "set",
      value: 10,
    });
    expect(useGameStore.getState().character!.identity.socioeconomicClass).toBe(
      "lower"
    );
  });
});

// ---------------------------------------------------------------------------
// Spectrum effects
// ---------------------------------------------------------------------------

describe("applyEffect — spectrum", () => {
  beforeEach(() => {
    useGameStore.getState().initializeCharacter(makeCharacter());
  });

  it("applies a spectrum delta", () => {
    useGameStore.getState().applyEffect({
      type: "spectrum",
      target: "courage",
      delta: 15,
    });
    expect(useGameStore.getState().character!.spectrums.courage).toBe(15);
  });

  it("clamps spectrum to +100", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({ spectrums: { courage: 95, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 } })
    );
    useGameStore.getState().applyEffect({
      type: "spectrum",
      target: "courage",
      delta: 20,
    });
    expect(useGameStore.getState().character!.spectrums.courage).toBe(100);
  });

  it("clamps spectrum to -100", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({ spectrums: { courage: -95, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 } })
    );
    useGameStore.getState().applyEffect({
      type: "spectrum",
      target: "courage",
      delta: -20,
    });
    expect(useGameStore.getState().character!.spectrums.courage).toBe(-100);
  });

  it("applies inertia on opposite-direction shift", () => {
    // courage at +80, shifting negative (opposite)
    // inertia_factor = 1.0 - (0.2 * 80/100) = 0.84
    // effective_delta = -20 * 0.84 = -16.8 → rounded to -17
    useGameStore.getState().initializeCharacter(
      makeCharacter({ spectrums: { courage: 80, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 } })
    );
    useGameStore.getState().applyEffect({
      type: "spectrum",
      target: "courage",
      delta: -20,
    });
    expect(useGameStore.getState().character!.spectrums.courage).toBe(63); // 80 + (-17)
  });

  it("does NOT apply inertia on same-direction shift (reinforcing)", () => {
    // courage at +80, shifting positive (same direction) — full delta
    useGameStore.getState().initializeCharacter(
      makeCharacter({ spectrums: { courage: 80, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 } })
    );
    useGameStore.getState().applyEffect({
      type: "spectrum",
      target: "courage",
      delta: 10,
    });
    expect(useGameStore.getState().character!.spectrums.courage).toBe(90);
  });

  it("tracks reinforced spectrums for decay prevention", () => {
    useGameStore.getState().applyEffect({
      type: "spectrum",
      target: "empathy",
      delta: 5,
    });
    expect(useGameStore.getState().spectrumsReinforcedThisYear.has("empathy")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tag effects
// ---------------------------------------------------------------------------

describe("applyEffect — tag", () => {
  beforeEach(() => {
    useGameStore.getState().initializeCharacter(makeCharacter());
  });

  it("adds a tag", () => {
    useGameStore.getState().applyEffect({
      type: "tag",
      tagId: "college_graduate",
      category: "education",
    });
    const tags = useGameStore.getState().character!.tags;
    expect(tags).toHaveLength(1);
    expect(tags[0].id).toBe("college_graduate");
    expect(tags[0].category).toBe("education");
    expect(tags[0].earnedAtAge).toBe(25);
  });

  it("does not duplicate tags", () => {
    useGameStore.getState().applyEffect({
      type: "tag",
      tagId: "married",
      category: "family",
    });
    useGameStore.getState().applyEffect({
      type: "tag",
      tagId: "married",
      category: "family",
    });
    expect(useGameStore.getState().character!.tags).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Relationship effects
// ---------------------------------------------------------------------------

describe("applyEffect — relationship", () => {
  const withRelationships = () =>
    makeCharacter({
      relationships: [
        {
          id: "friend_marcus",
          name: "Marcus",
          type: "friend",
          closeness: 60,
          status: "active",
          traits: ["funny"],
          metAge: 10,
          history: [],
        },
        {
          id: "mom",
          name: "Mom",
          type: "family",
          closeness: 80,
          status: "active",
          traits: ["supportive"],
          metAge: 0,
          history: [],
        },
      ],
    });

  beforeEach(() => {
    useGameStore.getState().initializeCharacter(withRelationships());
  });

  it("modifies relationship closeness", () => {
    useGameStore.getState().applyEffect({
      type: "relationship",
      relationshipId: "friend_marcus",
      closenessChange: 10,
    });
    const marcus = useGameStore.getState().character!.relationships.find(
      (r) => r.id === "friend_marcus"
    )!;
    expect(marcus.closeness).toBe(70);
  });

  it("auto-estranges when closeness drops below 10", () => {
    useGameStore.getState().applyEffect({
      type: "relationship",
      relationshipId: "friend_marcus",
      closenessChange: -55,
    });
    const marcus = useGameStore.getState().character!.relationships.find(
      (r) => r.id === "friend_marcus"
    )!;
    expect(marcus.closeness).toBe(5);
    expect(marcus.status).toBe("estranged");
  });

  it("changes relationship status", () => {
    useGameStore.getState().applyEffect({
      type: "relationship",
      relationshipId: "friend_marcus",
      newStatus: "deceased",
    });
    const marcus = useGameStore.getState().character!.relationships.find(
      (r) => r.id === "friend_marcus"
    )!;
    expect(marcus.status).toBe("deceased");
  });

  it("tracks active relationships for decay prevention", () => {
    useGameStore.getState().applyEffect({
      type: "relationship",
      relationshipId: "friend_marcus",
      closenessChange: 5,
    });
    expect(
      useGameStore.getState().relationshipsActiveThisYear.has("friend_marcus")
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Passive drifts
// ---------------------------------------------------------------------------

describe("applyPassiveDrifts", () => {
  it("decays unreinforced personality spectrums toward 0", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({ spectrums: { courage: 50, generosity: -30, sociability: 0, ambition: 0, empathy: 0, conformity: 0 } })
    );
    useGameStore.getState().applyPassiveDrifts();
    const s = useGameStore.getState().character!.spectrums;
    expect(s.courage).toBe(49);
    expect(s.generosity).toBe(-29);
    expect(s.sociability).toBe(0); // already 0, no change
  });

  it("does NOT decay spectrums that were reinforced this year", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({ spectrums: { courage: 50, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 } })
    );
    // Reinforce courage
    useGameStore.getState().applyEffect({ type: "spectrum", target: "courage", delta: 1 });
    useGameStore.getState().applyPassiveDrifts();
    // courage was 50 + 1 = 51, then NO decay because reinforced
    expect(useGameStore.getState().character!.spectrums.courage).toBe(51);
  });

  it("applies health aging after age 40 (combined with stress penalty)", () => {
    // Base aging rate of 0.5/yr rounds to 0 on integers, so we combine with
    // stress > 80 penalty (-1/yr) to produce measurable drift: -1.5 total.
    // round(80 - 1.5) = round(78.5) = 79
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        identity: {
          name: "Test", gender: "male", birthYear: 1960, currentAge: 45,
          location: "Testville",
          familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Testville" },
          socioeconomicClass: "middle",
        },
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 90 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    const healthAfter = useGameStore.getState().character!.attributes.health;
    // aging (-0.5) + stress penalty (-1.0) = -1.5 → round(78.5) = 79
    expect(healthAfter).toBe(79);
  });

  it("accelerates health aging after age 60", () => {
    // Age 70: aging_multiplier = 1.0 + (70-60)*0.05 = 1.5
    // health_drift = -0.5 * 1.5 = -0.75 → rounded to -1
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        identity: {
          name: "Test", gender: "male", birthYear: 1950, currentAge: 70,
          location: "Testville",
          familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Testville" },
          socioeconomicClass: "middle",
        },
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    // stress recovery -2, then health aging accelerated
    const h = useGameStore.getState().character!.attributes.health;
    expect(h).toBeLessThan(80);
  });

  it("applies stress → health penalty when stress > 80", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 90 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    const a = useGameStore.getState().character!.attributes;
    // stress recovery -2 → 88, poverty no, health penalty -1 for stress>80
    expect(a.health).toBeLessThan(80);
  });

  it("applies stress natural recovery", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 50 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    expect(useGameStore.getState().character!.attributes.stress).toBe(48); // 50 - 2
  });

  it("applies poverty → stress when wealth < 20", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 15, education: 50, career: 50, relationships: 50, happiness: 50, stress: 50 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    // stress: 50 - 2 (recovery) + 2 (poverty) = 50
    expect(useGameStore.getState().character!.attributes.stress).toBe(50);
  });

  it("applies happiness hedonic adaptation downward when > 70", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 85, stress: 30 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    const h = useGameStore.getState().character!.attributes.happiness;
    expect(h).toBeLessThan(85);
  });

  it("applies happiness hedonic adaptation upward when < 30", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 20, stress: 30 },
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    const h = useGameStore.getState().character!.attributes.happiness;
    expect(h).toBeGreaterThan(20);
  });

  it("applies relationship happiness bonus when relationships > 60", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 70, happiness: 50, stress: 30 },
        relationships: [
          { id: "a", name: "A", type: "friend", closeness: 70, status: "active", traits: [], metAge: 10, history: [] },
        ],
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    // happiness stays at 50 (in 30-70 band, no adaptation) but gets +1 relationship bonus
    // relationships recalculated: friend decayed from 70 → 69, avg = 69 still > 60
    const h = useGameStore.getState().character!.attributes.happiness;
    expect(h).toBe(51);
  });

  it("decays non-family relationships that had no events this year", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        relationships: [
          { id: "friend_a", name: "A", type: "friend", closeness: 50, status: "active", traits: [], metAge: 10, history: [] },
          { id: "mom", name: "Mom", type: "family", closeness: 80, status: "active", traits: [], metAge: 0, history: [] },
        ],
      })
    );
    useGameStore.getState().applyPassiveDrifts();
    const rels = useGameStore.getState().character!.relationships;
    expect(rels.find((r) => r.id === "friend_a")!.closeness).toBe(49);
    expect(rels.find((r) => r.id === "mom")!.closeness).toBe(80); // family doesn't decay
  });
});

// ---------------------------------------------------------------------------
// Derived flags
// ---------------------------------------------------------------------------

describe("recalculateFlags", () => {
  it("computes isEmployed correctly", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 30, relationships: 50, happiness: 50, stress: 30 },
        tags: [],
      })
    );
    expect(useGameStore.getState().recalculateFlags().isEmployed).toBe(true);
  });

  it("isEmployed is false when career <= 20", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 15, relationships: 50, happiness: 50, stress: 30 },
      })
    );
    expect(useGameStore.getState().recalculateFlags().isEmployed).toBe(false);
  });

  it("isEmployed is false when fired tag exists", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
        tags: [{ id: "fired", category: "career", earnedAtAge: 30 }],
      })
    );
    expect(useGameStore.getState().recalculateFlags().isEmployed).toBe(false);
  });

  it("computes isMarried correctly", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        tags: [{ id: "married", category: "family", earnedAtAge: 28 }],
      })
    );
    expect(useGameStore.getState().recalculateFlags().isMarried).toBe(true);
  });

  it("isMarried is false after divorce", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        tags: [
          { id: "married", category: "family", earnedAtAge: 28 },
          { id: "divorced", category: "family", earnedAtAge: 35 },
        ],
      })
    );
    expect(useGameStore.getState().recalculateFlags().isMarried).toBe(false);
  });

  it("computes hasChildren from parent tag", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        tags: [{ id: "parent", category: "family", earnedAtAge: 30 }],
      })
    );
    expect(useGameStore.getState().recalculateFlags().hasChildren).toBe(true);
  });

  it("computes hasDebt from wealth < 30 AND debt tag", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 20, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
        tags: [{ id: "debt", category: "life_event", earnedAtAge: 25 }],
      })
    );
    expect(useGameStore.getState().recalculateFlags().hasDebt).toBe(true);
  });

  it("hasDebt is false without debt tag even at low wealth", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 20, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
      })
    );
    expect(useGameStore.getState().recalculateFlags().hasDebt).toBe(false);
  });

  it("computes ownsHome from wealth > 50 AND homeowner tag", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        attributes: { health: 80, wealth: 60, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
        tags: [{ id: "homeowner", category: "life_event", earnedAtAge: 32 }],
      })
    );
    expect(useGameStore.getState().recalculateFlags().ownsHome).toBe(true);
  });

  it("computes isRetired from retired tag", () => {
    useGameStore.getState().initializeCharacter(
      makeCharacter({
        tags: [{ id: "retired", category: "career", earnedAtAge: 65 }],
      })
    );
    const flags = useGameStore.getState().recalculateFlags();
    expect(flags.isRetired).toBe(true);
    expect(flags.isEmployed).toBe(false); // retired implies not employed
  });

  it("returns all false when no character", () => {
    const flags = useGameStore.getState().recalculateFlags();
    expect(flags.isEmployed).toBe(false);
    expect(flags.isMarried).toBe(false);
    expect(flags.hasChildren).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Reset year tracking
// ---------------------------------------------------------------------------

describe("resetYearTracking", () => {
  it("clears both tracking sets", () => {
    useGameStore.getState().initializeCharacter(makeCharacter());
    useGameStore.getState().applyEffect({ type: "spectrum", target: "courage", delta: 5 });
    useGameStore.getState().applyEffect({
      type: "relationship",
      relationshipId: "test",
      closenessChange: 1,
    });
    useGameStore.getState().resetYearTracking();
    expect(useGameStore.getState().spectrumsReinforcedThisYear.size).toBe(0);
    expect(useGameStore.getState().relationshipsActiveThisYear.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// No-op when no character
// ---------------------------------------------------------------------------

describe("no-op safety", () => {
  it("applyEffect does nothing when no character", () => {
    expect(() => {
      useGameStore.getState().applyEffect({
        type: "attribute",
        target: "health",
        operation: "add",
        value: 10,
      });
    }).not.toThrow();
  });

  it("applyPassiveDrifts does nothing when no character", () => {
    expect(() => {
      useGameStore.getState().applyPassiveDrifts();
    }).not.toThrow();
  });
});
