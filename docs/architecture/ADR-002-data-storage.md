# ADR-002: Data Storage Strategy

**Status**: Accepted
**Date**: 2026-03-22
**Decision Makers**: User + technical-director

## Context

LifePath needs to persist three categories of data in the browser:

1. **Active life state** (~15KB): Current character, timeline position, event history,
   delayed effect queue
2. **Life tree** (~150KB for 10 lives, ~750KB for 50): All completed lives, branch
   points, epitaphs, generational links
3. **Player preferences** (~1KB): Settings, audio state, tutorial flags

The game must work offline (PWA), support save/load without user action, handle
page close gracefully, and support branch replay (loading state snapshots from
past decision points).

## Options Considered

### 1. localStorage only
- **Pros**: Synchronous, simple API, universal browser support
- **Cons**: 5-10MB limit (may hit with large trees), blocks main thread on read/write,
  no structured queries, no transactions

### 2. IndexedDB only
- **Pros**: Large storage (50MB+), async/non-blocking, structured data with object
  stores, transaction support
- **Cons**: Complex API, no synchronous access for emergency saves, verbose

### 3. IndexedDB primary + localStorage signal
- **Pros**: Best of both — IndexedDB for all real data, localStorage only for tiny
  flags ("has_unsaved_data") that can be checked synchronously on load
- **Cons**: Two storage APIs to manage

### 4. SQLite via WASM (sql.js)
- **Pros**: Full SQL queries, familiar, powerful
- **Cons**: Large WASM bundle (~500KB), overkill for this data model, complex setup

## Decision

**IndexedDB primary + localStorage signal** (Option 3).

### Rationale

1. **IndexedDB handles all real data**: Active life, tree, preferences stored in
   separate object stores. Async writes never block the game loop.
2. **localStorage is minimal**: Only stores `has_unsaved_data: boolean` and
   `tab_lock: { timestamp, tabId }` for multi-tab detection. Never stores game state.
3. **50MB+ storage** handles even extreme players (100+ lives in the tree).
4. **Transaction support** prevents partial saves — either the full state writes
   or nothing does.
5. **Zustand persist middleware** (from ADR-001) supports IndexedDB storage adapters
   natively.

### Schema

```
IndexedDB: "lifepath_db" (version 1)
├── Object Store: "active_life"    (keyPath: "id", single record)
├── Object Store: "life_tree"      (keyPath: "id", single record)
├── Object Store: "life_records"   (keyPath: "lifeId", multiple records)
├── Object Store: "preferences"    (keyPath: "id", single record)
└── Object Store: "meta_progress"  (keyPath: "id", single record)

localStorage:
├── "lifepath_has_unsaved" : "true" | "false"
└── "lifepath_tab_lock"   : JSON { tabId, timestamp }
```

### Migration Strategy

- Schema version stored in IndexedDB database version number
- `onupgradeneeded` handler runs migration functions sequentially (v1→v2→v3...)
- Each migration is a pure function: `(oldData) => newData`
- Missing fields get documented defaults (e.g., new "Stress" attribute defaults to 50)
- Migrations are tested with fixtures of each prior version

## Consequences

- **Positive**: Sufficient storage for any realistic play pattern
- **Positive**: Non-blocking saves maintain 60fps during gameplay
- **Positive**: Transaction safety prevents corrupted saves
- **Positive**: Emergency save signal (localStorage flag) is synchronous and reliable
- **Negative**: IndexedDB API is verbose (mitigated by using idb wrapper library)
- **Negative**: Private browsing mode may limit IndexedDB availability (graceful fallback)

## References

- Save/State Persistence GDD: `design/gdd/save-state-persistence.md`
- App Shell & Navigation GDD: `design/gdd/app-shell-navigation.md`
