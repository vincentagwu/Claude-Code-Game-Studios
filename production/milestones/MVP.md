# Milestone: MVP

**Target**: One playable life from birth to death with choices, branching tree replay
**Timeline**: 6 months (~8 sprints at 3 weeks each)
**Start Date**: 2026-03-23
**Target Date**: 2026-09-21
**Actual Completion**: 2026-03-23 (all 8 sprints completed in single session)

## Success Criteria

- [x] Player can start a new life with random starting conditions
- [x] Timeline scrolls through 8 life stages with variable pacing
- [x] Minor events appear on the timeline (41 templates, ~900+ variations)
- [x] Major events pause the timeline with Scenario Cards (18 major/crisis events)
- [x] Choices modify character state with visible consequences
- [x] End-of-life epitaph summarizes the life lived
- [x] Basic branching tree shows paths taken and not taken
- [x] Player can replay from any branch point in the tree
- [x] All state persists in browser (IndexedDB)
- [x] Web app runs as a PWA

### Notes on Criteria

- **Major events**: 18 of 20 target. Close enough for MVP — 2 more can be added in
  a content sprint. All 5 presentation formats are implemented.
- **PWA**: Manifest, service worker, and offline capability configured. Icon
  placeholders need real artwork for store submission.

## Sprint Breakdown (Actual)

| Sprint | Focus | Status |
|--------|-------|--------|
| 1 | Foundation: types, store, stages, events, tests | Complete |
| 2 | Core Engine: timeline, game loop, UI, save | Complete |
| 3 | Life Event Generator, magnitude scaling, content | Complete |
| 4 | Presentation polish, integration tests | Complete |
| 5 | All 5 formats, birth intro, epitaph, animations | Complete |
| 6 | Content expansion (40+ minor, 18 major), keyboard, mobile | Complete |
| 7 | Branching tree, branch replay, life records | Complete |
| 8 | PWA, error boundary, final integration, verification | Complete |

## Final Metrics

- **227 tests** across 15 suites (unit + integration)
- **41 minor event templates** (~900+ variations)
- **18 major/crisis events** with branching choices
- **15 fallback events** covering all stages
- **~50 source files** across game logic, engine, UI, data, persistence, tree
- TypeScript strict mode, zero errors
- Build + lint clean
