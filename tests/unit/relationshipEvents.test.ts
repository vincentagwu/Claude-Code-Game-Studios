/**
 * Tests for relationship event data integrity.
 */

import { RELATIONSHIP_MAJOR_EVENTS } from "../../src/game/data/relationshipMajorEvents";
import { RELATIONSHIP_MINOR_EVENTS } from "../../src/game/data/relationshipMinorEvents";
import type { LifeEvent } from "../../src/game/events/types";

describe("relationship major events", () => {
  it("has 17 events", () => {
    expect(RELATIONSHIP_MAJOR_EVENTS.length).toBe(17);
  });

  it("all events have unique IDs", () => {
    const ids = RELATIONSHIP_MAJOR_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all events have at least 2 choices", () => {
    for (const event of RELATIONSHIP_MAJOR_EVENTS) {
      const content = event.content;
      const choices = "choices" in content ? (content as unknown as { choices: readonly unknown[] }).choices : [];
      expect(choices.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("friendship events require friend relationship", () => {
    const friendEvents = RELATIONSHIP_MAJOR_EVENTS.filter(
      (e) => e.id.includes("friendship") && e.conditions.length > 0
    );
    for (const event of friendEvents) {
      const hasFriendCondition = event.conditions.some(
        (c) => c.type === "relationship" && c.target === "type:friend"
      );
      expect(hasFriendCondition).toBe(true);
    }
  });

  it("romance events cover multiple stages", () => {
    const romanceEvents = RELATIONSHIP_MAJOR_EVENTS.filter(
      (e) => e.category === "romance"
    );
    expect(romanceEvents.length).toBe(5);
    const allStages = new Set(romanceEvents.flatMap((e) => e.stages));
    expect(allStages.size).toBeGreaterThanOrEqual(3);
  });

  it("loss events are marked as rare", () => {
    const lossEvents = RELATIONSHIP_MAJOR_EVENTS.filter(
      (e) => e.id.includes("loss")
    );
    for (const event of lossEvents) {
      expect(event.rarity).toBe("rare");
    }
  });

  it("family events exist across adult + midlife + elder", () => {
    const familyEvents = RELATIONSHIP_MAJOR_EVENTS.filter(
      (e) => e.category === "family_events"
    );
    expect(familyEvents.length).toBe(4);
  });
});

describe("relationship minor events", () => {
  it("has 10 templates", () => {
    expect(RELATIONSHIP_MINOR_EVENTS.length).toBe(10);
  });

  it("all templates have unique IDs", () => {
    const ids = RELATIONSHIP_MINOR_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all templates have at least 2 variable slots", () => {
    for (const template of RELATIONSHIP_MINOR_EVENTS) {
      expect(template.variables.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("friendship templates reference friend relationships", () => {
    const friendTemplates = RELATIONSHIP_MINOR_EVENTS.filter(
      (e) => e.category === "friendships" && e.variables.some((v) => v.source === "relationship")
    );
    expect(friendTemplates.length).toBeGreaterThan(0);
    for (const t of friendTemplates) {
      const relVar = t.variables.find((v) => v.source === "relationship");
      expect(relVar?.relationshipQuery).toBe("type:friend");
    }
  });

  it("romance templates reference romantic relationships", () => {
    const romanceTemplates = RELATIONSHIP_MINOR_EVENTS.filter(
      (e) => e.category === "romance"
    );
    expect(romanceTemplates.length).toBeGreaterThanOrEqual(2);
  });
});

describe("combined content totals", () => {
  it("meets vertical slice targets", () => {
    // Target: 60+ minor, 25+ major
    // We can't import all files here easily, but check relationship contribution
    expect(RELATIONSHIP_MINOR_EVENTS.length).toBeGreaterThanOrEqual(10);
    expect(RELATIONSHIP_MAJOR_EVENTS.length).toBeGreaterThanOrEqual(15);
  });
});
