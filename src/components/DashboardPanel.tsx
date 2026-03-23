"use client";

/**
 * Dashboard slide-out panel — shows character state as qualitative labels.
 *
 * Desktop: slides from right, ~30% width.
 * Mobile: slides up from bottom as a sheet.
 * Never shows raw numbers — all qualitative labels per the GDD.
 *
 * @see design/gdd/app-shell-navigation.md — Dashboard Panel Behavior
 * @see design/gdd/character-state-model.md — Layer 3 & Layer 2
 */

import { useGameStore } from "@/game/state/useGameStore";
import { getDisplayBucket, getPersonalityLabel } from "@/game/state/displayBuckets";
import type { AttributeName, SpectrumName } from "@/game/state/types";

const ATTRIBUTE_LABELS: { key: AttributeName; label: string }[] = [
  { key: "health", label: "Health" },
  { key: "wealth", label: "Wealth" },
  { key: "education", label: "Education" },
  { key: "career", label: "Career" },
  { key: "relationships", label: "Relationships" },
  { key: "happiness", label: "Happiness" },
  { key: "stress", label: "Stress" },
];

const SPECTRUM_LABELS: { key: SpectrumName; label: string }[] = [
  { key: "courage", label: "Courage" },
  { key: "generosity", label: "Generosity" },
  { key: "sociability", label: "Sociability" },
  { key: "ambition", label: "Ambition" },
  { key: "empathy", label: "Empathy" },
  { key: "conformity", label: "Conformity" },
];

interface DashboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardPanel({ isOpen, onClose }: DashboardPanelProps) {
  const character = useGameStore((s) => s.character);

  if (!character) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed z-50 bg-background border-l border-foreground/10 shadow-xl transition-transform duration-300 ease-in-out
          top-0 right-0 h-full w-80 max-w-[85vw]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
          <h2 className="text-sm font-semibold">Dashboard</h2>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground text-lg"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-3rem)] px-4 py-4 space-y-6">
          {/* Attributes */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">
              Life Attributes
            </h3>
            <div className="space-y-1.5">
              {ATTRIBUTE_LABELS.map(({ key, label }) => (
                <AttributeRow
                  key={key}
                  label={label}
                  bucket={getDisplayBucket(key, character.attributes[key])}
                  value={character.attributes[key]}
                />
              ))}
            </div>
          </section>

          {/* Personality */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">
              Personality
            </h3>
            <div className="space-y-1.5">
              {SPECTRUM_LABELS.map(({ key, label }) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-foreground/60">{label}</span>
                  <span className="font-medium">
                    {getPersonalityLabel(key, character.spectrums[key])}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Life Story (tags) */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">
              Life Story
            </h3>
            {character.tags.length === 0 ? (
              <p className="text-sm text-foreground/30 italic">
                Your story is just beginning...
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {character.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-2 py-0.5 text-xs rounded-full bg-foreground/5 text-foreground/60"
                  >
                    {formatTagName(tag.id)}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Relationships */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/40 mb-2">
              Relationships
            </h3>
            {character.relationships.filter((r) => r.status === "active").length === 0 ? (
              <p className="text-sm text-foreground/30 italic">No active relationships</p>
            ) : (
              <div className="space-y-1.5">
                {character.relationships
                  .filter((r) => r.status === "active")
                  .sort((a, b) => b.closeness - a.closeness)
                  .slice(0, 8)
                  .map((r) => (
                    <div key={r.id} className="flex justify-between text-sm">
                      <span className="text-foreground/60">
                        {r.name}
                        <span className="text-foreground/30 ml-1 text-xs">
                          ({r.type})
                        </span>
                      </span>
                      <span className="font-medium">
                        {getClosenessLabel(r.closeness)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function AttributeRow({
  label,
  bucket,
  value,
}: {
  label: string;
  bucket: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-foreground/60">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground/40 transition-all duration-500"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="font-medium text-xs w-20 text-right">{bucket}</span>
      </div>
    </div>
  );
}

function getClosenessLabel(closeness: number): string {
  if (closeness >= 80) return "Very close";
  if (closeness >= 60) return "Close";
  if (closeness >= 40) return "Friendly";
  if (closeness >= 20) return "Distant";
  return "Fading";
}

function formatTagName(tagId: string): string {
  return tagId
    .replace(/^(region_|class_|family_)/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
