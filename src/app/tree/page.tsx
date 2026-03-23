"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLifeTree } from "@/game/tree/lifeTreeStore";
import { useGameStore } from "@/game/state/useGameStore";
import { deserialize, serialize } from "@/game/state/serialization";
import type { LifeRecord, BranchPoint } from "@/game/tree/types";
import type { CharacterState } from "@/game/state/types";

export default function TreeExplorer() {
  const router = useRouter();
  const [lives, setLives] = useState<LifeRecord[]>([]);
  const [selectedLife, setSelectedLife] = useState<LifeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLifeTree().then((tree) => {
      setLives(tree.lives);
      setLoading(false);
    });
  }, []);

  function handleReplayBranch(bp: BranchPoint) {
    // Restore state from snapshot and apply the alternate choice
    const restoredState = deserialize(serialize(bp.stateSnapshot));
    useGameStore.getState().initializeCharacter(restoredState);
    router.push("/life");
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-foreground/40">Loading tree...</p>
      </main>
    );
  }

  if (lives.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <p className="text-foreground/50">No lives completed yet.</p>
        <p className="text-sm text-foreground/30">
          Play through a life to see your branching tree.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-foreground px-8 py-3 text-background hover:bg-foreground/80"
        >
          Back to Title
        </button>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
        <h1 className="text-sm font-semibold">Life Tree</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1 text-xs rounded border border-foreground/20 hover:bg-foreground/5"
          >
            Title
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Tree visualization */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {lives.map((life) => (
              <LifeNode
                key={life.id}
                life={life}
                isSelected={selectedLife?.id === life.id}
                onSelect={() => setSelectedLife(selectedLife?.id === life.id ? null : life)}
              />
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedLife && (
          <LifeDetailPanel
            life={selectedLife}
            onReplay={handleReplayBranch}
            onClose={() => setSelectedLife(null)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Life node in the tree
// ---------------------------------------------------------------------------

function LifeNode({
  life,
  isSelected,
  onSelect,
}: {
  life: LifeRecord;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const branchCount = life.branchPoints.length;
  const unexplored = life.branchPoints.filter((bp) => !bp.explored).length;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        isSelected
          ? "border-foreground/30 bg-foreground/5"
          : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{life.name}</h3>
          <p className="text-xs text-foreground/50 mt-0.5">
            Lived to {life.deathAge} · {life.epitaph.headline}
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          {branchCount > 0 && (
            <span className="text-xs text-foreground/40">
              {branchCount} {branchCount === 1 ? "branch" : "branches"}
              {unexplored > 0 && (
                <span className="ml-1 text-amber-500">
                  ({unexplored} unexplored)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Branch point timeline */}
      {isSelected && branchCount > 0 && (
        <div className="mt-3 pt-3 border-t border-foreground/10 space-y-1">
          {life.branchPoints.map((bp) => (
            <div
              key={bp.id}
              className="flex items-center gap-2 text-xs text-foreground/50"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  bp.explored ? "bg-foreground/20" : "bg-amber-400"
                }`}
              />
              <span>
                Age {bp.age}: chose &ldquo;{bp.chosenOptionId.replace(/_/g, " ")}&rdquo;
              </span>
              {!bp.explored && (
                <span className="text-amber-500 ml-auto">
                  {bp.alternateOptionIds.length} path{bp.alternateOptionIds.length !== 1 ? "s" : ""} not taken
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Life detail panel
// ---------------------------------------------------------------------------

function LifeDetailPanel({
  life,
  onReplay,
  onClose,
}: {
  life: LifeRecord;
  onReplay: (bp: BranchPoint) => void;
  onClose: () => void;
}) {
  const unexplored = life.branchPoints.filter((bp) => !bp.explored);

  return (
    <div className="w-80 max-w-[85vw] border-l border-foreground/10 bg-background overflow-y-auto p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{life.name}</h2>
        <button
          onClick={onClose}
          className="text-foreground/40 hover:text-foreground text-lg"
        >
          ✕
        </button>
      </div>

      {/* Epitaph summary */}
      <div className="space-y-2">
        <p className="text-xs text-foreground/50">
          Lived to {life.deathAge} · {life.epitaph.location}
        </p>
        <p className="text-sm italic text-foreground/70">
          {life.epitaph.headline}
        </p>
        <p className="text-xs text-foreground/50">{life.epitaph.personality}</p>

        {life.epitaph.notableAttributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {life.epitaph.notableAttributes.map((a) => (
              <span
                key={a}
                className="px-2 py-0.5 text-xs rounded-full bg-foreground/5 text-foreground/50"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-foreground/40">{life.epitaph.relationships}</p>
        <p className="text-xs italic text-foreground/40">
          &ldquo;{life.epitaph.finalWords}&rdquo;
        </p>
      </div>

      {/* Unexplored branches */}
      {unexplored.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/30">
            Roads Not Taken
          </h3>
          {unexplored.map((bp) => (
            <div key={bp.id} className="space-y-1.5">
              <p className="text-xs text-foreground/50">
                At age {bp.age}, you chose &ldquo;{bp.chosenOptionId.replace(/_/g, " ")}&rdquo;
              </p>
              {bp.alternateOptionIds.map((altId) => (
                <button
                  key={altId}
                  onClick={() => onReplay(bp)}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 text-foreground/70 transition-colors"
                >
                  What if: &ldquo;{altId.replace(/_/g, " ")}&rdquo; →
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {unexplored.length === 0 && life.branchPoints.length > 0 && (
        <p className="text-xs text-foreground/30 italic">
          All branches have been explored.
        </p>
      )}
    </div>
  );
}
