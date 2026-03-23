/**
 * Tests for epitaph generation logic.
 */

import { generateEpitaph } from "../../src/game/engine/epitaphGenerator";
import type { CharacterState } from "../../src/game/state/types";

function makeState(overrides?: Partial<CharacterState>): CharacterState {
  return {
    identity: {
      name: "Alice", gender: "female", birthYear: 1950, currentAge: 78,
      location: "Portland",
      familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Portland" },
      socioeconomicClass: "middle",
    },
    spectrums: { courage: 60, generosity: 30, sociability: -10, ambition: 45, empathy: 70, conformity: -20 },
    attributes: { health: 30, wealth: 65, education: 75, career: 80, relationships: 55, happiness: 70, stress: 25 },
    tags: [
      { id: "region_north_american_suburban", category: "life_event", earnedAtAge: 0 },
      { id: "class_middle", category: "life_event", earnedAtAge: 0 },
      { id: "family_two_parent_stable", category: "family", earnedAtAge: 0 },
      { id: "college_graduate", category: "education", earnedAtAge: 22 },
      { id: "married", category: "family", earnedAtAge: 28 },
      { id: "parent", category: "family", earnedAtAge: 32 },
      { id: "retired", category: "career", earnedAtAge: 65 },
    ],
    relationships: [
      { id: "spouse", name: "Bob", type: "romantic", closeness: 85, status: "active", traits: [], metAge: 24, history: [] },
      { id: "friend1", name: "Sam", type: "friend", closeness: 10, status: "estranged", traits: [], metAge: 15, history: [] },
      { id: "parent1", name: "Mom", type: "family", closeness: 0, status: "deceased", traits: [], metAge: 0, history: [] },
    ],
    ...overrides,
  };
}

describe("generateEpitaph", () => {
  it("returns correct name and age", () => {
    const epitaph = generateEpitaph(makeState());
    expect(epitaph.name).toBe("Alice");
    expect(epitaph.age).toBe(78);
    expect(epitaph.location).toBe("Portland");
  });

  it("generates a headline based on happiness and wealth", () => {
    const happy = generateEpitaph(makeState({ attributes: { health: 30, wealth: 65, education: 75, career: 80, relationships: 55, happiness: 75, stress: 25 } }));
    expect(happy.headline).toContain("well-lived");

    const struggling = generateEpitaph(makeState({ attributes: { health: 30, wealth: 20, education: 75, career: 80, relationships: 55, happiness: 20, stress: 25 } }));
    expect(struggling.headline).toContain("hardship");
  });

  it("generates different headlines for young deaths", () => {
    const young = generateEpitaph(makeState({
      identity: { name: "Alex", gender: "male", birthYear: 2000, currentAge: 15, location: "NYC", familyBackground: { parentTraits: [], originClass: "middle", originLocation: "NYC" }, socioeconomicClass: "middle" },
    }));
    expect(young.headline).toContain("short");
  });

  it("generates personality summary from dominant spectrums", () => {
    const epitaph = generateEpitaph(makeState());
    // courage 60, empathy 70, ambition 45 are the dominant spectrums
    expect(epitaph.personality).toContain("Known for being");
  });

  it("handles neutral personality", () => {
    const neutral = generateEpitaph(makeState({
      spectrums: { courage: 0, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 },
    }));
    expect(neutral.personality).toContain("neutrality");
  });

  it("identifies notable attributes (high and low)", () => {
    const epitaph = generateEpitaph(makeState());
    // career: 80 (Accomplished), education: 75 (Educated → >= 70)
    expect(epitaph.notableAttributes.length).toBeGreaterThan(0);
  });

  it("filters out region/class/family tags from life story", () => {
    const epitaph = generateEpitaph(makeState());
    const storyIds = epitaph.lifeStory.map((s) => s.toLowerCase());
    expect(storyIds.every((s) => !s.startsWith("region"))).toBe(true);
    expect(storyIds.every((s) => !s.startsWith("class"))).toBe(true);
  });

  it("generates relationship summary", () => {
    const epitaph = generateEpitaph(makeState());
    // 1 active, 1 estranged, 1 deceased
    expect(epitaph.relationships).toContain("1 close bond");
    expect(epitaph.relationships).toContain("1 lost along the way");
    expect(epitaph.relationships).toContain("1 gone before them");
  });

  it("handles solitary life", () => {
    const lonely = generateEpitaph(makeState({ relationships: [] }));
    expect(lonely.relationships).toBe("Lived a solitary life.");
  });

  it("generates final words appropriate to age", () => {
    const old = generateEpitaph(makeState());
    expect(old.finalWords.length).toBeGreaterThan(0);

    const middleAged = generateEpitaph(makeState({
      identity: { name: "Test", gender: "male", birthYear: 1980, currentAge: 45, location: "Test", familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Test" }, socioeconomicClass: "middle" },
    }));
    expect(middleAged.finalWords).toContain("unfinished");
  });
});
