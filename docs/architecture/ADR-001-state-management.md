# ADR-001: State Management Approach

**Status**: Accepted
**Date**: 2026-03-22
**Decision Makers**: User + technical-director

## Context

LifePath needs a state management solution for the Character State Model — a
6-layer data structure (Identity, Personality Spectrums, Life Attributes, Life Tags,
Relationships, Flags) that every system reads from and writes to. The state must:

- Be accessible from any component in the React tree
- Support frequent updates (every year tick modifies multiple values)
- Be serializable for save/load (IndexedDB)
- Support derived values (Flags are computed from other layers)
- Be performant (state updates must complete within 1ms)

## Options Considered

### 1. React Context + useReducer
- **Pros**: Zero dependencies, built into React, simple mental model
- **Cons**: Re-renders all consumers on any state change (performance risk with
  frequent tick updates), no middleware for side effects

### 2. Zustand
- **Pros**: Minimal API, selector-based subscriptions (only re-render what changed),
  built-in middleware (persist, devtools), tiny bundle (~1KB), works outside React
- **Cons**: Additional dependency, less "standard" than Context

### 3. Redux Toolkit
- **Pros**: Mature, powerful middleware, great devtools, well-documented
- **Cons**: Boilerplate-heavy for this project's needs, larger bundle, overkill
  for a single-player game with one state tree

### 4. Jotai / Recoil (Atomic state)
- **Pros**: Fine-grained reactivity, each attribute could be its own atom
- **Cons**: Adds complexity for a state model that's conceptually one object,
  serialization requires custom logic

## Decision

**Zustand** for game state management.

### Rationale

1. **Selector-based subscriptions** solve the key performance concern: the Timeline
   Engine updates state every tick, but UI components only re-render when their
   specific slice changes (e.g., the age counter doesn't re-render when Wealth changes).
2. **Works outside React**: The Timeline Engine and Life Event Generator are logic
   systems, not UI components. Zustand's vanilla store is callable from plain
   TypeScript, unlike React Context.
3. **Built-in persist middleware**: Maps directly to the Save/State Persistence
   system's IndexedDB requirement.
4. **Minimal bundle**: ~1KB gzipped. Won't impact the <200KB bundle budget.
5. **Simple API**: A solo developer can be productive immediately.

### Store Structure

```typescript
interface LifePathStore {
  // Character State Model (6 layers)
  character: CharacterState;

  // Timeline state
  currentAge: number;
  currentStage: LifeStage;
  timelineState: "running" | "paused" | "presenting" | "death";

  // Session state
  eventHistory: string[];
  delayedEffectQueue: DelayedEffect[];
  branchPoints: BranchPoint[];

  // Actions
  applyEffect: (effect: Effect) => void;
  advanceYear: () => void;
  setTimelineState: (state: TimelineState) => void;
}
```

## Consequences

- **Positive**: Clean separation between game logic and UI rendering
- **Positive**: State is testable without React (plain TypeScript tests)
- **Positive**: Persist middleware reduces Save system implementation effort
- **Negative**: Additional dependency (acceptable at ~1KB)
- **Negative**: Team must learn Zustand patterns (minimal learning curve)

## References

- Character State Model GDD: `design/gdd/character-state-model.md`
- Save/State Persistence GDD: `design/gdd/save-state-persistence.md`
- Timeline Engine GDD: `design/gdd/timeline-engine.md`
