"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/game/state/useGameStore";
import { useTimelineRunner } from "@/game/engine/useTimelineRunner";
import { getStageForAge } from "@/game/stages/lifeStages";
import { getDisplayBucket } from "@/game/state/displayBuckets";
import { DashboardPanel } from "@/components/DashboardPanel";
import { MINOR_EVENT_TEMPLATES } from "@/game/data/minorEvents";
import { MAJOR_EVENTS } from "@/game/data/majorEvents";
import { EARLY_LIFE_EVENTS } from "@/game/data/earlyLifeEvents";
import { FALLBACK_EVENTS } from "@/game/data/fallbackEvents";
import { LATER_MINOR_EVENTS, LATER_MAJOR_EVENTS_EXPORT } from "@/game/data/laterLifeEvents";
import type { LifeEvent } from "@/game/events/types";
import type { TimelineEntry } from "@/game/engine/timelineEngine";

const ALL_EVENTS: readonly LifeEvent[] = [
  ...EARLY_LIFE_EVENTS,
  ...MINOR_EVENT_TEMPLATES,
  ...MAJOR_EVENTS,
  ...LATER_MINOR_EVENTS,
  ...LATER_MAJOR_EVENTS_EXPORT,
  ...FALLBACK_EVENTS,
];

export default function LifeTimeline() {
  const router = useRouter();
  const character = useGameStore((s) => s.character);

  // Redirect to title if no character
  useEffect(() => {
    if (!character) {
      router.replace("/");
    }
  }, [character, router]);

  if (!character) return null;

  return <TimelineView />;
}

function TimelineView() {
  const {
    entries,
    timelineState,
    currentAge,
    pendingEvent,
    makeChoice,
    skipAhead,
    togglePause,
  } = useTimelineRunner(ALL_EVENTS);

  const router = useRouter();
  const character = useGameStore((s) => s.character)!;
  const stage = getStageForAge(currentAge);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  // Auto-close dashboard when major event triggers
  useEffect(() => {
    if (pendingEvent && dashboardOpen) {
      setDashboardOpen(false);
    }
  }, [pendingEvent, dashboardOpen]);

  // Auto-scroll to bottom as entries appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  if (timelineState === "dead") {
    return (
      <DeathScreen
        name={character.identity.name}
        age={currentAge}
        stage={stage.displayName}
        health={getDisplayBucket("health", character.attributes.health)}
        onNewLife={() => router.push("/")}
        onViewTree={() => router.push("/tree")}
      />
    );
  }

  // Stage-aware CSS custom properties for theming
  const stageStyle = {
    "--stage-primary": stage.themeTokens.primaryColor,
    "--stage-bg": stage.themeTokens.backgroundColor,
  } as React.CSSProperties;

  return (
    <div
      className="flex flex-1 flex-col h-full transition-colors duration-1000"
      style={{
        ...stageStyle,
        backgroundColor: "var(--stage-bg)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-foreground/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--stage-primary)" }}
          >
            Age {currentAge}
          </span>
          <span className="text-sm text-zinc-500">
            {stage.displayName}
          </span>
          <span className="text-sm text-zinc-400">
            {character.identity.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className="px-3 py-1 text-xs rounded border border-foreground/20 hover:bg-foreground/5"
          >
            {timelineState === "paused" ? "Resume" : "Pause"}
          </button>
          <button
            onClick={skipAhead}
            disabled={timelineState === "paused"}
            className="px-3 py-1 text-xs rounded border border-foreground/20 hover:bg-foreground/5 disabled:opacity-30"
          >
            Skip →
          </button>
          <button
            onClick={() => setDashboardOpen(true)}
            className="px-3 py-1 text-xs rounded border border-foreground/20 hover:bg-foreground/5"
          >
            Stats
          </button>
        </div>
      </header>

      {/* Timeline scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-xl mx-auto space-y-1">
          {entries.map((entry) => (
            <TimelineEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {/* Major event overlay */}
      {pendingEvent && (
        <MajorEventOverlay event={pendingEvent} onChoice={makeChoice} />
      )}

      {/* Dashboard panel */}
      <DashboardPanel
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline entry row
// ---------------------------------------------------------------------------

function TimelineEntryRow({ entry }: { entry: TimelineEntry }) {
  if (entry.type === "stage_transition") {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1 h-px bg-foreground/20" />
        <span className="text-xs font-semibold tracking-wide uppercase text-foreground/50">
          {entry.text}
        </span>
        <div className="flex-1 h-px bg-foreground/20" />
      </div>
    );
  }

  if (entry.type === "death") {
    return (
      <div className="flex items-center gap-3 py-4 text-center">
        <div className="flex-1 h-px bg-red-400/50" />
        <span className="text-sm font-medium text-red-500">{entry.text}</span>
        <div className="flex-1 h-px bg-red-400/50" />
      </div>
    );
  }

  const dotColor =
    entry.type === "major_event"
      ? "bg-amber-400"
      : entry.type === "echo_event"
        ? "bg-purple-400"
        : entry.type === "quiet_year"
          ? "bg-foreground/10"
          : "bg-foreground/30";

  const isEcho = entry.type === "echo_event";

  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="w-8 text-right text-xs text-foreground/40 pt-0.5 shrink-0">
        {entry.age}
      </span>
      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <p
        className={`text-sm leading-relaxed ${
          isEcho
            ? "text-purple-500 dark:text-purple-400 italic"
            : "text-foreground/80"
        }`}
      >
        {isEcho && <span className="text-purple-400/60 mr-1">Years ago... </span>}
        {entry.text}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Major event overlay
// ---------------------------------------------------------------------------

function MajorEventOverlay({
  event,
  onChoice,
}: {
  event: LifeEvent;
  onChoice: (choiceId: string) => void;
}) {
  const content = event.content;
  const setup = "setup" in content ? content.setup : "";
  const dialogue = "dialogue" in content ? content.dialogue : [];
  const choices = "choices" in content ? content.choices : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-4 bg-background rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Dialogue lines (visual novel format) */}
        {dialogue.length > 0 && (
          <div className="space-y-3">
            {dialogue.map((line, i) => (
              <div key={i} className="space-y-0.5">
                {line.speaker !== "Narrator" && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
                    {line.speaker}
                  </span>
                )}
                <p
                  className={`text-sm leading-relaxed ${
                    line.speaker === "Narrator"
                      ? "text-foreground/70 italic"
                      : "text-foreground/90"
                  } ${line.emotion === "emotional" ? "font-medium" : ""}`}
                >
                  {line.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Setup text (scenario card format) */}
        {setup && !dialogue.length && (
          <p className="text-sm leading-relaxed">{setup}</p>
        )}

        {/* Choices */}
        <div className="space-y-2 pt-2">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.id)}
              className="w-full text-left px-4 py-3 rounded-xl border border-foreground/15 hover:bg-foreground/5 transition-colors"
            >
              <span className="text-sm font-medium">{choice.label}</span>
              {choice.description && (
                <span className="block text-xs text-foreground/50 mt-0.5">
                  {choice.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Death screen
// ---------------------------------------------------------------------------

function DeathScreen({
  name,
  age,
  stage,
  health,
  onNewLife,
  onViewTree,
}: {
  name: string;
  age: number;
  stage: string;
  health: string;
  onNewLife: () => void;
  onViewTree: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-lg text-foreground/60">
          Lived to age {age} · {stage}
        </p>
        <p className="text-sm text-foreground/40">Health: {health}</p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={onNewLife}
          className="rounded-full bg-foreground px-8 py-3 text-background transition-colors hover:bg-foreground/80"
        >
          New Life
        </button>
        <button
          onClick={onViewTree}
          className="rounded-full border border-foreground/20 px-8 py-3 transition-colors hover:bg-foreground/5"
        >
          View Tree
        </button>
      </div>
    </main>
  );
}
