/**
 * Save Manager — auto-save/load via IndexedDB using idb wrapper.
 *
 * Manages the active life save. Saves are triggered after major events
 * and every CHECKPOINT_INTERVAL years.
 *
 * @see design/gdd/save-state-persistence.md
 * @see docs/architecture/ADR-002 (IndexedDB)
 */

import { openDB, type IDBPDatabase } from "idb";
import type { CharacterState } from "../state/types";
import { serialize, deserialize } from "../state/serialization";

const DB_NAME = "lifepath_db";
const DB_VERSION = 1;
const STORE_ACTIVE = "active_life";

interface ActiveLifeSave {
  id: "current";
  version: number;
  characterStateJson: string;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_ACTIVE)) {
          db.createObjectStore(STORE_ACTIVE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save the current character state to IndexedDB.
 * Non-blocking — returns a promise but doesn't freeze the UI.
 */
export async function saveGame(state: CharacterState): Promise<void> {
  try {
    const db = await getDb();
    const save: ActiveLifeSave = {
      id: "current",
      version: 1,
      characterStateJson: serialize(state),
      timestamp: Date.now(),
    };
    await db.put(STORE_ACTIVE, save);
  } catch (err) {
    console.error("[SaveManager] Failed to save:", err);
  }
}

/**
 * Load the saved character state from IndexedDB.
 * Returns null if no save exists or if the save is corrupted.
 */
export async function loadGame(): Promise<CharacterState | null> {
  try {
    const db = await getDb();
    const save = (await db.get(STORE_ACTIVE, "current")) as
      | ActiveLifeSave
      | undefined;
    if (!save) return null;
    return deserialize(save.characterStateJson);
  } catch (err) {
    console.error("[SaveManager] Failed to load:", err);
    return null;
  }
}

/**
 * Check whether a save exists without loading it.
 */
export async function hasSaveGame(): Promise<boolean> {
  try {
    const db = await getDb();
    const save = await db.get(STORE_ACTIVE, "current");
    return save !== undefined;
  } catch {
    return false;
  }
}

/**
 * Delete the current save.
 */
export async function deleteSave(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_ACTIVE, "current");
  } catch (err) {
    console.error("[SaveManager] Failed to delete save:", err);
  }
}
