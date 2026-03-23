# Timeline Engine

> **Status**: Designed
> **Author**: User + game-designer, gameplay-programmer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Time Never Stops

## Overview

The Timeline Engine is the core runtime system that advances a character's life
from birth to death. It controls the passage of time at variable speeds defined
by Life Stage Definitions, triggers the Life Event Generator each year to produce
events, applies passive state drifts from the Character State Model formulas,
manages the visual timeline scroll, and handles the interaction between automated
time flow and player-initiated advances.

The player experiences the Timeline Engine as a scrolling visual timeline where
years pass and events appear. Time auto-advances at stage-defined speeds but the
player can tap/click to skip ahead to the next event during routine stretches.
The timeline stops for major events (player must choose) and during the death
sequence.

## Player Fantasy

Time flows like a river. You watch your life unfold — sometimes the years blur
past, sometimes a moment stops you cold with a choice that will define decades.
The player should feel the passage of time as a physical sensation: the scroll
moving, the years accumulating, small events flickering by like memories. When the
timeline stops for a major event, the sudden stillness should feel weighty — this
moment matters.

## Detailed Design

### Core Rules

#### Tick System

The Timeline Engine operates on a **year tick** cycle:

```
While character is alive:
  1. Advance currentAge by 1
  2. Check for life stage transition
  3. Apply passive state drifts (health aging, stress recovery, etc.)
  4. Query Life Event Generator for this year's events
  5. Queue events for presentation
  6. Process delayed effect queue (fire any effects scheduled for this age)
  7. Check death probability (if age >= DEATH_START_AGE)
  8. Wait for tick interval (determined by current stage's years_per_minute)
  9. If player taps to advance, skip remaining wait time
```

#### Timeline Visual Model

The timeline is a vertically scrolling view (newest at bottom, oldest at top):

```
┌─────────────────────────────────┐
│ Age 0  ● Born in [location]     │  ← Scrolled past (faded)
│ Age 1  ○ First steps            │
│ Age 2  ○ Started talking        │
│ Age 3  ● First day of preschool │  ← Minor event with icon
│ ...                             │
│ Age 12 ★ [MAJOR EVENT]          │  ← Timeline STOPS here
│        ┌──────────────────┐     │
│        │ Choice presented  │     │  ← Full-screen overlay
│        │ [Option A]        │     │
│        │ [Option B]        │     │
│        └──────────────────┘     │
│ Age 13 ... (waiting for choice) │  ← Timeline resumes after choice
└─────────────────────────────────┘
```

**Visual elements per year**:
- **Age marker**: Left-aligned number showing current age
- **Event dots**: Small circles for minor events, stars for major events
- **Event text**: Brief description for minor events (appears and scrolls past)
- **Stage dividers**: Visual separator when transitioning between life stages
- **Current year indicator**: Highlighted bar at the bottom showing "NOW"

#### Pacing Modes

| Mode | Behavior | Triggered By |
|------|----------|-------------|
| **Auto-scroll** | Years advance automatically at stage speed | Default mode during routine years |
| **Paused** | Timeline frozen, waiting for player input | Major event, choice, death sequence |
| **Skip-ahead** | Immediately jump to next event, skipping wait | Player tap/click during auto-scroll |
| **Suspended** | Timeline paused, no visual change | Browser tab hidden, dashboard open during pause |

**Rules**:
1. Auto-scroll is the default. The timeline moves without player input.
2. Skip-ahead does NOT skip events — it only skips the wait time between events.
   Every event is always shown.
3. Major events (type: "major") always trigger Paused mode. The player must
   interact before time resumes.
4. Minor events with choices (micro-choices) pause briefly (3 seconds) to allow
   interaction, then auto-resolve with a default if the player doesn't respond.
5. After a choice is made, a brief delay (1-2 seconds) shows the consequence
   narrative before auto-scroll resumes.

#### Year Tick Processing Pipeline

Each year tick processes in this exact order:

```
1. INCREMENT AGE
   - currentAge += 1
   - Update Character State Model

2. CHECK STAGE TRANSITION
   - If currentAge crosses a stage boundary:
     a. Fire stage transition animation
     b. Update visual theme (colors, typography)
     c. Update pacing speed
     d. Notify Audio Manager of stage change

3. APPLY PASSIVE DRIFTS (in order, see Character State Model Formulas)
   a. Health aging: -0.5/year if age > 40, accelerates after 60
   b. Stress natural recovery: -2/year
   c. Happiness hedonic adaptation: regress toward 30-70 band
   d. Relationship passive decay: -1/year for non-family relationships
      with no events this year (maintained relationships don't decay)
   e. Personality spectrum decay: -1/year for unreinforced spectrums
   f. Cross-attribute effects: stress→health (if stress>80),
      poverty→stress (if wealth<20), relationships→happiness (if rel>60)
   - Relationship passive decay (non-family, -1/year)
   - Personality spectrum decay (unreinforced, -1/year)
   - Cross-attribute effects (stress→health, poverty→stress, relationships→happiness)

4. PROCESS DELAYED EFFECTS
   - Check delayed effect queue for effects scheduled at currentAge
   - Apply each matching effect to Character State (via Choice & Consequence System)
   - Show narrative text for triggered delayed effects as "echo" events
   - **Processing order note**: Delayed effects modify state BEFORE event
     generation (step 5), so the Life Event Generator sees the post-delayed-effect
     character state. This is intentional — past consequences should influence
     which new events are eligible.

5. GENERATE EVENTS
   - Query Life Event Generator with current state, stage, and year
   - Receive list of events for this year (1-8, per stage density)
   - Sort by priority: major events first, then minor

6. PRESENT EVENTS
   - For each event in queue:
     a. If major: PAUSE timeline, present full event, wait for choice
     b. If minor with choice: brief pause (3s), present inline
     c. If minor observation: scroll past with text visible for 2-3 seconds

7. CHECK DEATH
   - If age >= DEATH_START_AGE: roll death probability
   - If death triggered: enter Death sequence
   - If Health = 0 (any age): trigger crisis death event

8. SAVE CHECKPOINT
   - Auto-save state every N years (configurable, default 5)
   - Always save after major events
```

### States and Transitions

| State | Description | Transitions To |
|-------|------------|----------------|
| **Initializing** | Loading character state, setting up first year | Running |
| **Running** | Auto-scroll active, years ticking | Paused (major event), Presenting (minor event), Death, Suspended |
| **Presenting** | Showing a minor event on the timeline | Running (after display duration) |
| **Paused** | Waiting for player input on major event/choice | Running (after choice made) |
| **Skipping** | Player requested skip-ahead, jumping to next event | Presenting, Paused, or Running |
| **Suspended** | Externally paused (tab hidden, etc.) | Running (tab visible again) |
| **Death** | Death sequence triggered | Terminal (hands off to Epitaph) |
| **Terminal** | Life is over | N/A |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Character State Model** | Reads + Writes | Reads currentAge, all attributes for drift calculation. Writes age increment, drift results. |
| **Life Stage Definitions** | Reads | Reads current stage config: years_per_minute, agency level, event density, visual theme. |
| **Life Event Generator** | Calls | `generateEvents(characterState, currentStage, currentAge) → LifeEvent[]` each year tick. |
| **Choice & Consequence System** | Calls | `applyChoice(characterState, choice) → CharacterState` when player makes a choice. Also `processDelayedEffects(characterState, currentAge) → CharacterState`. |
| **Event Presentation Layer** | Triggers | Sends events to be rendered in the appropriate format (timeline popup, card, visual novel scene). |
| **Save / State Persistence** | Writes | Triggers checkpoint saves at configured intervals and after major events. |
| **App Shell** | Contained by | Renders within the App Shell's MainView. Receives suspend/resume signals from App Shell. |
| **Audio Manager** | Signals | Notifies of stage transitions, event presentations, and death for audio cue management. |

## Formulas

### Tick Interval

```
tick_interval_ms = (60 / years_per_minute) * 1000
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| years_per_minute | float | 0.8-6.0 | Life Stage Definitions | Stage pacing speed |
| tick_interval_ms | int | 10000-75000 | Calculated | Milliseconds between year ticks |

**Expected output**: Infancy = 10,000ms (10s/year). Elder = 75,000ms (75s/year).

### Minor Event Display Duration

```
display_duration_ms = max(MIN_DISPLAY_MS, word_count * MS_PER_WORD)
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| MIN_DISPLAY_MS | int | 1500 | Tuning knob | Minimum time event is visible |
| word_count | int | 3-30 | Event text | Number of words in event text |
| MS_PER_WORD | int | 200 | Tuning knob | Reading speed assumption |

**Expected output**: "You scraped your knee" (5 words) = 1500ms (minimum).
"You and Marcus spent the afternoon building a fort in the backyard" (12 words) = 2400ms.

### Death Probability Per Year

(Defined in Character State Model — referenced here for completeness)

```
death_chance = BASE_DEATH_RATE * (1 + (age - DEATH_START_AGE) * DEATH_ACCELERATION) * health_modifier
```

Applied once per year tick when age >= DEATH_START_AGE.

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Multiple major events in same year | Queue them. Present one at a time, each pausing the timeline. | Two major crossroads in one year can happen (career change + marriage proposal). Both matter. |
| Player spams skip-ahead during a dense year | Skip advances to next event, not next year. All events in the current year are still shown. | Skipping means "get to the next thing," not "skip content." |
| Death occurs mid-event-queue | If a crisis event sets Health to 0, remaining queued events for that year are discarded. Death takes priority. Note: the step 7 death probability roll occurs AFTER all events are processed — mid-queue death only happens via crisis events that reduce Health to 0. | Probability-based death is end-of-year; crisis death is immediate. |
| Tab hidden for extended period | Timeline suspends immediately. No "catch-up" on resume — resumes from exactly where it paused. | Prevents the game from running ahead while the player is away. |
| Very fast year ticks (Infancy, 10s/year) | Events may overlap visually. Apply a minimum spacing of 500ms between event appearances. | Readability matters even at high speeds. |
| Zero events generated for a year | Show a "quiet year" marker on the timeline with no event text. Timeline continues normally. | Possible if the universal fallback pool is empty (shouldn't happen with proper content, but defensive). |
| Player opens dashboard during auto-scroll | Timeline continues scrolling in background (dimmed). Dashboard doesn't pause time for minor events. | Dashboard is a glance, not a pause button. Only major events pause time. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Character State Model | Reads + Writes | Age advancement, passive drifts | Hard |
| Life Stage Definitions | Reads | Pacing, stage transitions | Hard |
| Life Event Generator | Calls | Event production per year | Hard |
| Choice & Consequence System | Calls | Choice processing, delayed effects | Hard |
| Event Presentation Layer | Triggers | Event rendering | Hard |
| Save / State Persistence | Writes | Checkpoint saves | Soft |
| App Shell | Contained by | Viewport and suspend/resume | Hard |
| Audio Manager | Signals | Audio cues | Soft |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| MINOR_CHOICE_TIMEOUT_MS | 3000 | 1000-8000 | More time for micro-choices | Faster pacing, more missed micro-choices |
| CONSEQUENCE_DISPLAY_MS | 1500 | 800-3000 | Longer consequence reading time | Snappier transitions |
| MIN_EVENT_SPACING_MS | 500 | 200-1000 | More breathing room between events | Events can appear in rapid succession |
| CHECKPOINT_INTERVAL_YEARS | 5 | 1-10 | More frequent saves, more I/O | Less I/O, higher data loss risk |
| SKIP_AHEAD_COOLDOWN_MS | 200 | 50-500 | Prevents rapid-fire skipping | Allows faster skipping |
| DEATH_SEQUENCE_DURATION_MS | 3000 | 1500-5000 | More dramatic death transition | Quicker death |
| MS_PER_WORD | 200 | 100-400 | Slower assumed reading speed, longer displays | Faster, briefer displays |

## Acceptance Criteria

- [ ] Year ticks advance at correct intervals per life stage
- [ ] Stage transitions trigger at correct age boundaries with visual transition
- [ ] All passive drifts apply correctly each year tick (health, stress, happiness, relationships, personality)
- [ ] Delayed effects fire at the correct scheduled age
- [ ] Major events pause the timeline and wait for player input
- [ ] Minor events display for calculated duration based on text length
- [ ] Skip-ahead advances to next event without skipping events
- [ ] Timeline suspends when browser tab is hidden and resumes correctly
- [ ] Death probability rolls correctly when age >= DEATH_START_AGE
- [ ] Health = 0 triggers immediate death regardless of age
- [ ] Checkpoint saves fire every N years and after major events
- [ ] Multiple major events in one year are queued and presented sequentially
- [ ] No visual overlap between events at high-speed stages (Infancy)
- [ ] Complete life (birth to death at ~75) plays in 45-55 minutes baseline
- [ ] Timeline scroll performance: 60fps with up to 200 visible event entries
- [ ] Year tick processing completes within 5ms (state updates + event generation)

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should micro-choice timeouts auto-select a "default" option, or simply skip the choice? | Game Designer | During prototyping | Auto-default reveals consequence; skip means the moment passes without agency |
| Should there be a visual "heartbeat" or pulse effect on the current year to show time passing? | UX Designer | During UI implementation | Could enhance the feeling of life progressing |
| Should the timeline show future stage milestones as faded markers? | UX Designer | During playtesting | "You'll reach Adolescence in 3 years" — creates anticipation but may feel gamey |
| Performance with 80+ years of accumulated timeline entries — virtualize the scroll? | Gameplay Programmer | During implementation | Need to render only visible entries, not the full life history |
