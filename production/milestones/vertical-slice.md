# Milestone: Vertical Slice

**Target**: Complete, polished single life with deep relationships, rich epitaph, and interactive tree
**Start Date**: 2026-03-23
**Estimated Sprints**: 4 sprints (Sprints 9-12)

## Vision

The MVP proves the loop works. The Vertical Slice proves it *feels* real. The
difference is relationships — named people who grow, change, betray, forgive,
and die alongside you. When a player says "I lost Marcus at age 67 and I still
think about it," the Vertical Slice has succeeded.

## Success Criteria

- [ ] Named NPCs with personality traits that affect interactions
- [ ] Relationship events: meeting, bonding, conflict, reconciliation, loss
- [ ] Relationship status visible on timeline ("You and Marcus grew closer")
- [ ] Relationships influence major event choices and outcomes
- [ ] At least 10 relationship-specific major events
- [ ] Epitaph references key relationships by name
- [ ] Tree visualization as interactive SVG graph (not a list)
- [ ] Tree nodes show relationship summaries per life
- [ ] 60+ minor templates, 25+ major events total
- [ ] Every playthrough has at least 3 meaningful relationship arcs

## Sprint Breakdown

| Sprint | Focus | Systems |
|--------|-------|---------|
| 9 | Relationship Engine | Relationship Tracker: NPC generation, closeness dynamics, relationship events, decay/growth |
| 10 | Relationship Content | Relationship-driven events (20+), friendship arcs, romance arcs, family dynamics, loss events |
| 11 | Epitaph & Tree Polish | Rich epitaph with relationship narratives, SVG tree visualization, node detail views |
| 12 | Integration & Playtest | Full integration, content balance, playtest 10 lives, polish, bug fixes |

---

## Sprint 9 — Relationship Engine

### Goal
Build the Relationship Tracker as a dedicated subsystem: NPC generation with
personality, dynamic closeness with meaningful thresholds, relationship event
triggers, and relationship-aware event selection.

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S9-01 | NPC personality model | Each relationship NPC gets 2-3 personality traits from a pool. Traits influence interaction events and closeness dynamics. | 3 |
| S9-02 | Relationship lifecycle | Define relationship phases: strangers → acquaintance → friend/close → deep bond (or estranged → reconciled). Thresholds trigger narrative events. | 3 |
| S9-03 | Relationship event triggers | When closeness crosses a threshold (up or down), generate a relationship-specific timeline entry. "You and [name] grew closer." / "The distance between you and [name] is growing." | 3 |
| S9-04 | Dynamic NPC generation | New NPCs generated at stage-appropriate moments: classmate in childhood, colleague in adulthood, neighbor in elder. Names from region pool, traits randomized. | 3 |
| S9-05 | Relationship-aware event selection | Life Event Generator boosts events matching active relationship types. Character with a romantic partner gets more romance events. Isolated character gets loneliness events. | 3 |
| S9-06 | Relationship decay improvements | Non-family relationships decay realistically: acquaintances fade fast, deep bonds fade slowly. Estranged relationships can trigger reconciliation events. | 2 |
| S9-07 | Tests for relationship engine | Unit tests for NPC generation, lifecycle transitions, event triggers, decay. | 3 |

### Should Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S9-08 | Relationship dashboard improvements | Dashboard shows relationship phase labels, NPC traits, relationship history summary. | 2 |
| S9-09 | Relationship timeline entries | Distinct styling for relationship events on the timeline (warm accent color, person icon). | 1 |

---

## Sprint 10 — Relationship Content

### Goal
Author relationship-driven events that make NPCs feel like real people.
Friendship arcs, romance arcs, family dynamics, rivalry, and loss.

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S10-01 | Friendship arc events (5 major) | Meeting a lifelong friend, friendship tested, growing apart, reconnecting, friend in crisis. | 5 |
| S10-02 | Romance arc events (5 major) | First attraction, deepening relationship, conflict/jealousy, commitment or breakup, long-term partnership evolution. | 5 |
| S10-03 | Family dynamic events (4 major) | Parent conflict/reconciliation, sibling rivalry/bonding, caring for aging parent, family reunion. | 4 |
| S10-04 | Loss events (3 major) | Death of a close friend, death of a spouse/partner, death of a child (rare, devastating). | 3 |
| S10-05 | Relationship minor templates (10) | Small relationship moments: inside jokes, casual hangouts, missed calls, birthday celebrations, arguments about nothing. | 3 |
| S10-06 | Relationship-conditional content | Existing major events gain relationship-aware variants. Career crossroads mentions partner's opinion. Retirement event references relationships. | 3 |
| S10-07 | Tests for relationship events | Data integrity tests, condition verification. | 2 |

---

## Sprint 11 — Epitaph & Tree Polish

### Goal
Make the end-of-life experience and tree exploration feel complete and
emotionally resonant.

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S11-01 | Rich epitaph with relationships | Epitaph names key relationships: "Married to [name] for 40 years", "Best friend: [name]", "Estranged from [name] since age 35". | 3 |
| S11-02 | Epitaph narrative generation | Generate 2-3 paragraph narrative summary of the life, not just bullet points. Reference defining choices and their echoes. | 4 |
| S11-03 | SVG tree visualization | Replace the list-based tree with an interactive SVG: nodes connected by lines, zoom/pan, branch points as fork markers. | 5 |
| S11-04 | Tree node interaction | Click a node to see full epitaph. Branch forks show the choice and alternatives. Unexplored branches shown as dotted lines. | 3 |
| S11-05 | Tree comparison view | Side-by-side comparison of two lives from the same branch point. "What changed?" highlighting. | 3 |
| S11-06 | Tests for tree + epitaph | Integration tests for SVG rendering data, epitaph narrative generation. | 2 |

---

## Sprint 12 — Integration & Playtest

### Goal
Everything works together. Content is balanced. 10 playtested lives verify
quality.

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S12-01 | Full integration test suite | Simulate 10 lives with relationship tracking, verify relationship arcs form, epitaphs reference names, tree stores correctly. | 4 |
| S12-02 | Content balance pass | Verify event distribution: no dead zones, no over-represented events, relationship events fire at appropriate density. | 3 |
| S12-03 | Manual playtest (3 lives) | Play through 3 complete lives, log issues, verify emotional beats land. | 3 |
| S12-04 | Bug fixes from playtest | Fix all issues found in S12-03. | 4 |
| S12-05 | Performance verification | Verify 60fps timeline scroll, <5ms tick processing, <100MB memory across a full life. | 2 |
| S12-06 | Vertical Slice success criteria check | Run through each criterion and verify pass/fail. | 2 |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| NPCs feel generic despite personality traits | High | High | Invest in trait-specific dialogue variants. Each trait should produce noticeably different interaction text. |
| Relationship events fire too often (every year) or too rarely (once a life) | Medium | High | Tune density per relationship phase. New relationships = more events. Stable ones = fewer but deeper. |
| SVG tree becomes unreadable with many lives | Medium | Medium | Progressive disclosure: collapse old branches, zoom levels, search/filter. |
| Loss events feel cheap or manipulative | Medium | High | Loss should always feel earned — only characters the player has spent time with. Never kill NPCs the player just met. |
| Content volume still feels thin with relationships | Low | Medium | Relationship template system with personality-aware text variants multiplies effective content. |
