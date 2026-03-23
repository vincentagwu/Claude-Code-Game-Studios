# Life Event Generator

> **Status**: Designed
> **Author**: User + game-designer, systems-designer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: All pillars

## Overview

The Life Event Generator is the content engine that determines what happens in
each year of a character's life. Called by the Timeline Engine each year tick, it
queries the Character State Model, checks the current life stage's event categories
and density, searches the Event Content Database for eligible events, applies
selection weights and freshness scores, and returns a curated list of events for
the year. It is the bridge between static content (event database) and dynamic
gameplay (the unique life).

The generator follows a **query-filter-weight-select** pipeline: start with all
events, filter by eligibility (stage, age, conditions), weight by relevance and
freshness, then select the year's events. This produces contextually appropriate,
varied, non-repetitive content from the same event pool across multiple lives.

## Player Fantasy

Every year should feel like it belongs to THIS life — not random, not scripted,
but organically shaped by who you are and what you've done. The generator is
invisible, but its quality determines whether the player says "of course that
happened to me" (good) or "why did I get that random event?" (bad). Events should
feel like natural consequences of your circumstances, personality, and choices.

## Detailed Design

### Core Rules

#### Generation Pipeline (Per Year Tick)

```
Input: CharacterState, currentStage, currentAge, eventHistory[], delayedEffectQueue
Output: LifeEvent[] (1-8 events for this year)

1. DETERMINE EVENT BUDGET
   - Read minor event density from Life Stage Definitions (e.g., 3-5 for Adult)
   - Roll actual count within range, modified by social state
   - Read major event budget for this stage
   - Check if a major event is "due" (stage budget not yet met)

2. QUERY ELIGIBLE EVENTS
   - Filter Event Content Database by:
     a. Stage: event.stages includes currentStage
     b. Age: event.minAge <= currentAge <= event.maxAge
     c. Category: event.category is unlocked for this stage
     d. Conditions: all event.conditions pass against CharacterState
     e. Prerequisites: all event.prerequisites are in eventHistory
     f. Exclusions: no event.exclusions are in eventHistory
     g. Occurrences: event has not reached maxOccurrences in eventHistory
   - Separate into minor_candidates and major_candidates

3. APPLY WEIGHTS
   - For each candidate:
     a. Base weight: event.weight (from database)
     b. Freshness modifier: reduce weight for recently-fired events
     c. Relevance modifier: boost weight for events matching dominant
        personality spectrums or current life circumstances
     d. Rarity modifier: rare events have low base weight (intentional)
     e. effective_weight = base * freshness * relevance * rarity_factor

4. SELECT MAJOR EVENT (if budget allows)
   - If this stage's major event target is not yet met:
     a. Weighted random selection from major_candidates
     b. If no major candidates eligible, skip (no forced major events)
   - Major events fire at most 1 per year (never 2+ in same year)

5. SELECT MINOR EVENTS
   - Weighted random selection without replacement from minor_candidates
   - Select up to the rolled minor event count
   - If fewer candidates than budget, select all available
   - If zero candidates, select from universal fallback pool

6. INSTANTIATE TEMPLATES
   - For each selected minor event that uses templates:
     a. Resolve variable slots (pool selection, state queries, relationship references)
     b. Generate final event text
   - Major events use their authored content as-is

7. ORDER EVENTS
   - Sort: major events first, then minors by weight (most relevant first)
   - Return ordered event list to Timeline Engine
```

#### Relevance Scoring

Events that match the character's current life feel more "right." Relevance
scoring boosts contextually appropriate events:

```typescript
function calculateRelevance(event: LifeEvent, state: CharacterState): number {
  let score = 1.0;

  // Boost events matching dominant personality
  for (const spectrum of event.relevantSpectrums || []) {
    const value = state.spectrums[spectrum.name];
    if (Math.sign(value) === Math.sign(spectrum.direction)) {
      score += 0.3 * (Math.abs(value) / 100); // Max +0.3 per spectrum
    }
  }

  // Boost events matching life circumstances
  for (const tag of event.relevantTags || []) {
    if (state.tags.has(tag)) {
      score += 0.2; // Having a relevant tag boosts this event
    }
  }

  // Boost events matching attribute ranges
  for (const attr of event.relevantAttributes || []) {
    const value = state.attributes[attr.name];
    if (attr.range[0] <= value && value <= attr.range[1]) {
      score += 0.2;
    }
  }

  return Math.min(score, 2.5); // Cap total relevance boost
}
```

#### Major Event Pacing

Major events should feel earned, not forced. The pacing system ensures:

1. **Minimum gap**: At least 1 year between major events (no back-to-back crossroads)
2. **Stage budget**: Each stage has a target major event count (from Life Stage
   Definitions). The generator tracks how many have fired and increases selection
   probability as the stage nears its end if the budget isn't met.
3. **Guaranteed milestones**: Some events are "milestone" events that fire at
   specific ages if eligible (e.g., "turning 18" event, "first day of school").
   These have weight 100 and bypass normal selection when their age arrives.
   **Milestone schema**: Milestone events use the standard LifeEvent schema with
   `isMilestone: true` (field defined in Event Content Database) and fire at
   `minAge` with effective weight 100, bypassing normal weighted selection.
4. **No forced events**: If no major events are eligible (extremely rare), the
   stage budget is simply unmet. Empty life stages are acceptable for unusual
   characters (e.g., a sheltered character with few choices has fewer major events).

#### Event Category Mixing

Each year should have variety — not 5 school events in a row. The generator
enforces category diversity:

```
For each year's minor events:
  - No more than 2 events from the same category
  - At least 2 different categories represented (if 3+ events)
  - After selecting an event, temporarily reduce weight for same-category events

Category selection pseudocode:
  category_counts = {}
  for each event to select:
    candidates = eligible.filter(e => category_counts[e.category] < 2)
    if candidates.empty: candidates = eligible  // fallback if all at cap
    for e in candidates where category_counts[e.category] > 0:
      e.effective_weight *= CATEGORY_PENALTY (0.5)
    selected = weighted_random(candidates)
    category_counts[selected.category] += 1
    remove selected from eligible
  Category penalty resets each year (not carried forward).
```

### States and Transitions

The Life Event Generator is stateless per call — it queries, computes, and returns.
All tracking state (event history, major event counts per stage) is stored in the
Character State Model's save data.

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Timeline Engine** | Called by | `generateEvents(state, stage, age) → LifeEvent[]` each year tick |
| **Character State Model** | Reads | Queries all state layers for condition evaluation and relevance scoring |
| **Life Stage Definitions** | Reads | Reads event density, category unlocks, major event budgets |
| **Event Content Database** | Reads | Queries the full event pool, filters by eligibility |
| **Choice & Consequence System** | Uses | Calls evaluateConditions() for eligibility checks |
| **Event Presentation Layer** | Outputs to (via Timeline Engine) | Generated events are passed to presentation for rendering |

## Formulas

### Effective Weight Calculation

```
effective_weight = base_weight * freshness * relevance * category_penalty
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| base_weight | int | 1-100 | Event database | Author-defined selection weight |
| freshness | float | 0.5-1.0 | Calculated | Penalty for recently fired events |
| relevance | float | 1.0-2.5 | Calculated | Boost for contextually fitting events |
| category_penalty | float | 0.5-1.0 | Calculated | Penalty for same-category saturation |

**Freshness source**: Uses the Content Freshness Score formula defined in Event
Content Database: `freshness = 1.0 - (times_fired / maxOccurrences) * REPETITION_PENALTY`.
Events with `times_fired >= maxOccurrences` are filtered from the eligible pool
BEFORE weight calculation — they never enter the normalization.

### Minor Event Count Roll

```
count = random(stage.minEvents, stage.maxEvents) + social_modifier
social_modifier = floor((relationships_attribute - 50) / 25)
count = clamp(count, 1, 8)
```

### Major Event Probability Boost (Near Stage End)

```
urgency = 1.0 + (URGENCY_SCALE * (1 - remaining_budget / stage_budget) * stage_progress)
stage_progress = (currentAge - stage.startAge) / (stage.endAge - stage.startAge)
boosted_weight = major_event_weight * urgency
```

As the stage nears its end with unmet budget, major events become more likely.

**Activation condition**: Urgency boost applies ONLY when `remaining_budget > 0`
(major event target not yet met for this stage) AND `MAJOR_MIN_GAP_YEARS` constraint
is satisfied. If the gap constraint blocks the major event, urgency has no effect.
When `remaining_budget == 0`, urgency factor is 1.0 (no boost).

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Zero eligible events for this year | Select from universal fallback pool (always eligible, generic events). At least 1 event per year. | No empty years — Life Stage Definitions guarantees minimum density. |
| Zero eligible major events for entire stage | Stage completes without major events. This is valid for unusual characters (e.g., highly sheltered life). | Major events are targets, not guarantees. Forcing them breaks organic feel. |
| All minor candidates are from same category | Select up to 2 from that category, fill remainder from fallback pool. | Category diversity rule prevents monotonous years. |
| Template variable references deleted relationship | Fall back to generic text ("a classmate" instead of "{friend_name}"). | Graceful degradation per Event Content Database edge cases. |
| Very high relevance score on many events | Cap effective_weight contribution from relevance at 2.5x. | Prevents one personality type from completely dominating event selection. |
| Event marked as milestone fires same year as another major | Milestone event takes priority. Other major event is deferred to next year or dropped if no longer eligible. | Milestone events (turning 18, first day of school) are structurally important. |
| Player in "unlikely" state (age 30, Education 10, no career tags) | Events for undereducated, career-struggling characters are available. The content pool must cover edge-case life paths. | The game should handle unusual lives gracefully, not assume everyone follows a "normal" path. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Character State Model | Reads | Full state query for eligibility and relevance | Hard |
| Life Stage Definitions | Reads | Event density, categories, budgets | Hard |
| Event Content Database | Reads | Event pool and schemas | Hard |
| Timeline Engine | Called by | Year tick trigger | Hard |
| Choice & Consequence System | Uses | Condition evaluation interface | Hard |
| Event Presentation Layer | Outputs to | Generated events for rendering | Soft |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| RELEVANCE_SPECTRUM_BOOST | 0.3 | 0.1-0.5 | Personality more strongly influences events | More random event selection |
| RELEVANCE_TAG_BOOST | 0.2 | 0.1-0.4 | Past events more strongly influence future | More independent event selection |
| RELEVANCE_CAP | 2.5 | 1.5-4.0 | Higher cap allows stronger relevance effects | More uniform selection probability |
| CATEGORY_PENALTY | 0.5 | 0.3-0.8 | Stronger category diversity enforcement | Less diversity, more thematic clustering |
| MAJOR_MIN_GAP_YEARS | 1 | 0-3 | More breathing room between major events | Major events can stack closer together |
| URGENCY_SCALE | 0.5 | 0.1-1.0 | Harder push to meet major event budget near stage end | More relaxed about unmet budgets |
| FALLBACK_POOL_SIZE | 20 | 10-50 | More variety in fallback events | Fewer fallback options |

## Acceptance Criteria

- [ ] Generator produces 1-8 events per year within stage-defined density
- [ ] All returned events pass eligibility checks (stage, age, conditions, prerequisites, exclusions)
- [ ] Freshness scoring reduces weight for recently-fired events
- [ ] Relevance scoring boosts contextually appropriate events
- [ ] Category diversity: no more than 2 events from same category per year
- [ ] Major events respect minimum 1-year gap between occurrences
- [ ] Milestone events fire at their designated age when eligible
- [ ] Template variables resolve correctly with fallback for missing references
- [ ] Universal fallback pool prevents empty years
- [ ] Major event budget tracking works correctly per stage
- [ ] Urgency boost increases major event probability near stage end
- [ ] Event generation completes within 3ms per year tick
- [ ] No event fires more than its maxOccurrences per life
- [ ] Over 100 generated lives, event variety metrics show <5% exact duplicate year content

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should the generator "learn" across lives? (reduce weight for events seen in previous lives) | Game Designer | Post-MVP | Cross-life freshness would improve replay variety but adds complexity |
| Should rare events have a pity timer? (guaranteed after N lives without one) | Systems Designer | After playtesting | Pity timers improve discovery but may feel artificial |
| How to handle content gaps? (no events for a specific state combo) | Content author | During content authoring | Need a content coverage audit tool |
