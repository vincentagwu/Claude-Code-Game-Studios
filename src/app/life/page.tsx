"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/game/state/useGameStore";
import { useTimelineRunner } from "@/game/engine/useTimelineRunner";
import { getStageForAge } from "@/game/stages/lifeStages";
import { DashboardPanel } from "@/components/DashboardPanel";
import { MINOR_EVENT_TEMPLATES } from "@/game/data/minorEvents";
import { MAJOR_EVENTS } from "@/game/data/majorEvents";
import { EARLY_LIFE_EVENTS } from "@/game/data/earlyLifeEvents";
import { FALLBACK_EVENTS } from "@/game/data/fallbackEvents";
import { LATER_MINOR_EVENTS, LATER_MAJOR_EVENTS_EXPORT } from "@/game/data/laterLifeEvents";
import { CRISIS_EVENTS } from "@/game/data/crisisEvents";
import { MORE_CHILDHOOD_MINOR, MORE_CHILDHOOD_MAJOR } from "@/game/data/moreChildhoodEvents";
import { MILESTONE_EVENTS } from "@/game/data/milestoneEvents";
import { ADULT_MINOR_EVENTS } from "@/game/data/adultMinorEvents";
import { RELATIONSHIP_MAJOR_EVENTS } from "@/game/data/relationshipMajorEvents";
import { RELATIONSHIP_MINOR_EVENTS } from "@/game/data/relationshipMinorEvents";
import type { LifeEvent } from "@/game/events/types";
import type { TimelineEntry } from "@/game/engine/timelineEngine";

const ALL_EVENTS: readonly LifeEvent[] = [
  ...EARLY_LIFE_EVENTS,
  ...MINOR_EVENT_TEMPLATES,
  ...MAJOR_EVENTS,
  ...MORE_CHILDHOOD_MINOR,
  ...MORE_CHILDHOOD_MAJOR,
  ...LATER_MINOR_EVENTS,
  ...LATER_MAJOR_EVENTS_EXPORT,
  ...CRISIS_EVENTS,
  ...MILESTONE_EVENTS,
  ...ADULT_MINOR_EVENTS,
  ...RELATIONSHIP_MAJOR_EVENTS,
  ...RELATIONSHIP_MINOR_EVENTS,
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

  return <LifeWithIntro character={character} />;
}

function LifeWithIntro({ character }: { character: NonNullable<ReturnType<typeof useGameStore.getState>["character"]> }) {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return (
      <BirthIntro
        name={character.identity.name}
        location={character.identity.location}
        gender={character.identity.gender}
        socioeconomicClass={character.identity.socioeconomicClass}
        familySize={character.relationships.length}
        onContinue={() => setShowIntro(false)}
      />
    );
  }

  return <TimelineView />;
}

function BirthIntro({
  name,
  location,
  gender,
  socioeconomicClass,
  familySize,
  onContinue,
}: {
  name: string;
  location: string;
  gender: string;
  socioeconomicClass: string;
  familySize: number;
  onContinue: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 animate-fade-in">
      <p className="text-sm uppercase tracking-widest text-foreground/30">A new life begins</p>
      <h1 className="text-4xl font-bold">{name}</h1>
      <div className="flex flex-col items-center gap-1 text-foreground/60 text-sm">
        <p>Born in {location}</p>
        <p className="capitalize">{socioeconomicClass} class · {gender}</p>
        <p>{familySize} {familySize === 1 ? "person" : "people"} in your life</p>
      </div>
      <button
        onClick={onContinue}
        className="mt-4 rounded-full bg-foreground px-8 py-3 text-background transition-colors hover:bg-foreground/80"
      >
        Begin
      </button>
    </main>
  );
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
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [entries.length]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " && !pendingEvent) {
        e.preventDefault();
        skipAhead();
      }
      if (e.key === "d" || e.key === "D") {
        if (!pendingEvent) setDashboardOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        if (dashboardOpen) setDashboardOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pendingEvent, dashboardOpen, skipAhead]);

  if (timelineState === "dead") {
    return (
      <EpitaphScreen
        character={character}
        onNewLife={() => router.push("/")}
        onViewTree={() => router.push("/tree")}
      />
    );
  }

  // Stage-aware CSS custom properties for theming
  // Use a very subtle tint of the primary color to avoid contrast issues
  const stageStyle = {
    "--stage-primary": stage.themeTokens.primaryColor,
  } as React.CSSProperties;

  return (
    <div
      className="flex flex-1 flex-col h-full transition-colors duration-1000 bg-background"
      style={stageStyle}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-foreground/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span
            className="text-xs sm:text-sm font-medium shrink-0"
            style={{ color: "var(--stage-primary)" }}
          >
            Age {currentAge}
          </span>
          <span className="text-xs sm:text-sm text-zinc-500 shrink-0">
            {stage.displayName}
          </span>
          <span className="text-xs sm:text-sm text-zinc-400 truncate hidden sm:inline">
            {character.identity.location}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
        <div
          className="max-w-xl mx-auto space-y-1 border-l-2 pl-4 transition-colors duration-1000"
          style={{ borderColor: "var(--stage-primary)" }}
        >
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
      <div className="flex items-center gap-3 py-4 animate-entry">
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
    <div className="flex items-start gap-3 py-1.5 animate-entry">
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
  const pages = "pages" in content ? content.pages : [];
  const isMiniNarrative = pages.length > 0;

  if (isMiniNarrative) {
    return (
      <MiniNarrativeOverlay
        pages={pages as string[]}
        choices={"choices" in content ? content.choices : []}
        onChoice={onChoice}
      />
    );
  }

  const setup = "setup" in content ? content.setup : "";
  const dialogue = "dialogue" in content ? content.dialogue : [];
  const choices = "choices" in content ? content.choices : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-3 sm:mx-4 bg-background rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
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
// Mini-narrative overlay (multi-page story + choices on last page)
// ---------------------------------------------------------------------------

function MiniNarrativeOverlay({
  pages,
  choices,
  onChoice,
}: {
  pages: string[];
  choices: readonly { id: string; label: string; description?: string }[];
  onChoice: (choiceId: string) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const isLastPage = pageIndex === pages.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-3 sm:mx-4 bg-background rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Page counter */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-foreground/30">
            {pageIndex + 1} / {pages.length}
          </span>
        </div>

        {/* Page text */}
        <p className="text-sm leading-relaxed min-h-[80px]">
          {pages[pageIndex]}
        </p>

        {/* Navigation or choices */}
        {isLastPage ? (
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
        ) : (
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="px-4 py-2 text-sm rounded-lg border border-foreground/15 hover:bg-foreground/5 disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              onClick={() => setPageIndex((p) => p + 1)}
              className="px-4 py-2 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/80"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Epitaph screen (life summary at death)
// ---------------------------------------------------------------------------

import { generateEpitaph } from "@/game/engine/epitaphGenerator";
import type { CharacterState } from "@/game/state/types";

function EpitaphScreen({
  character,
  onNewLife,
  onViewTree,
}: {
  character: CharacterState;
  onNewLife: () => void;
  onViewTree: () => void;
}) {
  const epitaph = generateEpitaph(character);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 overflow-y-auto">
      <div className="max-w-md w-full space-y-6 text-center">
        <p className="text-xs uppercase tracking-widest text-foreground/30">In Memoriam</p>
        <h1 className="text-3xl font-bold">{epitaph.name}</h1>
        <p className="text-lg text-foreground/50">
          {epitaph.age} years · {epitaph.location}
        </p>

        <p className="text-sm italic text-foreground/70 leading-relaxed">
          {epitaph.headline}
        </p>

        {/* Personality */}
        <p className="text-sm text-foreground/60">{epitaph.personality}</p>

        {/* Notable attributes */}
        {epitaph.notableAttributes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {epitaph.notableAttributes.map((attr) => (
              <span
                key={attr}
                className="px-2.5 py-1 text-xs rounded-full bg-foreground/5 text-foreground/60"
              >
                {attr}
              </span>
            ))}
          </div>
        )}

        {/* Life story tags */}
        {epitaph.lifeStory.length > 0 && (
          <div className="text-left space-y-1 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/30 text-center">
              Life Milestones
            </h3>
            {epitaph.lifeStory.map((item, i) => (
              <p key={i} className="text-xs text-foreground/50 text-center">{item}</p>
            ))}
          </div>
        )}

        {/* Relationships */}
        <p className="text-xs text-foreground/40">{epitaph.relationships}</p>

        {/* Final words */}
        <p className="text-sm italic text-foreground/50 pt-2">
          &ldquo;{epitaph.finalWords}&rdquo;
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
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
      </div>
    </main>
  );
}
