"use client";

/**
 * React hook that runs the timeline engine, advancing years on a timer.
 *
 * Manages the tick loop, pacing, pause/resume, and event queue.
 * Returns timeline entries and control functions for the UI.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStore } from "../state/useGameStore";
import { getStageForAge, getSecondsPerYear } from "../stages/lifeStages";
import { saveGame } from "../persistence/saveManager";
import {
  processYearTick,
  resetEntryCounter,
  type TimelineEntry,
} from "./timelineEngine";
import { createEventHistory, type EventHistory } from "./lifeEventGenerator";
import type { LifeEvent } from "../events/types";
import type { DelayedEffect } from "../state/types";

export type TimelineState = "running" | "paused" | "dead";

export interface UseTimelineRunnerReturn {
  entries: TimelineEntry[];
  timelineState: TimelineState;
  currentAge: number;
  /** The major event currently waiting for a choice, if any. */
  pendingEvent: LifeEvent | null;
  /** Call to apply a choice and resume the timeline. */
  makeChoice: (choiceId: string) => void;
  /** Skip ahead to the next event. */
  skipAhead: () => void;
  /** Pause/resume toggle. */
  togglePause: () => void;
}

export function useTimelineRunner(
  eventPool: readonly LifeEvent[]
): UseTimelineRunnerReturn {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [timelineState, setTimelineState] = useState<TimelineState>("running");
  const [currentAge, setCurrentAge] = useState(0);
  const [pendingEvent, setPendingEvent] = useState<LifeEvent | null>(null);

  const eventHistoryRef = useRef<EventHistory>(createEventHistory());
  const delayedEffects = useRef<DelayedEffect[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const isDeadRef = useRef(false);
  const pendingEntriesRef = useRef<TimelineEntry[]>([]);

  // Process one year tick
  const tick = useCallback(() => {
    if (isDeadRef.current) return;

    const { result, updatedDelayedEffects, updatedHistory } = processYearTick(
      eventPool,
      eventHistoryRef.current,
      delayedEffects.current
    );

    delayedEffects.current = updatedDelayedEffects;
    eventHistoryRef.current = updatedHistory;

    const character = useGameStore.getState().character;
    if (character) {
      setCurrentAge(character.identity.currentAge);

      // Auto-save every 5 years
      if (character.identity.currentAge % 5 === 0) {
        saveGame(character);
      }
    }

    // Check for major events that need player input
    const majorEntry = result.entries.find((e) => e.type === "major_event" && e.event);
    const nonMajorEntries = result.entries.filter((e) => e.type !== "major_event");

    // Add non-major entries immediately
    setEntries((prev) => [...prev, ...nonMajorEntries]);

    if (majorEntry?.event) {
      // Pause for major event
      setPendingEvent(majorEntry.event);
      // Store the major entry to add after choice
      pendingEntriesRef.current = [majorEntry];
      setTimelineState("paused");
      isPausedRef.current = true;
      return; // Don't schedule next tick
    }

    if (result.isDead) {
      isDeadRef.current = true;
      setTimelineState("dead");
      return;
    }

    // Schedule next tick
    scheduleNextTick();
  }, [eventPool]);

  const scheduleNextTick = useCallback(() => {
    if (isPausedRef.current || isDeadRef.current) return;

    const character = useGameStore.getState().character;
    if (!character) return;

    const stage = getStageForAge(character.identity.currentAge);
    const intervalMs = getSecondsPerYear(stage) * 1000;

    timerRef.current = setTimeout(tick, intervalMs);
  }, [tick]);

  // Make a choice on a major event
  const makeChoice = useCallback(
    (choiceId: string) => {
      if (!pendingEvent) return;

      // Find the choice
      const content = pendingEvent.content;
      const choices = "choices" in content ? content.choices : [];
      const choice = choices.find((c) => c.id === choiceId);

      if (choice) {
        // Snapshot attributes before effects for hint generation
        const charBefore = useGameStore.getState().character!;
        const attrsBefore = { ...charBefore.attributes };

        // Apply choice effects with magnitude scaling
        for (const eff of choice.effects) {
          if (eff.delay && eff.delay > 0) {
            const character = useGameStore.getState().character!;
            delayedEffects.current.push({
              id: `de_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              sourceEventId: pendingEvent.id,
              sourceChoiceId: choice.id,
              sourceAge: character.identity.currentAge,
              targetAge: character.identity.currentAge + eff.delay,
              effect: convertChoiceEffect(eff),
              probability: eff.probability ?? 1.0,
              narrative: eff.narrative ?? "",
              fired: false,
              expired: false,
            });
          } else {
            const converted = convertChoiceEffect(eff);
            // Apply magnitude scaling for attribute effects
            if (converted.type === "attribute" && converted.operation === "add") {
              const scaled = scaleEffectMagnitude(
                converted.value,
                converted.target,
                useGameStore.getState().character!.attributes
              );
              useGameStore.getState().applyEffect({
                ...converted,
                value: scaled,
              });
            } else {
              useGameStore.getState().applyEffect(converted);
            }
          }
        }

        // Add the major event entry with the choice narrative
        const currentAge = useGameStore.getState().character!.identity.currentAge;
        const choiceEntry: TimelineEntry = {
          id: `entry_choice_${Date.now()}`,
          age: currentAge,
          type: "major_event",
          text: choice.narrative,
          event: pendingEvent,
        };

        // Generate consequence hints for significant attribute changes
        const attrsAfter = useGameStore.getState().character!.attributes;
        const hintEntries: TimelineEntry[] = [];
        for (const key of Object.keys(attrsBefore) as (keyof typeof attrsBefore)[]) {
          const delta = attrsAfter[key] - attrsBefore[key];
          const hint = getConsequenceHint(key, delta);
          if (hint) {
            hintEntries.push({
              id: `entry_hint_${Date.now()}_${key}`,
              age: currentAge,
              type: "minor_event",
              text: hint,
            });
          }
        }

        setEntries((prev) => [...prev, choiceEntry, ...hintEntries]);
      }

      setPendingEvent(null);
      setTimelineState("running");
      isPausedRef.current = false;

      // Auto-save after major event choice
      const currentChar = useGameStore.getState().character;
      if (currentChar) saveGame(currentChar);

      // Resume timeline after brief delay for consequence reading
      timerRef.current = setTimeout(tick, 1500);
    },
    [pendingEvent, tick]
  );

  const skipAhead = useCallback(() => {
    if (isPausedRef.current || isDeadRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    tick();
  }, [tick]);

  const togglePause = useCallback(() => {
    if (isDeadRef.current) return;
    if (pendingEvent) return; // Can't toggle during major event

    isPausedRef.current = !isPausedRef.current;
    setTimelineState(isPausedRef.current ? "paused" : "running");

    if (!isPausedRef.current) {
      scheduleNextTick();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [pendingEvent, scheduleNextTick]);

  // Start the timeline
  useEffect(() => {
    resetEntryCounter();
    const character = useGameStore.getState().character;
    if (character) {
      setCurrentAge(character.identity.currentAge);
      // Add birth entry
      setEntries([
        {
          id: "entry_birth",
          age: 0,
          type: "minor_event",
          text: `Born in ${character.identity.location}. ${character.identity.name} enters the world.`,
        },
      ]);
      // Start first tick after a brief pause
      timerRef.current = setTimeout(tick, 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tick]);

  // Pause when tab is hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        if (!isPausedRef.current && !isDeadRef.current) {
          if (timerRef.current) clearTimeout(timerRef.current);
        }
      } else {
        if (!isPausedRef.current && !isDeadRef.current && !pendingEvent) {
          scheduleNextTick();
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [pendingEvent, scheduleNextTick]);

  return {
    entries,
    timelineState,
    currentAge,
    pendingEvent,
    makeChoice,
    skipAhead,
    togglePause,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

import type { EventEffect } from "../events/types";
import type { Effect } from "../state/types";
import { scaleEffectMagnitude, getConsequenceHint } from "../state/magnitudeScaling";

function convertChoiceEffect(eff: EventEffect): Effect {
  if (eff.type === "attribute") {
    return {
      type: "attribute",
      target: eff.target,
      operation: eff.operation as "add" | "multiply" | "set",
      value: eff.value as number,
    } as Effect;
  }
  if (eff.type === "spectrum") {
    return {
      type: "spectrum",
      target: eff.target,
      delta: eff.value as number,
    } as Effect;
  }
  if (eff.type === "tag") {
    return {
      type: "tag",
      tagId: eff.target,
      category: "life_event",
    } as Effect;
  }
  return {
    type: "relationship",
    relationshipId: eff.target,
    closenessChange: typeof eff.value === "number" ? eff.value : 0,
  } as Effect;
}
