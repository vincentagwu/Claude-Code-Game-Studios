# Life Stage Definitions

> **Status**: Designed
> **Author**: User + game-designer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Time Never Stops

## Overview

Life Stage Definitions is a pure data system that configures the 8 phases of a
human life in LifePath. It defines each stage's age range, timeline pacing speed,
player agency level, event density, visual/audio identity, and available event
categories. The player does not interact with this system directly — it is
infrastructure consumed by the Timeline Engine, Life Event Generator, Starting
Conditions Generator, and Audio Manager to determine how a life unfolds.

This system enforces the "Time Never Stops" pillar by structuring time as a
one-directional sequence of phases with distinct pacing. Early life accelerates
(infancy zips by), agency grows through adolescence and young adulthood, and
elder years slow to a contemplative pace. Each stage has a distinct visual and
audio identity, creating a cinematic chapter-based feel.

## Player Fantasy

The player should feel the passage of time the way humans remember it: childhood
is a blur of fragments, adolescence stretches with significance, and old age
feels precious and slow. The stage system creates the rhythm of a life — not a
uniform tick of years, but an emotional cadence where some periods feel fleeting
and others feel weighty. When the visual palette shifts from bright childhood
colors to muted elder tones, the player should feel time itself on their skin.

## Detailed Design

### Core Rules

#### Stage Configuration Table

Each life stage is defined by the following properties:

| Stage | Age Range | Duration (years) | Years/Minute | Agency Level | Minor Events/Year | Major Events (total) | Visual Theme | Audio Theme |
|-------|-----------|-------------------|-------------|-------------|-------------------|---------------------|--------------|-------------|
| Infancy | 0-2 | 3 | 6.0 | None | 1-2 | 0-1 | Warm pastels, soft focus, rounded shapes | Lullaby, gentle ambient, muffled sounds |
| Early Childhood | 3-5 | 3 | 4.0 | Minimal | 2-3 | 0-1 | Bright primary colors, large icons | Playful, simple melodies, xylophone tones |
| Childhood | 6-11 | 6 | 3.0 | Low | 3-4 | 1-2 | Saturated, playful, hand-drawn feel | Upbeat, adventurous, acoustic instruments |
| Adolescence | 12-17 | 6 | 1.5 | Medium | 4-5 | 2-3 | Bold contrasts, angular shapes, moody | Energetic, electric, emotional swings |
| Young Adult | 18-25 | 8 | 1.0 | Full | 4-6 | 3-4 | Clean modern tones, sharp typography | Contemporary, driving, aspirational |
| Adult | 26-45 | 20 | 1.5 | Full | 3-5 | 2-3 | Warm earth tones, grounded, stable | Mature, layered, subtle complexity |
| Midlife | 46-60 | 15 | 1.0 | Full | 3-5 | 2-3 | Muted palette, contemplative, deeper shadows | Reflective, minor keys, acoustic |
| Elder | 61-80+ | 15-20+ | 0.8 | Declining | 2-3 | 1-2 | Faded sepia/desaturated, nostalgic, soft edges | Slow, sparse, piano/strings, silence between notes |

**Rules**:

1. **Pacing calculation**: Each year tick occurs at the interval
   `60 / years_per_minute` seconds. At 6.0 years/min, a year passes every 10
   seconds. At 0.8 years/min, a year passes every 75 seconds.
2. **Pacing pauses**: When a major event or choice is triggered, the timeline
   **stops** regardless of pacing speed. The player has unlimited time to read
   and decide. Time only resumes after the choice is made.
3. **Event density**: Minor events per year is a range. The Life Event Generator
   rolls within this range each year, modified by the character's current state
   (active social life = more events; isolated character = fewer).
4. **Major event budget**: Each stage has a target number of major (deep narrative)
   events. This is a budget, not a guarantee — the Life Event Generator selects
   based on eligibility, but should aim for the target count.
5. **Agency level** determines what types of choices are available:
   - **None**: No player choices. Events are observed passively.
   - **Minimal**: Rare yes/no reactions (e.g., "cry or stay quiet")
   - **Low**: Simple choices with limited impact (e.g., "play with toys or read")
   - **Medium**: Meaningful choices with visible consequences (e.g., "stand up to
     bully or walk away")
   - **Full**: Full access to all choice categories (career, relationship, financial,
     moral, lifestyle)
   - **Declining**: Full access but some options removed (e.g., no career change
     after 70, physical options limited)
6. **Stage duration in real-time**:
   - Infancy: ~30 seconds
   - Early Childhood: ~45 seconds
   - Childhood: ~2 minutes
   - Adolescence: ~4 minutes
   - Young Adult: ~8 minutes
   - Adult: ~13 minutes
   - Midlife: ~15 minutes
   - Elder: ~19-25 minutes
   - **Total: ~62-68 minutes** (before pauses for choices)
   - With choice pauses (estimated 30-60 seconds per major choice, 5-10 seconds
     per minor choice): **~45-55 minutes** effective play time for a 75-year life
     (major events offset the fast early years).
7. **Fallback guarantee**: If no eligible events from unlocked categories exist for a given year, the Life Event Generator selects from a universal fallback pool of condition-free minor events. No year is ever event-free.

#### Event Categories by Stage

Each stage unlocks specific event categories. Events from locked categories
cannot fire, regardless of state eligibility.

| Stage | Unlocked Event Categories |
|-------|--------------------------|
| Infancy | Family dynamics, health milestones, temperament seeds |
| Early Childhood | Preschool, sibling rivalry, early fears, first friendships |
| Childhood | School, hobbies, friendships, family events, bullying, discovery |
| Adolescence | Identity, romance, rebellion, education choices, peer pressure, first job, self-discovery |
| Young Adult | Higher education, career start, independence, romance/partnership, travel, financial decisions |
| Adult | Career progression, marriage, parenthood, financial milestones, health events, crisis events |
| Midlife | Career plateau/change, relationship evolution, health concerns, existential events, empty nest |
| Elder | Retirement, health decline, grandchildren, legacy reflection, loss of peers, end-of-life choices |

#### Visual Identity Per Stage

Each stage defines a visual configuration consumed by the Event Presentation Layer
and App Shell:

| Property | Description |
|----------|-------------|
| colorPalette | Primary, secondary, accent, and background colors |
| typography | Font weight, size scaling, letter spacing adjustments |
| backgroundPattern | Subtle background texture or pattern (e.g., soft clouds for infancy, geometric for young adult) |
| iconStyle | Icon rendering style (rounded for youth, sharp for adult, soft for elder) |
| transitionEffect | How the visual shift between stages occurs (cross-fade over 2-3 seconds) |

#### Concrete Theme Tokens (consumed by Event Presentation Layer)

| Stage | Token Prefix | Primary Color | Background | Typography Weight |
|-------|-------------|--------------|------------|-------------------|
| Infancy | `THEME_INFANCY` | #F4C2C2 (soft pink) | #FFF8F0 (warm cream) | Light |
| Early Childhood | `THEME_EARLY_CHILD` | #FFD700 (bright yellow) | #FFFFF0 (light) | Regular |
| Childhood | `THEME_CHILDHOOD` | #4CAF50 (vibrant green) | #F0FFF0 (mint) | Regular |
| Adolescence | `THEME_ADOLESCENCE` | #FF5722 (bold orange) | #1A1A2E (dark) | Bold |
| Young Adult | `THEME_YOUNG_ADULT` | #2196F3 (clean blue) | #FAFAFA (white) | Medium |
| Adult | `THEME_ADULT` | #795548 (warm brown) | #F5F0EB (beige) | Regular |
| Midlife | `THEME_MIDLIFE` | #607D8B (muted slate) | #ECEFF1 (light gray) | Regular |
| Elder | `THEME_ELDER` | #9E9E9E (faded gray) | #FFF3E0 (sepia tint) | Light |

These tokens are exported as CSS variables and consumed by the Event Presentation Layer's ThemeProvider. Colors are starting points — adjust during visual design phase.

### States and Transitions

Stages are a strict linear sequence. No stage can be skipped or repeated.

| Current Stage | Trigger | Next Stage | Transition |
|--------------|---------|------------|------------|
| Infancy | age >= 3 | Early Childhood | Cross-fade + interstitial card |
| Early Childhood | age >= 6 | Childhood | Cross-fade + interstitial card |
| Childhood | age >= 12 | Adolescence | Cross-fade + interstitial card |
| Adolescence | age >= 18 | Young Adult | Cross-fade + interstitial card |
| Young Adult | age >= 26 | Adult | Cross-fade + interstitial card |
| Adult | age >= 46 | Midlife | Cross-fade + interstitial card |
| Midlife | age >= 61 | Elder | Cross-fade + interstitial card |
| Elder | death triggered | Death | Fade to black |

**Transition interstitial**: A brief (2-3 second) card appears between stages
showing the stage name and age range. Format: `"Childhood → Adolescence"` with
the character's current age. This is the only hard break in the timeline flow.

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Timeline Engine** | Reads this | Reads years_per_minute for current stage to set tick speed. Reads agency level to configure choice availability. Triggers stage transitions at age thresholds. |
| **Life Event Generator** | Reads this | Reads event density range (minor_events_per_year, major_event_budget) and unlocked event categories for the current stage. |
| **Starting Conditions Generator** | Reads this | Reads Infancy stage definition to set up the initial state (what events are possible at birth). |
| **Audio Manager** | Reads this | Reads audio_theme for current stage to select ambient soundtrack. Transitions music on stage change. |
| **Event Presentation Layer** | Reads this | Reads visual identity config (colorPalette, typography, iconStyle) to render the UI for the current stage. |
| **Character State Model** | No direct interaction | Stage definitions reference the life phases defined in the Character State Model, but there is no runtime data flow. The stages ARE the phases — this system provides their detailed configuration. |

## Formulas

### Real-Time Duration Per Stage

```
stage_real_time_seconds = (stage_duration_years / years_per_minute) * 60
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| stage_duration_years | int | 3-20 | Stage config | Number of years in this stage |
| years_per_minute | float | 0.8-6.0 | Stage config | Pacing speed for this stage |
| stage_real_time_seconds | float | 30-1500 | Calculated | Wall-clock time for this stage |

**Expected output**: Infancy = 30s, Childhood = 120s, Adult = 800s, Elder = 1125-1500s.

### Effective Play Time

```
effective_time = sum(stage_real_time) + (total_major_choices * AVG_MAJOR_PAUSE)
                 + (total_minor_choices * AVG_MINOR_PAUSE)
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| total_major_choices | int | 12-20 | Sum of major events across stages | Total deep narrative choices in a life |
| AVG_MAJOR_PAUSE | int | 45 seconds | Tuning knob | Average time player spends on a major choice |
| total_minor_choices | int | 20-40 | Estimated from minor event choice rate | Minor choices that pause the timeline |
| AVG_MINOR_PAUSE | int | 8 seconds | Tuning knob | Average time player spends on a minor choice |

**Expected output**: ~62 minutes base + ~15 minutes pauses = **~45-55 minutes**
(some minor events don't pause the timeline — they're observation-only).

### Event Density Roll

```
actual_minor_events = random_int(min_events, max_events) + state_modifier
state_modifier = floor((relationships_attribute - 50) / 25)  // social people get more events
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| min_events | int | 1-4 | Stage config | Minimum minor events for this stage |
| max_events | int | 2-6 | Stage config | Maximum minor events for this stage |
| relationships_attribute | int | 0-100 | Character State | Current social connectedness |
| state_modifier | int | -2 to +2 | Calculated | More social = more events |

**Edge case**: Clamp actual_minor_events to minimum 1 (no year is truly empty)
and maximum 8 (prevent event spam in highly social elder years).

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Death before stage transition (e.g., childhood death) | Current stage ends immediately. No transition to next stage. Epitaph generates from whatever stage was active. | "Life is Unfair" — some lives are short. The system must handle death at any stage. |
| Extremely long life (95+) | Elder stage has no upper age bound. It continues at 0.8 years/min until death. Event density remains at 2-3/year. | No "post-elder" stage. Very old age is just more of the same stage with increasing death probability. |
| Player takes very long on choices | Timeline is paused indefinitely during choices. Total play time can exceed 90+ minutes if player deliberates. | This is acceptable — rushing players would undermine the "Every Choice Echoes" pillar. No timer on choices. |
| Player makes very fast choices | Total play time can drop below 30 minutes. Minimum bound is the raw stage durations (~28 minutes for a 75-year life with zero pauses). | Acceptable for replays. Players who already know the content may speed-run. |
| Stage transition coincides with a major event | Major event completes first, then stage transition fires. Never interrupt a narrative moment with a stage change. | Narrative moments are sacred — they take priority over structural transitions. |
| Stage transition coincides with age threshold event | Event eligibility is evaluated in the NEW stage's context. The transition fires first (visual/audio shift), then events for the new stage are generated. | Ensures events at threshold ages (e.g., turning 18) are contextually appropriate for the stage being entered. |
| Multiple minor events in same year | Events are queued and presented sequentially within the year's time window. If the year is too short to show all events, lower-priority events are condensed to brief text. | Prevents event pile-up in dense stages while ensuring no events are silently dropped. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Timeline Engine | This is read by | Provides pacing speed and stage transition triggers | Hard |
| Life Event Generator | This is read by | Provides event density and category unlocks | Hard |
| Starting Conditions Generator | This is read by | Provides initial stage configuration | Soft |
| Audio Manager | This is read by | Provides audio theme per stage | Soft |
| Event Presentation Layer | This is read by | Provides visual identity per stage | Soft |
| Character State Model | Related | Stage definitions align with Character State Model's life phases | Soft (structural alignment, not runtime dependency) |

**This system has NO upstream dependencies.** It is pure configuration data,
defined at design time and loaded at game start.

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| INFANCY_YEARS_PER_MIN | 6.0 | 3.0-10.0 | Infancy passes faster (barely noticed) | Infancy lingers (could feel boring) |
| CHILDHOOD_YEARS_PER_MIN | 3.0 | 1.5-5.0 | Childhood flies by | Childhood stretches (more bonding time) |
| ADOLESCENCE_YEARS_PER_MIN | 1.5 | 0.8-3.0 | Teen years feel rushed | Teen years feel drawn out |
| YOUNG_ADULT_YEARS_PER_MIN | 1.0 | 0.5-2.0 | Young adult years are brisk | Young adult years are slow and weighty |
| ADULT_YEARS_PER_MIN | 1.5 | 0.8-3.0 | Adult years accelerate (routine) | Adult years feel deliberate |
| MIDLIFE_YEARS_PER_MIN | 1.0 | 0.5-2.0 | Midlife breezes by | Midlife lingers |
| ELDER_YEARS_PER_MIN | 0.8 | 0.3-1.5 | Old age passes faster | Old age is very slow (contemplative) |
| TRANSITION_DURATION_SEC | 2.5 | 1.0-5.0 | Longer pause between stages | Quicker transitions |
| AVG_MAJOR_PAUSE | 45s | 20-90 | Longer play sessions | Shorter sessions |
| AVG_MINOR_PAUSE | 8s | 3-15 | Longer play sessions | Shorter sessions |
| MIN_EVENTS_PER_YEAR | varies by stage | 0-3 | More content per year | Quieter years |
| MAX_EVENTS_PER_YEAR | varies by stage | 3-8 | More event density | Calmer experience |

**Interaction warning**: Changing years_per_minute values changes the total
session length. The current values target ~45-55 minutes per life. If all stages
are slowed, sessions could exceed 90 minutes, which risks player fatigue.

## Visual/Audio Requirements

| Event | Visual Feedback | Audio Feedback | Priority |
|-------|----------------|---------------|----------|
| Stage transition | 2.5s cross-fade between visual themes + interstitial card showing stage name and age | Music cross-fade to new stage theme (3s fade-out, 1s silence, 3s fade-in) | High |
| Year tick | Subtle age counter increment animation | Quiet tick sound (optional, toggleable) | Low |
| Approaching stage boundary | Visual palette begins shifting 1-2 years before transition (gradual CSS variable interpolation between current and next stage tokens). This is a rendering rule applied by Event Presentation Layer — no Timeline Engine state change occurs. | Music begins introducing elements of next theme | Medium |

## Acceptance Criteria

- [ ] All 8 stages are defined with complete configuration (age range, pacing, agency, event density, visual, audio)
- [ ] Timeline Engine correctly reads years_per_minute and adjusts tick speed per stage
- [ ] Stage transitions fire at correct age thresholds
- [ ] Transition interstitial displays correct stage names and age
- [ ] Visual theme changes apply on stage transition (color palette, typography, etc.)
- [ ] Agency level correctly gates available choice types per stage
- [ ] Event density rolls produce values within configured ranges
- [ ] Social modifier correctly adjusts event density based on Relationships attribute
- [ ] No year produces zero events (minimum 1 minor event always)
- [ ] Major events are never interrupted by stage transitions
- [ ] Death at any stage produces correct behavior (no crash, epitaph generates)
- [ ] Elder stage handles ages 61-100+ without upper bound issues
- [ ] Full life (birth to death at ~75) completes in 45-55 minutes baseline
- [ ] All pacing values are externalized in config, not hardcoded
- [ ] Cross-fade transitions complete within configured duration

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should the player be able to adjust pacing speed globally? (e.g., 1x/2x/3x) | UX Designer | During App Shell design | Useful for replays but might undermine intended emotional pacing |
| Should Elder stage have sub-phases (60s, 70s, 80s) with different event pools? | Game Designer | During Life Event Generator design | Current design treats 61-80+ as one phase, but the 60s and 80s feel very different in real life |
| Optimal transition interstitial duration — 2.5s might feel slow on replay | UX Designer | During playtesting | Consider making interstitials skippable after first playthrough |
