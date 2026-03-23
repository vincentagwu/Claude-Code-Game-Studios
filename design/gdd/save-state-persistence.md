# Save / State Persistence

> **Status**: Designed
> **Author**: User + gameplay-programmer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: The Road Not Taken (enables tree replay)

## Overview

The Save / State Persistence system serializes and deserializes all game state to
browser storage (IndexedDB primary, localStorage fallback). It manages three types
of persistent data: the **active life** (current character state + timeline position),
the **life tree** (all completed lives and their branch points), and **player
preferences** (settings, meta-progress). The system enables tree replay (branching
from past decision points), session continuity (resume where you left off), and
generational play (carry forward inheritance data).

This is a purely technical system — the player never interacts with save/load
directly. Saves happen automatically at checkpoints (every 5 years, after major
events, on state transitions). Load happens automatically on app launch.

## Player Fantasy

Invisible. The player should never think about saving. Their life continues where
they left off. Their tree remembers every path. No "save slot" screens, no manual
saves, no data loss anxiety. It just works.

## Detailed Design

### Core Rules

#### Storage Architecture

```
IndexedDB: "lifepath_db"
├── Store: "active_life"     → Current character state + timeline position
├── Store: "life_tree"       → Complete tree graph (all lives, branches, epitaphs)
├── Store: "preferences"     → Settings, audio state, tutorial flags
└── Store: "meta_progress"   → Achievements, rare events discovered, stats
```

**Rules**:
1. **IndexedDB** is primary storage (supports large structured data, async).
2. **localStorage** is used only as a fallback signal ("has_save_data": true)
   and for preferences (small, synchronous).
3. All save operations are **async** and non-blocking — saves never freeze the UI.
4. Save data is **versioned** (schema version number). Old save formats are
   migrated forward on load.

#### Save Data Schemas

**Active Life Save**:
```typescript
interface ActiveLifeSave {
  version: number;                    // Schema version for migration
  characterState: CharacterState;     // Full 6-layer character state
  currentAge: number;                 // Current year in the life
  currentStage: LifeStage;           // Current life stage
  timelinePosition: number;           // Scroll position in timeline
  eventHistory: string[];             // IDs of all fired events this life
  delayedEffectQueue: DelayedEffect[];// Pending future effects
  branchPoints: BranchPoint[];        // Decision points for tree (this life)
  timestamp: number;                  // Last save time (epoch ms)
}
```

**Life Tree Save**:
```typescript
interface LifeTreeSave {
  version: number;
  rootId: string;                     // ID of the first life
  lives: LifeRecord[];               // All completed lives
  activeBranches: BranchPoint[];      // Unexplored branch points
  generations: GenerationLink[];      // Parent-child relationships
}

interface LifeRecord {
  id: string;                         // Unique life ID
  startingConditions: object;         // Birth circumstances (for display)
  epitaph: Epitaph;                   // Life summary
  branchPoints: BranchPoint[];        // Decisions made in this life
  parentLifeId?: string;              // If generational, which life was parent
  finalState: CharacterState;         // State at death
  completedAt: number;                // Timestamp
}

interface BranchPoint {
  id: string;
  lifeId: string;                     // Which life this branch is in
  age: number;                        // Age when decision was made
  eventId: string;                    // The event that created this branch
  chosenOptionId: string;             // Which choice the player made
  alternateOptionIds: string[];       // Choices not taken (explorable branches)
  stateSnapshot: CharacterState;      // Character state AT this decision point
  explored: boolean;                  // Has the player explored this branch?
}
```

#### Save Triggers

| Trigger | What's Saved | Storage |
|---------|-------------|---------|
| Year tick checkpoint (every 5 years) | Active life | IndexedDB |
| Major event completed (choice made) | Active life + new branch point | IndexedDB |
| Stage transition | Active life | IndexedDB |
| Death | Life record added to tree, active life cleared | IndexedDB |
| Branch replay started | Active life (from branch snapshot) | IndexedDB |
| App state transition (Title ↔ Living ↔ Tree) | Active life | IndexedDB |
| beforeunload (page close/refresh) | Active life (async IndexedDB flush preferred; localStorage flag "has_unsaved_data" as fallback signal) | IndexedDB (primary), localStorage (signal only) |
| Settings changed | Preferences | localStorage |

#### Load Process

```
1. Check IndexedDB for "active_life"
2. If found:
   a. Validate schema version — migrate if needed
   b. Validate data integrity (required fields present)
   c. Load into GameStateProvider
   d. Resume from saved timeline position
3. If not found:
   a. Check localStorage for emergency save
   b. If found, restore from emergency save
   c. If not found, start fresh (Title screen, no continue option)
4. Always load "life_tree" and "preferences" regardless of active life
```

#### Branch Replay (Tree → Living)

When the player selects an unexplored branch in the tree:

```
1. Read the BranchPoint's stateSnapshot (captured at the exact moment the
   player makes a choice, BEFORE the chosen option's effects are applied)
2. Create a new active life from the snapshot
3. Set the alternate choice as the "chosen" option
4. Apply the alternate choice's effects to the state
5. Resume the Timeline Engine from the branch point age
6. The new life continues from that point forward as a normal life
7. On death, the new life is added to the tree as a branch of the original
```

### States and Transitions

| State | Description |
|-------|------------|
| Idle | No save/load in progress |
| Saving | Async write to IndexedDB in progress |
| Loading | Async read from IndexedDB in progress |
| Migrating | Upgrading save data from old schema version |
| Error | Save/load failed — fallback behavior active |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Character State Model** | Serializes / Deserializes | `serialize(state) → JSON`, `deserialize(json) → CharacterState` |
| **Timeline Engine** | Triggered by | Timeline Engine calls `save()` at checkpoints |
| **Branching Tree Visualizer** | Reads | Tree reads `LifeTreeSave` to render the tree graph |
| **App Shell** | Triggered by | App Shell calls `save()` on state transitions and `load()` on startup |
| **Generational Inheritance** | Reads | Reads parent's `LifeRecord.finalState` for inheritance |

## Formulas

### Save Data Size Estimate

```
active_life_size ≈ 5KB base + (years_lived * 50 bytes/year) + (events_fired * 100 bytes)
life_tree_size ≈ sum(life_record_sizes) + (branch_points * 500 bytes)
```

**Expected output**: A single 75-year life = ~15KB. A tree with 10 lives = ~150KB.
A tree with 50 lives = ~750KB. Well within IndexedDB limits (typically 50MB+).

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| IndexedDB unavailable (private browsing) | Fall back to localStorage with size warning. Limit tree to 5 lives. | Private browsing limits storage but shouldn't prevent playing. |
| Save data corrupted | Load with defaults for missing fields (Character State Model edge case). Log warning. Offer "start fresh" option. | Graceful degradation over crash. |
| Schema version mismatch | Run migration pipeline (version N → N+1 → N+2 ... → current). Each migration is a pure function. | Forward-only migration ensures old saves always work. |
| Storage quota exceeded | Warn player. Offer to delete oldest non-generational branches. Never auto-delete without consent. | Player data is sacred — always ask before deleting. |
| Page close during save | Prefer async IndexedDB flush over sync localStorage write. Set localStorage flag "has_unsaved_data: true" as recovery signal. On next load, if flag is set, attempt IndexedDB recovery first; if incomplete, reconstruct from last checkpoint. | Avoids deprecated synchronous storage; IndexedDB flush is faster and more reliable. |
| Two browser tabs | Second tab detects existing lock (localStorage flag) and shows warning. Only one active session. | Prevents save data race conditions. |
| Branch replay creates a paradox | No paradox possible — each branch is an independent life. The original life record is immutable. | Branches don't rewrite history; they create alternate timelines. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Character State Model | Serializes | Must serialize all 6 layers | Hard |
| IndexedDB / localStorage | Uses | Browser storage APIs | Hard |
| Timeline Engine | Called by | Triggered at checkpoints | Soft |
| Branching Tree Visualizer | Read by | Provides tree data | Hard |
| App Shell | Called by | Startup load, transition saves | Hard |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| CHECKPOINT_INTERVAL_YEARS | 5 | 1-10 | More frequent saves | Less I/O, higher risk |
| EMERGENCY_SAVE_MAX_SIZE | 50KB | 20-100KB | More data preserved on crash | Fits in localStorage more reliably |
| MAX_TREE_LIVES | 100 | 20-500 | Larger trees possible | Limits storage use |
| SCHEMA_VERSION | 1 | N/A | Increment on schema changes | N/A |
| SAVE_DEBOUNCE_MS | 1000 | 500-5000 | Fewer saves per burst | Faster save response |

## Acceptance Criteria

- [ ] Active life saves to IndexedDB within 50ms (async, non-blocking)
- [ ] Active life loads from IndexedDB within 100ms
- [ ] Save fires at configured checkpoint intervals and after major events
- [ ] beforeunload emergency save captures enough data to resume
- [ ] Branch replay correctly loads state snapshot and applies alternate choice
- [ ] Life tree accumulates completed lives and their branch points
- [ ] Schema migration pipeline upgrades v1 saves to current version
- [ ] Corrupted save data loads gracefully with defaults
- [ ] Storage quota exceeded shows warning (never auto-deletes)
- [ ] Multi-tab detection prevents concurrent sessions
- [ ] Private browsing fallback to localStorage works
- [ ] 50-life tree loads and renders within 200ms
- [ ] Total storage under 1MB for 50 completed lives

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should save data be exportable (JSON download) for backup? | Gameplay Programmer | Post-MVP | Players may want to preserve their tree across devices |
| Cloud sync architecture for cross-device play? | Technical Director | v1.0 planning | Requires user accounts, server infrastructure |
| Should the tree prune very old, unexplored branches to save space? | Game Designer | After observing real tree sizes | May never be needed if storage estimates hold |
