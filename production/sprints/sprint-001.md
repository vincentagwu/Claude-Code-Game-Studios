# Sprint 1 — 2026-03-23 to 2026-04-12

## Sprint Goal

Scaffold the Next.js project and implement the Foundation layer: Character State
Model (Zustand store + TypeScript types), Life Stage Definitions (configuration
data), and Event Content Database schema with initial test content. By sprint end,
the data backbone is implemented and testable — every future system builds on this.

## Capacity

- Total hours: ~37.5 (3 weeks × ~12.5 hrs/week)
- Buffer (20%): ~7.5 hours reserved for unplanned work
- Available: ~30 hours

## Tasks

### Must Have (Critical Path)

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S1-01 | Project scaffolding | `npx create-next-app` with TypeScript, Tailwind CSS, App Router. Install Zustand + idb. Set up folder structure per `design/gdd/app-shell-navigation.md` route structure. Configure ESLint, Prettier. | 3 | None | `npm run dev` starts cleanly. TypeScript strict mode. Folder structure matches design doc. |
| S1-02 | Character State types | Define all TypeScript interfaces: `CharacterState`, `Identity`, `PersonalitySpectrums`, `LifeAttributes`, `LifeTag`, `Relationship`, `DerivedFlags`. Per `design/gdd/character-state-model.md` Layers 1-6. | 4 | S1-01 | All 6 layers have TypeScript interfaces. Types compile with strict mode. Display bucket helper functions defined. |
| S1-03 | Zustand game store | Create `useGameStore` with Zustand. Implement `CharacterState` as the core slice. Add actions: `applyEffect()`, `applyPassiveDrifts()`, `recalculateFlags()`. Per ADR-001. | 5 | S1-02 | Store creates, reads, and updates all 6 state layers. `applyEffect` handles attribute, spectrum, tag, relationship, and flag operations. |
| S1-04 | Life Stage config data | Define `STAGES` array as TypeScript data (per ADR-003) with all 8 stages. Each stage: age range, yearsPerMin, agency level, event density, theme tokens. Per `design/gdd/life-stage-definitions.md`. | 2 | S1-01 | All 8 stages defined. `getStageForAge(age)` helper works correctly. Theme token values match design doc. |
| S1-05 | Event schema + types | Define TypeScript interfaces: `LifeEvent`, `Effect`, `Condition`, `Choice`, `MinorEventTemplate`, `VariableSlot`. Per `design/gdd/event-content-database.md`. | 3 | S1-02 | All event types compile. Condition evaluation function (`evaluateConditions`) handles all 6 condition types. |
| S1-06 | Seed event content | Author 10 minor event templates (covering Childhood + Adolescence) and 3 major events (age 12, 18, 25) as TypeScript data files. Per ADR-003 file structure. | 5 | S1-05 | 10 minor templates with 3+ variable slots each. 3 major events with 2+ choices each. All content type-checks. |
| S1-07 | Unit tests | Write Jest tests for: Character State Model (all drift formulas, clamping, inertia), Life Stage lookup, Condition evaluation, Effect application. | 5 | S1-03, S1-04, S1-05 | Tests cover: attribute clamping 0-100, spectrum clamping -100/+100, inertia formula, personality decay, health aging, happiness adaptation, condition evaluation for all 6 types. 80%+ coverage on game logic. |

### Should Have

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S1-08 | Display bucket helpers | Implement `getDisplayBucket(attribute, value)` → qualitative label. `getPersonalityLabel(spectrum, value)` → personality description. Per CSM Dashboard Display Buckets table. | 2 | S1-02 | All 7 attributes return correct bucket labels. All 6 spectrums return correct qualitative labels. |
| S1-09 | State serialization | Implement `serialize(state) → JSON` and `deserialize(json) → CharacterState` with validation. Graceful defaults for missing fields. Per Save/State Persistence edge cases. | 3 | S1-03 | Round-trip serialization preserves all data. Missing fields get defaults. Corrupted input doesn't crash. |

### Nice to Have

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S1-10 | Delayed effect queue | Implement `DelayedEffect` type and queue management: add, process by age, expire, cap at 50. Per Choice & Consequence System GDD. | 3 | S1-03 | Queue adds/processes/expires correctly. Cap at 50 with lowest-impact eviction. |
| S1-11 | Template variable resolver | Implement minor event template resolution: pool selection, stateQuery resolution, relationship fallbacks. Per Event Content Database GDD. | 3 | S1-05, S1-03 | Templates with pool/state/relationship variables resolve correctly. Missing relationships fall back to generic text. |

## Carryover from Previous Sprint

N/A — this is the first sprint.

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Zustand persist middleware doesn't integrate cleanly with IndexedDB | Low | Medium | Use idb directly for persistence in Sprint 2 rather than relying on middleware |
| Character State Model types are more complex than estimated | Medium | Low | Types are well-specified in the GDD. If interfaces get complex, split into separate files per layer |
| Event condition evaluation is tricky to get right for all 6 types | Medium | Medium | Write tests first (TDD). Start with attribute/spectrum conditions, add relationship/tag/flag/identity incrementally |
| Part-time schedule means context switching slows progress | High | Low | Use session-state/active.md to capture context. Keep tasks small (2-5 hour chunks) |

## Dependencies on External Factors

- None — this sprint is entirely local development with no external services

## Definition of Done for this Sprint

- [ ] All Must Have tasks (S1-01 through S1-07) completed
- [ ] All tasks pass acceptance criteria
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run test` passes with 80%+ coverage on game logic
- [ ] No TypeScript `any` types in game logic code
- [ ] All game values externalized in data files (per ADR-003), not hardcoded in logic
- [ ] Design documents updated for any deviations from the GDDs
- [ ] Code committed with meaningful commit messages

## Hours Breakdown

| Category | Hours |
|----------|-------|
| Must Have (S1-01 to S1-07) | 27 |
| Should Have (S1-08, S1-09) | 5 |
| Nice to Have (S1-10, S1-11) | 6 |
| Buffer | 7.5 |
| **Total** | **37.5** |

Must Have fits within the 30 available hours. Should Have tasks get pulled in
if Must Have finishes early. Nice to Have defers to Sprint 2 if needed.
