# Sprint 3 — 2026-04-13 to 2026-05-03

## Sprint Goal

Build the proper Life Event Generator with freshness/relevance scoring, expand
event content to cover all 8 life stages, add fallback events, and implement the
full Choice & Consequence pipeline with consequence magnitude scaling. By sprint
end, every life from birth to death has varied, contextually appropriate events
with no "dead zones" where nothing happens.

## Capacity

- Total hours: ~37.5 (3 weeks × ~12.5 hrs/week)
- Buffer (20%): ~7.5 hours reserved for unplanned work
- Available: ~30 hours

## Tasks

### Must Have (Critical Path)

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S3-01 | Life Event Generator — full pipeline | Replace the stub `selectEventsForYear` with the full query-filter-weight-select pipeline. Add freshness scoring (reduce weight for recently-fired events), relevance scoring (boost events matching personality/tags/attributes). Per `design/gdd/life-event-generator.md`. | 5 | S2-03 | Events are weighted by freshness + relevance. Recently fired events appear less. Events matching personality/circumstances appear more. No duplicate events in same year. |
| S3-02 | Fallback event pool | Create 15 universal fallback events (no conditions, high maxOccurrences) covering all stages. These fire when no eligible events exist for a year. | 2 | S3-01 | Fallback pool has 15+ templates. No year ever produces zero events. Fallback events are stage-appropriate ("A quiet childhood afternoon" vs "A peaceful retirement day"). |
| S3-03 | Young Adult + Adult events | Author 8 minor templates and 3 major events for Young Adult (18-25) and Adult (26-45) stages. Career, romance, financial, and family categories. | 4 | S1-05 | 8 minor templates with 3+ variable slots. 3 major events with 2+ choices. All type-check. Events cover career progression, romantic relationships, and financial decisions. |
| S3-04 | Midlife + Elder events | Author 6 minor templates and 2 major events for Midlife (46-60) and Elder (61+) stages. Health, legacy, retirement categories. | 3 | S1-05 | 6 minor templates. 2 major events. Events cover health decline, retirement decisions, and legacy reflection. |
| S3-05 | Choice & Consequence — magnitude scaling | Implement vulnerability and resilience scaling from the GDD. Low-attribute characters are hit harder by negative effects; struggling characters benefit more from positive effects. Cap single-effect at 30. | 3 | S1-03 | Vulnerability factor applies: wealth 20 + wealth -15 effect → effective -21. Resilience applies to positive effects. No single effect exceeds 30 after scaling. |
| S3-06 | Consequence narrative hints | After a choice applies effects, show a brief narrative hint on the timeline: "You feel a surge of confidence" or "Financial pressure mounts." Based on which attributes changed and by how much. | 2 | S3-05 | Attribute changes of ±5 or more produce a narrative hint. Hints are specific to the attribute/direction. Hints appear as timeline entries after the choice consequence text. |
| S3-07 | Unit tests for Sprint 3 | Tests for: Life Event Generator (freshness, relevance, fallback), magnitude scaling (vulnerability, resilience, cap), consequence hints. | 4 | S3-01, S3-05 | Tests cover all new game logic. Generator produces varied output across multiple runs. Scaling formulas match GDD values. 80%+ coverage on new code. |

### Should Have

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S3-08 | Event history tracking | Track which events have fired (by ID + age), persist in game state. Used by freshness scoring and prerequisite/exclusion checks. | 2 | S3-01 | Event history is maintained per-life. Prerequisites and exclusions work correctly. History survives save/load. |
| S3-09 | Early life events (Infancy + Early Childhood) | Author 4 minor templates for Infancy (0-2) and Early Childhood (3-5). Observation-only events with no choices. | 2 | S1-05 | 4 templates covering first steps, first words, preschool moments. No choices (agency = none/minimal). Events feel nostalgic and brief. |

### Nice to Have

| ID | Task | Description | Est. Hours | Dependencies | Acceptance Criteria |
|----|------|-------------|-----------|-------------|-------------------|
| S3-10 | Personality-driven event text | Minor event templates reference personality: "Your cautious nature kept you from..." or "Your ambitious streak drove you to..." | 2 | S3-01 | At least 5 templates include personality-aware text variants. |

## Carryover from Previous Sprint

N/A — Sprint 2 completed all tasks.

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Event content volume is thin for mid/late life stages | High | Medium | Fallback pool + template variety compensate. Sprint 6 is dedicated content authoring. |
| Relevance scoring produces samey event selection | Medium | Medium | Add randomness floor: even low-relevance events have a chance. Playtest and tune weights. |
| Magnitude scaling creates death spirals | Low | High | Cap at 30 per effect. Monitor poverty→stress→health chain in playtesting. |

## Dependencies on External Factors

- None

## Definition of Done for this Sprint

- [ ] All Must Have tasks completed
- [ ] Every life stage has at least some events (no empty stages)
- [ ] Events vary meaningfully across different characters
- [ ] Tests pass with 80%+ coverage on new game logic
- [ ] `npm run build` and `npm run lint` pass clean
