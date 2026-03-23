/**
 * Tests for the Life Event Generator — full pipeline.
 */

import {
  generateEventsForYear,
  createEventHistory,
  recordEventFired,
} from "../../src/game/engine/lifeEventGenerator";
import { useGameStore } from "../../src/game/state/useGameStore";
import { STAGES, getStageForAge } from "../../src/game/stages/lifeStages";
import type { CharacterState, DerivedFlags } from "../../src/game/state/types";
import type { LifeEvent } from "../../src/game/events/types";

const baseState: CharacterState = {
  identity: {
    name: "Test", gender: "female", birthYear: 2000, currentAge: 10,
    location: "Testville",
    familyBackground: { parentTraits: [], originClass: "middle", originLocation: "Testville" },
    socioeconomicClass: "middle",
  },
  spectrums: { courage: 0, generosity: 0, sociability: 0, ambition: 0, empathy: 0, conformity: 0 },
  attributes: { health: 80, wealth: 50, education: 50, career: 30, relationships: 50, happiness: 50, stress: 30 },
  tags: [],
  relationships: [
    { id: "friend_a", name: "Alex", type: "friend", closeness: 60, status: "active", traits: [], metAge: 6, history: [] },
  ],
};

const baseFlags: DerivedFlags = {
  isEmployed: false, isMarried: false, hasChildren: false,
  hasDebt: false, ownsHome: false, hasCriminalRecord: false, isRetired: false,
};

function makeEvent(overrides: Partial<LifeEvent>): LifeEvent {
  return {
    id: "test_event",
    type: "minor",
    category: "school",
    stages: ["childhood"],
    minAge: 6, maxAge: 11,
    conditions: [],
    exclusions: [],
    prerequisites: [],
    weight: 50,
    maxOccurrences: 3,
    isMilestone: false,
    format: "timeline_popup",
    content: { text: "Test event" },
    effects: [],
    tags: [],
    rarity: "common",
    author: "test",
    ...overrides,
  } as LifeEvent;
}

beforeEach(() => {
  useGameStore.setState({
    character: baseState,
    spectrumsReinforcedThisYear: new Set(),
    relationshipsActiveThisYear: new Set(),
  });
});

describe("generateEventsForYear", () => {
  it("returns events for eligible events", () => {
    const pool = [
      makeEvent({ id: "ev1" }),
      makeEvent({ id: "ev2" }),
      makeEvent({ id: "ev3" }),
    ];
    const stage = getStageForAge(10);
    const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, createEventHistory(), undefined, () => 0.5);
    expect(events.length).toBeGreaterThan(0);
  });

  it("filters out events from wrong stage", () => {
    const pool = [makeEvent({ id: "ev1", stages: ["adult"] })];
    const stage = getStageForAge(10);
    const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, createEventHistory());
    expect(events).toHaveLength(0);
  });

  it("filters out events outside age range", () => {
    const pool = [makeEvent({ id: "ev1", minAge: 15, maxAge: 20 })];
    const stage = getStageForAge(10);
    const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, createEventHistory());
    expect(events).toHaveLength(0);
  });

  it("respects maxOccurrences", () => {
    const pool = [makeEvent({ id: "ev1", maxOccurrences: 1 })];
    const stage = getStageForAge(10);
    let history = createEventHistory();
    history = recordEventFired(history, "ev1", 8);
    const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, history);
    expect(events).toHaveLength(0);
  });

  it("milestones always fire", () => {
    const pool = [
      makeEvent({ id: "milestone_ev", isMilestone: true, weight: 100 }),
      makeEvent({ id: "regular_ev", weight: 50 }),
    ];
    const stage = getStageForAge(10);
    const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, createEventHistory());
    expect(events.some((e) => e.id === "milestone_ev")).toBe(true);
  });

  it("major events appear before minor events", () => {
    const pool = [
      makeEvent({ id: "minor_ev", type: "minor", weight: 100 }),
      makeEvent({ id: "major_ev", type: "major", weight: 100, format: "scenario_card", content: { setup: "test", choices: [] } }),
    ];
    const stage = getStageForAge(10);
    const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, createEventHistory());
    if (events.length >= 2) {
      const majorIdx = events.findIndex((e) => e.type === "major");
      const minorIdx = events.findIndex((e) => e.type === "minor");
      if (majorIdx >= 0 && minorIdx >= 0) {
        expect(majorIdx).toBeLessThan(minorIdx);
      }
    }
  });

  it("freshness reduces weight of recently fired events", () => {
    // Use maxOccurrences: 1 so only one can be picked per run
    const pool = [
      makeEvent({ id: "fresh", weight: 50, maxOccurrences: 1 }),
      makeEvent({ id: "stale", weight: 50, maxOccurrences: 1 }),
    ];
    const stage = getStageForAge(10);
    let history = createEventHistory();
    history = recordEventFired(history, "stale", 9);

    let freshFirst = 0;
    let staleFirst = 0;
    for (let i = 0; i < 200; i++) {
      // Each run gets a fresh history for "stale" occurrence tracking
      // but stale was already fired at age 9 (freshness penalty)
      const testHistory = recordEventFired(createEventHistory(), "stale", 9);
      const events = generateEventsForYear(baseState, baseFlags, stage, 10, pool, testHistory, undefined, Math.random);
      if (events.length > 0) {
        if (events[0].id === "fresh") freshFirst++;
        else if (events[0].id === "stale") staleFirst++;
      }
    }
    // With freshness penalty on "stale", "fresh" should win more selection races
    expect(freshFirst).toBeGreaterThanOrEqual(staleFirst);
  });
});

describe("EventHistory", () => {
  it("records events correctly", () => {
    let history = createEventHistory();
    history = recordEventFired(history, "ev1", 10);
    history = recordEventFired(history, "ev1", 15);
    history = recordEventFired(history, "ev2", 12);

    expect(history.firedEvents.get("ev1")).toEqual([10, 15]);
    expect(history.firedEvents.get("ev2")).toEqual([12]);
  });

  it("creates empty history", () => {
    const history = createEventHistory();
    expect(history.firedEvents.size).toBe(0);
  });
});
