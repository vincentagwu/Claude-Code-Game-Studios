"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/game/state/useGameStore";
import { generateStartingConditions } from "@/game/state/startingConditions";
import { loadGame, hasSaveGame, deleteSave } from "@/game/persistence/saveManager";
import { loadLifeTree } from "@/game/tree/lifeTreeStore";

export default function TitleScreen() {
  const router = useRouter();
  const [hasSave, setHasSave] = useState(false);
  const [hasTree, setHasTree] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for saved game and tree on mount
  useEffect(() => {
    Promise.all([hasSaveGame(), loadLifeTree()]).then(([saveExists, tree]) => {
      setHasSave(saveExists);
      setHasTree(tree.lives.length > 0);
      setLoading(false);
    });
  }, []);

  async function handleNewLife() {
    // Delete old save if any
    await deleteSave();
    const state = generateStartingConditions();
    useGameStore.getState().initializeCharacter(state);
    router.push("/life");
  }

  async function handleContinue() {
    const saved = await loadGame();
    if (saved) {
      useGameStore.getState().initializeCharacter(saved);
      router.push("/life");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold tracking-tight">LifePath</h1>
      <p className="max-w-md text-center text-lg text-zinc-600 dark:text-zinc-400">
        Live an entire human life. Make choices that ripple across generations.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={handleNewLife}
          disabled={loading}
          className="rounded-full bg-foreground px-8 py-3 text-background transition-colors hover:bg-foreground/80 disabled:opacity-50"
        >
          New Life
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasSave || loading}
          className="rounded-full border border-foreground/20 px-8 py-3 transition-colors hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
        <button
          onClick={() => router.push("/tree")}
          disabled={!hasTree || loading}
          className="rounded-full border border-foreground/20 px-8 py-3 transition-colors hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Explore Tree
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="rounded-full border border-foreground/20 px-8 py-3 transition-colors hover:bg-foreground/5"
        >
          Settings
        </button>
      </div>
    </main>
  );
}
