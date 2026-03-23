/**
 * Tests for branch point tracking and life record creation.
 */

import type { BranchPoint, LifeRecord } from "../../src/game/tree/types";
import type { CharacterState } from "../../src/game/state/types";
import { generateEpitaph } from "../../src/game/engine/epitaphGenerator";
import { serialize, deserialize } from "../../src/game/state/serialization";

function makeState(): CharacterState {
  return {
    identity: {
      name: "Test", gender: "female", birthYear: 2000, currentAge: 25,
      location: "Testville",
      familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Testville" },
      socioeconomicClass: "middle",
    },
    spectrums: { courage: 30, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 },
    attributes: { health: 80, wealth: 50, education: 50, career: 50, relationships: 50, happiness: 50, stress: 30 },
    tags: [{ id: "college_graduate", category: "education", earnedAtAge: 22 }],
    relationships: [],
  };
}

describe("BranchPoint creation", () => {
  it("creates a valid branch point with state snapshot", () => {
    const state = makeState();
    const bp: BranchPoint = {
      id: "bp_1",
      lifeId: "life_1",
      age: 25,
      eventId: "career_crossroads",
      chosenOptionId: "take_promotion",
      alternateOptionIds: ["join_startup"],
      stateSnapshot: deserialize(serialize(state)),
      explored: false,
    };

    expect(bp.stateSnapshot.identity.name).toBe("Test");
    expect(bp.stateSnapshot.identity.currentAge).toBe(25);
    expect(bp.alternateOptionIds).toHaveLength(1);
    expect(bp.explored).toBe(false);
  });

  it("state snapshot is a deep copy (modifications don't affect original)", () => {
    const state = makeState();
    const snapshot = deserialize(serialize(state));

    // Modify the snapshot
    snapshot.attributes.wealth = 99;
    snapshot.identity.currentAge = 50;

    // Original should be unchanged
    expect(state.attributes.wealth).toBe(50);
    expect(state.identity.currentAge).toBe(25);
  });
});

describe("LifeRecord creation", () => {
  it("creates a valid life record with epitaph and branches", () => {
    const state = makeState();
    const epitaph = generateEpitaph(state);

    const record: LifeRecord = {
      id: "life_1",
      name: state.identity.name,
      deathAge: state.identity.currentAge,
      region: "region_north_american_suburban",
      epitaph,
      branchPoints: [
        {
          id: "bp_1", lifeId: "life_1", age: 18, eventId: "college_decision",
          chosenOptionId: "attend_college", alternateOptionIds: ["skip_college"],
          stateSnapshot: state, explored: false,
        },
        {
          id: "bp_2", lifeId: "life_1", age: 25, eventId: "career_crossroads",
          chosenOptionId: "take_promotion", alternateOptionIds: ["join_startup"],
          stateSnapshot: state, explored: false,
        },
      ],
      completedAt: Date.now(),
    };

    expect(record.branchPoints).toHaveLength(2);
    expect(record.epitaph.name).toBe("Test");
    expect(record.name).toBe("Test");
  });

  it("supports parent-child life links", () => {
    const record: LifeRecord = {
      id: "life_2",
      name: "Child",
      deathAge: 70,
      region: "region_european_urban",
      epitaph: generateEpitaph(makeState()),
      branchPoints: [],
      parentLifeId: "life_1",
      sourceBranchId: "bp_1",
      completedAt: Date.now(),
    };

    expect(record.parentLifeId).toBe("life_1");
    expect(record.sourceBranchId).toBe("bp_1");
  });
});

describe("branch replay state preparation", () => {
  it("restoring from a branch point snapshot gives the correct state", () => {
    const originalState = makeState();
    originalState.attributes.wealth = 75;

    const bp: BranchPoint = {
      id: "bp_1", lifeId: "life_1", age: 25, eventId: "test",
      chosenOptionId: "a", alternateOptionIds: ["b"],
      stateSnapshot: deserialize(serialize(originalState)),
      explored: false,
    };

    // Simulate replay: restore state from snapshot
    const restoredState = deserialize(serialize(bp.stateSnapshot));
    expect(restoredState.attributes.wealth).toBe(75);
    expect(restoredState.identity.currentAge).toBe(25);
    expect(restoredState.identity.name).toBe("Test");
  });
});
