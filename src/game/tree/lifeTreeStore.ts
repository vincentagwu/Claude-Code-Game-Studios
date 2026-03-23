/**
 * Life Tree Store — persists completed lives and their branch points.
 *
 * Uses IndexedDB via idb wrapper. Manages the full tree graph.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { LifeRecord, LifeTree, BranchPoint } from "./types";

const DB_NAME = "lifepath_db";
const DB_VERSION = 2;
const STORE_TREE = "life_tree";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("active_life")) {
          db.createObjectStore("active_life", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_TREE)) {
          db.createObjectStore(STORE_TREE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

/** Save a completed life to the tree. */
export async function saveLifeRecord(record: LifeRecord): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_TREE, record);
  } catch (err) {
    console.error("[LifeTreeStore] Failed to save life record:", err);
  }
}

/** Load all completed lives. */
export async function loadLifeTree(): Promise<LifeTree> {
  try {
    const db = await getDb();
    const lives = (await db.getAll(STORE_TREE)) as LifeRecord[];
    return { lives };
  } catch (err) {
    console.error("[LifeTreeStore] Failed to load tree:", err);
    return { lives: [] };
  }
}

/** Mark a branch point as explored. */
export async function markBranchExplored(
  lifeId: string,
  branchId: string
): Promise<void> {
  try {
    const db = await getDb();
    const record = (await db.get(STORE_TREE, lifeId)) as LifeRecord | undefined;
    if (!record) return;

    const updatedBranches = record.branchPoints.map((bp) =>
      bp.id === branchId ? { ...bp, explored: true } : bp
    );
    await db.put(STORE_TREE, { ...record, branchPoints: updatedBranches });
  } catch (err) {
    console.error("[LifeTreeStore] Failed to mark branch explored:", err);
  }
}

/** Get a specific branch point from a life. */
export async function getBranchPoint(
  lifeId: string,
  branchId: string
): Promise<BranchPoint | null> {
  try {
    const db = await getDb();
    const record = (await db.get(STORE_TREE, lifeId)) as LifeRecord | undefined;
    if (!record) return null;
    return record.branchPoints.find((bp) => bp.id === branchId) ?? null;
  } catch (err) {
    console.error("[LifeTreeStore] Failed to get branch point:", err);
    return null;
  }
}

/** Clear the entire tree (for testing/reset). */
export async function clearLifeTree(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear(STORE_TREE);
  } catch (err) {
    console.error("[LifeTreeStore] Failed to clear tree:", err);
  }
}
