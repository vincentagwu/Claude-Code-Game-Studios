# Systems Index: LifePath

> **Status**: Draft
> **Created**: 2026-03-22
> **Last Updated**: 2026-03-22
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

LifePath is a narrative-driven life simulator with three mechanical layers: living
a life (timeline scroll + choices), exploring alternate paths (branching tree), and
generational continuity (inheritance). The systems break into a clear hierarchy:
a **character state model** at the foundation, **time and event systems** in the
middle, and **presentation and visualization** at the top. The game's pillars
("Every Choice Echoes," "Life is Unfair," "Time Never Stops," "The Road Not Taken")
mean the choice-consequence system and branching tree are load-bearing — they must
be designed with extreme care.

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Character State Model | Core | MVP | Approved | design/gdd/character-state-model.md | None |
| 2 | Life Stage Definitions | Core | MVP | Approved | design/gdd/life-stage-definitions.md | None |
| 3 | Event Content Database | Narrative | MVP | Approved | design/gdd/event-content-database.md | None |
| 4 | App Shell & Navigation | UI | MVP | Approved | design/gdd/app-shell-navigation.md | None |
| 5 | Starting Conditions Generator | Gameplay | MVP | Approved | design/gdd/starting-conditions-generator.md | Character State Model, Life Stage Definitions |
| 6 | Timeline Engine | Core | MVP | Approved | design/gdd/timeline-engine.md | Character State Model, Life Stage Definitions |
| 7 | Save / State Persistence | Persistence | MVP | Approved | design/gdd/save-state-persistence.md | Character State Model |
| 8 | Choice & Consequence System | Gameplay | MVP | Approved | design/gdd/choice-consequence-system.md | Character State Model, Timeline Engine |
| 9 | Life Event Generator | Gameplay | MVP | Approved | design/gdd/life-event-generator.md | Character State Model, Life Stage Definitions, Event Content Database, Timeline Engine |
| 10 | Event Presentation Layer | UI | MVP | Approved | design/gdd/event-presentation-layer.md | Life Event Generator, Choice & Consequence System |
| 11 | Relationship Tracker | Gameplay | Vertical Slice | Not Started | — | Character State Model, Choice & Consequence System |
| 12 | Epitaph / Life Summary Generator | Narrative | Vertical Slice | Not Started | — | Character State Model, Relationship Tracker, Choice & Consequence System |
| 13 | Branching Tree Visualizer | UI | Vertical Slice | Not Started | — | Save / State Persistence, Choice & Consequence System |
| 14 | Generational Inheritance System | Gameplay | Alpha | Not Started | — | Character State Model, Starting Conditions Generator, Relationship Tracker |
| 15 | Content Authoring Schema (inferred) | Meta | Alpha | Not Started | — | Event Content Database |
| 16 | Tutorial / Onboarding (inferred) | Meta | Full Vision | Not Started | — | Timeline Engine, Event Presentation Layer |
| 17 | Audio Manager (inferred) | Audio | Full Vision | Not Started | — | Timeline Engine, Life Stage Definitions, Event Presentation Layer |

---

## Categories

| Category | Description | Systems in This Project |
|----------|-------------|----------------------|
| **Core** | Foundation data models and engines everything depends on | Character State Model, Life Stage Definitions, Timeline Engine |
| **Gameplay** | Systems that drive the game's interactive mechanics | Starting Conditions Generator, Choice & Consequence System, Life Event Generator, Relationship Tracker, Generational Inheritance System |
| **Narrative** | Content storage and narrative generation | Event Content Database, Epitaph / Life Summary Generator |
| **UI** | Player-facing displays and interaction surfaces | App Shell & Navigation, Event Presentation Layer, Branching Tree Visualizer |
| **Persistence** | Save state and data continuity | Save / State Persistence |
| **Audio** | Sound and music | Audio Manager |
| **Meta** | Tooling, onboarding, and systems outside the core loop | Content Authoring Schema, Tutorial / Onboarding |

---

## Priority Tiers

| Tier | Definition | Target Milestone | Systems Count |
|------|------------|------------------|---------------|
| **MVP** | Required for core loop: one playable life with choices and basic tree replay | First playable (6 months) | 10 |
| **Vertical Slice** | Complete, polished single life with relationships, epitaph, and full tree | Vertical slice (9 months) | 3 |
| **Alpha** | Generational play + content scaling tools | Alpha (12 months) | 2 |
| **Full Vision** | Polish, audio, explicit onboarding | Release (15+ months) | 2 |

---

## Dependency Map

### Foundation Layer (no dependencies)

1. **Character State Model** — The data backbone. Traits, flags, stats, relationships. 12 of 17 systems depend on this (directly or transitively). HIGHEST PRIORITY.
2. **Life Stage Definitions** — Pure data defining the 8 life stages, their age ranges, properties, available events, and pacing speeds.
3. **Event Content Database** — Schema + content storage for all life events (minor timeline events, major narrative moments, choices).
4. **App Shell & Navigation** — Next.js app container: routing between life view, tree view, settings. The frame everything renders inside.

### Core Layer (depends on Foundation)

5. **Starting Conditions Generator** — depends on: Character State Model, Life Stage Definitions. Produces randomized birth circumstances: family, location, socioeconomic class, initial traits.
6. **Timeline Engine** — depends on: Character State Model, Life Stage Definitions. Controls time progression with variable speed (fast routine years, slow milestone moments). Reads/writes character state as time passes.
7. **Save / State Persistence** — depends on: Character State Model. Serializes game state to browser localStorage or IndexedDB. Enables tree replay and session continuity.

### Feature Layer (depends on Core)

8. **Choice & Consequence System** — depends on: Character State Model, Timeline Engine. The pillar "Every Choice Echoes" lives here. Tracks decisions, applies immediate and delayed consequences via trait/flag modifications, triggers cascading effects.
9. **Life Event Generator** — depends on: Character State Model, Life Stage Definitions, Event Content Database, Timeline Engine. Queries current state (age, traits, circumstances, stage) against the event database to select contextually appropriate events.
10. **Relationship Tracker** — depends on: Character State Model, Choice & Consequence System. Specialized consequence subsystem for people — family members, friends, romantic partners. Tracks relationship state, generates relationship-driven events.
11. **Generational Inheritance System** — depends on: Character State Model, Starting Conditions Generator, Relationship Tracker. Reads parent's final state and produces child's starting conditions. The bridge between Layer 1 (Life) and Layer 3 (Legacy).

### Presentation Layer (depends on Features)

12. **Event Presentation Layer** — depends on: Life Event Generator, Choice & Consequence System. Renders events in mixed formats: timeline pop-ups (minor), visual novel scenes (relationship moments), scenario cards (career/education), mini-narratives (crises). Captures player choices and routes them to the consequence system.
13. **Branching Tree Visualizer** — depends on: Save / State Persistence, Choice & Consequence System. Interactive SVG/canvas visualization of the life decision graph. Unexplored branches shown as greyed paths. Click a crossroads to start a new life from that point.
14. **Epitaph / Life Summary Generator** — depends on: Character State Model, Relationship Tracker, Choice & Consequence System. At death, reads the complete life record and generates a narrative summary: key achievements, important relationships, major regrets, defining moments.

### Polish Layer (depends on everything)

15. **Content Authoring Schema** — depends on: Event Content Database. JSON schema definition, validation tooling, and possibly a simple authoring UI for creating events at scale.
16. **Tutorial / Onboarding** — depends on: Timeline Engine, Event Presentation Layer. Shapes the infancy/early childhood experience as an implicit tutorial. May add subtle UI hints or guided first-life experience.
17. **Audio Manager** — depends on: Timeline Engine, Life Stage Definitions, Event Presentation Layer. Ambient soundtrack per life stage, transition music, UI sounds for choices, event-specific audio cues.

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Character State Model | MVP | Foundation | game-designer, systems-designer | M |
| 2 | Life Stage Definitions | MVP | Foundation | game-designer | S |
| 3 | Event Content Database | MVP | Foundation | game-designer, systems-designer | M |
| 4 | App Shell & Navigation | MVP | Foundation | ui-programmer, ux-designer | S |
| 5 | Starting Conditions Generator | MVP | Core | game-designer, systems-designer | S |
| 6 | Timeline Engine | MVP | Core | game-designer, gameplay-programmer | M |
| 7 | Save / State Persistence | MVP | Core | gameplay-programmer | S |
| 8 | Choice & Consequence System | MVP | Feature | game-designer, systems-designer | L |
| 9 | Life Event Generator | MVP | Feature | game-designer, narrative-director | L |
| 10 | Event Presentation Layer | MVP | Presentation | ux-designer, ui-programmer | M |
| 11 | Relationship Tracker | Vertical Slice | Feature | game-designer, narrative-director | M |
| 12 | Epitaph / Life Summary Generator | Vertical Slice | Presentation | narrative-director, writer | S |
| 13 | Branching Tree Visualizer | Vertical Slice | Presentation | ux-designer, ui-programmer, technical-artist | L |
| 14 | Generational Inheritance System | Alpha | Feature | game-designer, systems-designer | M |
| 15 | Content Authoring Schema | Alpha | Foundation | tools-programmer | S |
| 16 | Tutorial / Onboarding | Full Vision | Polish | ux-designer, game-designer | S |
| 17 | Audio Manager | Full Vision | Polish | audio-director, sound-designer | M |

Effort: S = 1 session, M = 2-3 sessions, L = 4+ sessions

---

## Circular Dependencies

- **Choice & Consequence <-> Relationship Tracker**: Choices affect relationships,
  but relationship state also influences which choices and events are available.
  **Resolution**: Choice & Consequence System defines a generic "state query"
  interface. Relationship Tracker implements this interface for relationship-specific
  queries. Design Choice & Consequence first; Relationship Tracker extends it.
  No true cycle — just a shared contract.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| Character State Model | Design | Wrong data model breaks all 12 downstream systems. Must handle traits, flags, stats, relationships, and generational transfer. | Design first, prototype immediately, get it right before building anything else. |
| Choice & Consequence System | Technical + Design | Cascading effects across decades could become unmaintainable or produce nonsensical outcomes. | Use bounded propagation (max cascade depth), trait/flag system over full simulation, extensive testing with multi-life scenarios. |
| Life Event Generator | Design + Scope | Procedural + handcrafted hybrid is unproven. Events must feel authored, not random. Content volume (200+ events) is a solo-dev risk. | Prototype the generator early with 10-20 test events. Validate that procedural selection + parameterized templates produce satisfying variety. |
| Branching Tree Visualizer | Technical | Tree could become unreadable or slow with many branches. SVG/canvas performance at scale. | Progressive disclosure (zoom levels), lazy rendering, cap visible branch depth, prototype with synthetic large trees. |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 17 |
| Design docs started | 10 |
| Design docs reviewed | 10 |
| Design docs approved | 10 |
| MVP systems designed | 10 / 10 |
| Vertical Slice systems designed | 0 / 3 |

---

## Next Steps

- [ ] Design MVP-tier systems in order (use `/design-system [system-name]`)
- [ ] Start with **Character State Model** — the highest-priority bottleneck
- [ ] Run `/design-review` on each completed GDD
- [ ] Prototype the 3 high-risk systems early (`/prototype [system]`)
- [ ] Run `/gate-check pre-production` when all 10 MVP systems are designed
- [ ] Plan first implementation sprint with `/sprint-plan new`
