/**
 * Integration test — save/load round-trip for mid-life characters.
 *
 * Verifies that serialization preserves a character mid-life with
 * tags, relationships, modified attributes, and personality shifts.
 */

import { serialize, deserialize } from "../../src/game/state/serialization";
import { generateStartingConditions } from "../../src/game/state/startingConditions";
import { useGameStore } from "../../src/game/state/useGameStore";
import type { CharacterState } from "../../src/game/state/types";

function makeSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

describe("save/load round-trip", () => {
  it("preserves a generated starting character through serialize/deserialize", () => {
    const rng = makeSeededRng(42);
    const original = generateStartingConditions(rng);

    const json = serialize(original);
    const restored = deserialize(json);

    expect(restored.identity.name).toBe(original.identity.name);
    expect(restored.identity.gender).toBe(original.identity.gender);
    expect(restored.identity.location).toBe(original.identity.location);
    expect(restored.attributes).toEqual(original.attributes);
    expect(restored.spectrums).toEqual(original.spectrums);
    expect(restored.tags.length).toBe(original.tags.length);
    expect(restored.relationships.length).toBe(original.relationships.length);
  });

  it("preserves a modified mid-life character", () => {
    const rng = makeSeededRng(77);
    const start = generateStartingConditions(rng);

    // Simulate mid-life modifications
    useGameStore.getState().initializeCharacter(start);

    // Age up
    useGameStore.setState({
      character: {
        ...useGameStore.getState().character!,
        identity: {
          ...useGameStore.getState().character!.identity,
          currentAge: 35,
        },
      },
    });

    // Apply some effects
    useGameStore.getState().applyEffect({
      type: "attribute", target: "wealth", operation: "add", value: 20,
    });
    useGameStore.getState().applyEffect({
      type: "spectrum", target: "courage", delta: 30,
    });
    useGameStore.getState().applyEffect({
      type: "tag", tagId: "married", category: "family",
    });
    useGameStore.getState().applyEffect({
      type: "tag", tagId: "college_graduate", category: "education",
    });

    const modified = useGameStore.getState().character!;

    // Round-trip
    const json = serialize(modified);
    const restored = deserialize(json);

    expect(restored.identity.currentAge).toBe(35);
    expect(restored.attributes.wealth).toBe(modified.attributes.wealth);
    expect(restored.spectrums.courage).toBe(modified.spectrums.courage);
    expect(restored.tags.find((t) => t.id === "married")).toBeTruthy();
    expect(restored.tags.find((t) => t.id === "college_graduate")).toBeTruthy();
    expect(restored.identity.socioeconomicClass).toBe(modified.identity.socioeconomicClass);
  });

  it("preserves relationship modifications", () => {
    const rng = makeSeededRng(55);
    const start = generateStartingConditions(rng);
    useGameStore.getState().initializeCharacter(start);

    // Modify a relationship if one exists
    const char = useGameStore.getState().character!;
    if (char.relationships.length > 0) {
      const firstRel = char.relationships[0];
      useGameStore.getState().applyEffect({
        type: "relationship",
        relationshipId: firstRel.id,
        closenessChange: -20,
      });

      const modified = useGameStore.getState().character!;
      const json = serialize(modified);
      const restored = deserialize(json);

      const originalRel = restored.relationships.find((r) => r.id === firstRel.id);
      expect(originalRel).toBeTruthy();
      expect(originalRel!.closeness).toBe(
        modified.relationships.find((r) => r.id === firstRel.id)!.closeness
      );
    }
  });

  it("handles multiple serialize/deserialize cycles without drift", () => {
    const rng = makeSeededRng(123);
    const start = generateStartingConditions(rng);

    let state: CharacterState = start;

    // 10 round-trips
    for (let i = 0; i < 10; i++) {
      const json = serialize(state);
      state = deserialize(json);
    }

    // Should be identical to original
    expect(state.identity.name).toBe(start.identity.name);
    expect(state.attributes).toEqual(start.attributes);
    expect(state.spectrums).toEqual(start.spectrums);
  });
});
