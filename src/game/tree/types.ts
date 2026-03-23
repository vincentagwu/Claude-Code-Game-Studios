/**
 * Branching Tree types — data structures for life tree visualization.
 *
 * @see design/gdd/save-state-persistence.md — Life Tree Save
 */

import type { CharacterState } from "../state/types";
import type { Epitaph } from "../engine/epitaphGenerator";

/** A decision point where the player chose one path over others. */
export interface BranchPoint {
  readonly id: string;
  readonly lifeId: string;
  readonly age: number;
  readonly eventId: string;
  readonly chosenOptionId: string;
  readonly alternateOptionIds: string[];
  /** Character state snapshot at the moment of decision. */
  readonly stateSnapshot: CharacterState;
  /** Whether this alternate branch has been explored. */
  explored: boolean;
}

/** A completed life record. */
export interface LifeRecord {
  readonly id: string;
  readonly name: string;
  readonly deathAge: number;
  readonly region: string;
  readonly epitaph: Epitaph;
  readonly branchPoints: BranchPoint[];
  readonly parentLifeId?: string;
  /** If this life was started from a branch, which branch point. */
  readonly sourceBranchId?: string;
  readonly completedAt: number;
}

/** The full life tree. */
export interface LifeTree {
  readonly lives: LifeRecord[];
}
