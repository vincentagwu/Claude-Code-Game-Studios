# Sprint 2 — 2026-03-23 to 2026-04-12

## Sprint Goal

Wire the game loop end-to-end: a player clicks "New Life," watches years tick by
with events appearing on a scrolling timeline, makes choices at major events, and
sees their character die — producing one complete playable life. This sprint
builds the App Shell wiring, Starting Conditions Generator, Timeline Engine, and
basic Save/State Persistence.

## Capacity

- Total hours: ~37.5 (3 weeks × ~12.5 hrs/week)
- Buffer (20%): ~7.5 hours reserved for unplanned work
- Available: ~30 hours

## Tasks

### Must Have (Critical Path)

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S2-01 | Starting Conditions Generator | Implement `generateStartingConditions()`: randomize region, class, family structure, parent traits, health lottery. Return a complete `CharacterState` ready for gameplay. Per `design/gdd/starting-conditions-generator.md`. | 4 | S1-02, S1-04 | Generates valid `CharacterState` with randomized identity, attributes (clamped to class ranges), 2-4 family relationships, personality seeds ±15. Multiple calls produce visually distinct lives. |
| S2-02 | Timeline Engine — tick loop | Implement the year tick pipeline as a state machine: increment age, check stage transition, apply passive drifts, process delayed effects, check death. No UI yet — pure logic. Returns a list of "things that happened this year." | 5 | S1-03, S1-04, S1-10 | Tick advances age by 1. Stage transitions fire at correct boundaries. Passive drifts apply (via `applyPassiveDrifts`). Delayed effects process. Death probability rolls at age 65+. Health=0 triggers immediate death. Full tick completes in <5ms. |
| S2-03 | Timeline Engine — event integration | Connect tick loop to event selection. For each year, select eligible events from seed content based on stage, conditions, and weights. Queue events by priority (major first). Stub for Life Event Generator (Sprint 4). | 4 | S2-02, S1-05, S1-06 | Events are selected per-year respecting stage event density ranges. Conditions are evaluated. Major events are queued before minor. Milestone events fire at their target age. No eligible events produces a fallback "quiet year." |
| S2-04 | Wire Title Screen → New Life | Connect the "New Life" button: generate starting conditions, initialize the game store, navigate to `/life`. "Continue" button loads from save (if exists). | 2 | S2-01 | Clicking "New Life" creates a character and navigates to `/life`. Character name and birth details are visible. "Continue" is disabled when no save exists, loads save when one does. |
| S2-05 | Timeline UI — basic scroll view | Build the `/life` page as a vertically scrolling timeline. Show age markers, minor event text, and stage transition dividers. No fancy presentation formats yet — just text. | 5 | S2-03, S2-04 | Timeline renders with age markers on the left. Minor events show as text entries. Stage transitions show a divider with stage name. Current year is highlighted at the bottom. Scrolls smoothly at 60fps. |
| S2-06 | Timeline UI — auto-advance + pacing | Implement the auto-scroll tick: years advance at stage-defined intervals. Timeline pauses for major events. Player can tap/click to skip to next event. | 4 | S2-05, S2-02 | Years auto-advance at correct intervals per stage (10s infancy, 75s elder). Timeline pauses at major events. Skip-ahead jumps to next event. Tab visibility API pauses/resumes timeline. |
| S2-07 | Major event — choice UI | When a major event fires, show a choice card overlay. Player selects an option, effects apply, consequence narrative shows briefly, then timeline resumes. | 4 | S2-06, S1-06 | Major events display setup text + choice buttons. Selecting a choice applies effects to store. Consequence narrative shows for 1.5s. Timeline resumes after. All 3 seed major events (ages 12, 18, 25) are playable. |
| S2-08 | Death sequence | When death triggers, stop the timeline, show a simple death screen with character name, age, and cause. "View Tree" button navigates to `/tree` (placeholder). "New Life" returns to title. | 2 | S2-06 | Death triggers at correct probability. Death screen shows name, age at death, and life stage. "New Life" navigates to title. "View Tree" navigates to `/tree`. |

### Should Have

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S2-09 | Save/State Persistence — auto-save | Implement IndexedDB auto-save: save after every major event and every 5 years. Load on app launch. Use `idb` wrapper per ADR-002. | 3 | S2-02, S1-09 | State auto-saves to IndexedDB. Refreshing the page and clicking "Continue" resumes from last save. Corrupted saves load gracefully with defaults. |
| S2-10 | Dashboard slide-out panel | Implement the dashboard panel (slide from right on desktop, bottom sheet on mobile). Show 7 attribute buckets, personality labels, and tag list. | 3 | S2-05, S1-08 | Dashboard opens/closes with icon click. Shows all 7 attributes as qualitative labels. Shows personality spectrum labels. Shows earned tags as "Life Story" list. Auto-closes when major event triggers. |

### Nice to Have

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S2-11 | Stage visual theming | Apply stage-specific CSS variables (colors, typography weight) from `ThemeTokens`. Cross-fade on stage transition. | 2 | S2-05, S1-04 | Background and text colors change per stage. Transition is a smooth cross-fade. All 8 stage themes visually distinct. |
| S2-12 | Age counter header | Show persistent header with current age, life stage name, and location. Updates each year tick. | 1 | S2-06 | Header shows "Age 25 · Young Adult · Portland". Updates every tick. Hidden on title screen. |

## Carryover from Previous Sprint

N/A — Sprint 1 completed all tasks (Must Have, Should Have, and Nice to Have).

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| React state + Zustand + timer interaction causes re-render storms | Medium | High | Use Zustand selectors to minimize re-renders. Timeline tick runs outside React (setInterval), pushes state updates in batches. Profile early. |
| Timeline scroll performance with many entries | Low | Medium | Virtualize the scroll list if entries exceed ~100 visible. Start without virtualization, add if needed. |
| Auto-scroll UX feels wrong (too fast, too slow, jarring) | High | Medium | All pacing values are in config. Playtest and adjust. The tuning knobs are already defined in the GDD. |
| IndexedDB API differences across browsers | Low | Low | Using `idb` wrapper per ADR-002 which handles cross-browser differences. |

## Dependencies on External Factors

- None — this sprint is entirely local development with no external services.

## Definition of Done for this Sprint

- [ ] All Must Have tasks completed
- [ ] Player can click "New Life" and play through an entire life to death
- [ ] Major events pause timeline and present choices
- [ ] All tasks pass acceptance criteria
- [ ] Tests pass with 80%+ coverage on new game logic
- [ ] `npm run build` and `npm run lint` pass clean
- [ ] No critical bugs in the playable loop
