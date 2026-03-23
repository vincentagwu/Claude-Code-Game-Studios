# Character State Model

> **Status**: In Design
> **Author**: User + game-designer, systems-designer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Every Choice Echoes, Life is Unfair

## Overview

The Character State Model is the central data structure representing a human life
at any point in time. It stores identity (name, age, location), personality traits
shaped by choices, life flags tracking key events, numeric attributes (wealth,
health, education, social standing), and relationships with other people. Every
system in LifePath reads from or writes to this model — the Timeline Engine
advances it, the Choice & Consequence System modifies it, the Life Event Generator
queries it, and the Epitaph Generator summarizes it at death.

The player perceives their state through two channels: a **life summary dashboard**
showing broad categories as qualitative visual indicators (icons, color-coded bars,
descriptive labels like "Comfortable" or "Struggling" — never raw numbers), and
**narrative integration** where story text at key moments explicitly references
the character's current state ("Your years of hard study pay off as the acceptance
letter arrives" or "The distance between you and your father has become a canyon").
Under the hood, all state is numeric for precise game logic, but the player's
experience is always narrative-first.

## Player Fantasy

The Character State Model is invisible infrastructure — players never interact
with it directly. But it serves the game's deepest emotional promise: **your life
is uniquely yours**. Every choice you've made, every relationship you've built,
every advantage or hardship you started with — it's all encoded here, and the
game remembers.

The fantasy this system enables is continuity and consequence. When a narrative
moment references something you did 20 years ago in game-time, when your dashboard
shifts from "Thriving" to "Struggling" after a bad decision, when your child
inherits your traits in the next generation — that's this system working. The
player should feel that the game *knows* who they are and responds accordingly.
No two lives should feel the same, and the Character State Model is why.

## Detailed Design

### Core Rules

The Character State Model is a structured data object with 6 layers. All values
are numeric internally; the player sees qualitative labels and narrative text.

#### Layer 1: Identity (mostly fixed)

Set at birth by the Starting Conditions Generator. Rarely changes during a life.

| Field | Type | Set At | Mutable? | Notes |
|-------|------|--------|----------|-------|
| name | string | Birth | No | Generated from cultural/regional name pools |
| gender | enum (male/female/nonbinary) | Birth | Rare | Can change via transition life event |
| birthYear | number | Birth | No | Determines historical context |
| currentAge | number | Birth | Yes | Incremented by Timeline Engine every year tick |
| location | string | Birth | Yes | Changes via moving/migration events |
| familyBackground | object | Birth | No | Parents' traits, class, location, personality spectrums — the "hand you were dealt." Includes parentTraits[] for Generational Inheritance queries. |
| socioeconomicClass | enum | Birth | Yes | lower / working / middle / upper — reclassifies based on Wealth attribute thresholds |

**Rules**:
1. Identity fields are set once by the Starting Conditions Generator and frozen,
   except where explicitly noted as mutable.
2. `currentAge` is the only field that changes every tick (advanced by Timeline Engine).
3. `location` and `socioeconomicClass` change only via specific life events or
   attribute threshold crossings, never passively.
4. `familyBackground` is immutable and carries forward to the Generational
   Inheritance System as the child's "parents' history."

#### Layer 2: Personality Spectrums (6 axes)

Each axis ranges from **-100 to +100**. All start near neutral at birth. The
Starting Conditions Generator may apply parent-trait seeds of ±15 before the
first year tick, representing inherited temperament. Player choices then push
values along the spectrum from this starting point. The further from 0, the
more "defined" the personality — events can reference this.

| Spectrum | -100 Pole | +100 Pole | Narrative Role |
|----------|----------|----------|----------------|
| Courage | Cautious | Brave | Risk-taking vs. safety-seeking behavior |
| Generosity | Selfish | Generous | Resource sharing, relationship dynamics |
| Sociability | Introverted | Social | Social event eligibility, relationship formation rate |
| Ambition | Content | Ambitious | Career/education drive, stress generation |
| Empathy | Detached | Empathetic | Relationship depth, moral choice weighting |
| Conformity | Rebellious | Conformist | Rule-following, authority interactions, career paths |

**Rules**:
1. Choices apply a **delta** to one or more spectrums (e.g., `courage: +15`).
2. Deltas are clamped: the result never exceeds -100 or +100.
3. Spectrums have **inertia**: as the absolute value increases, deltas in the
   opposite direction are reduced by 20%. A deeply brave character (courage: 80)
   is harder to shift toward cautious. This prevents personality whiplash.
4. Spectrums passively decay toward 0 by **1 point per year** if no choices
   reinforce them. Personality requires maintenance — unused traits fade.
5. Personality spectrums are **never displayed as numbers** to the player. The
   dashboard shows qualitative labels: "Brave" (60+), "Somewhat brave" (30-59),
   "Neutral" (-29 to 29), "Somewhat cautious" (-30 to -59), "Cautious" (-60 or less).

#### Layer 3: Life Attributes (7 attributes)

Each ranges from **0 to 100**. Starting values are set by the Starting Conditions
Generator based on familyBackground and socioeconomicClass.

| Attribute | Range | What It Tracks | Dashboard Display Buckets |
|-----------|-------|---------------|--------------------------|
| Health | 0-100 | Physical and mental wellbeing | Thriving (80+), Healthy (60-79), Fair (40-59), Struggling (20-39), Critical (0-19) |
| Wealth | 0-100 | Financial status and security | Wealthy (80+), Comfortable (60-79), Getting By (40-59), Tight (20-39), Poverty (0-19) |
| Education | 0-100 | Knowledge, skills, learning | Scholar (80+), Educated (60-79), Average (40-59), Undereducated (20-39), Uneducated (0-19) |
| Career | 0-100 | Professional standing and fulfillment | Accomplished (80+), Established (60-79), Developing (40-59), Entry-level (20-39), Unemployed (0-19) |
| Relationships | 0-100 | Overall social connectedness | Beloved (80+), Connected (60-79), Some Friends (40-59), Lonely (20-39), Isolated (0-19) |
| Happiness | 0-100 | Subjective life satisfaction | Joyful (80+), Content (60-79), Okay (40-59), Unhappy (20-39), Miserable (0-19) |
| Stress | 0-100 | Pressure level (high = bad) | Serene (0-19), Calm (20-39), Manageable (40-59), Overwhelmed (60-79), Breaking Point (80+) |

**Rules**:
1. Attributes are modified by life events and choices via absolute deltas
   (e.g., `wealth: -15`) or percentage modifiers (e.g., `health: *0.9`).
2. Values are clamped to 0-100 after every modification.
3. Some attributes have **passive drift** per year tick:
   - Health: -0.5/year after age 40 (aging), accelerates to -1/year after 60
   - Stress: -2/year natural recovery (stress fades if nothing adds to it)
   - Happiness: drifts toward 50 at -1/year if above 70 or +1/year if below 30
     (hedonic adaptation — extreme happiness/sadness regresses to mean over time)
4. Attribute interactions (cross-effects):
   - Stress > 80 causes Health to drift -1/year additionally
   - Wealth < 20 causes Stress to drift +2/year additionally
   - Relationships > 60 gives Happiness +1/year passive bonus
5. `socioeconomicClass` reclassifies when Wealth crosses thresholds:
   upper (80+), middle (50-79), working (25-49), lower (0-24).

#### Layer 4: Life Tags (accumulated set)

Tags are string identifiers earned from key life events. Once earned, **never
removed** — your past is permanent. Tags serve as event eligibility gates and
narrative hooks.

**Rules**:
1. Tags are added by the Choice & Consequence System when specific events occur.
2. Tags are never removed or modified. The set only grows.
3. Tags are categorized for query efficiency:
   - `education`: "college_graduate", "dropout", "phd", "self_taught"
   - `family`: "parent", "orphan", "divorced", "married", "widowed"
   - `career`: "entrepreneur", "fired", "promoted", "retired"
   - `life_event`: "survived_illness", "world_traveler", "criminal_record",
     "recovered_addict", "veteran", "immigrant"
4. The Life Event Generator queries tags to determine event eligibility. E.g.,
   the "reunion with estranged parent" event requires tag "orphan" or a family
   relationship with status "estranged."
5. Tags are displayable: the player can see their accumulated tags as a "Life
   Story" list on the dashboard (a narrative record, not a game stat).

#### Layer 5: Relationships (dynamic list)

Each person in the character's life is a relationship entry. Relationships are
created, modified, and ended by life events.

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| id | string | — | Unique identifier |
| name | string | — | Display name |
| type | enum | — | family / friend / romantic / professional / rival |
| closeness | number | 0-100 | Relationship strength. 0 = stranger, 100 = inseparable |
| status | enum | — | active / estranged / deceased |
| traits | string[] | — | Descriptors: "supportive", "demanding", "funny", "toxic" |
| metAge | number | — | Age when the character met this person |
| history | string[] | — | Key event IDs involving this person |

**Rules**:
1. Family relationships are created at birth (parents, siblings) by the
   Starting Conditions Generator.
2. Other relationships are created by life events (meeting a friend at school,
   a romantic interest at work, etc.).
3. Closeness is modified by choices and events. Passive drift: -1/year for
   non-family relationships if no events involving that relationship occurred
   during the year (maintained friendships don't decay; only neglected ones fade).
4. A relationship transitions to "estranged" if closeness drops below 10. It
   can be restored by a reconciliation event.
5. A relationship transitions to "deceased" when the person dies (age-based
   probability for family members, event-triggered for others).
6. Maximum active relationships: **20**. Beyond this, the least-close
   non-family relationship is archived (still visible in history, but no longer
   generates events). This prevents relationship bloat.
7. The Relationships attribute (Layer 3) is a **derived value**: the average
   closeness of all active relationships, normalized to 0-100.

#### Layer 6: Flags (boolean gates)

Fast-access boolean values derived from other layers. Flags exist for
performance — they're queries the Life Event Generator makes frequently.

| Flag | Derived From | Used By |
|------|-------------|---------|
| isEmployed | Career > 20 AND no "fired"/"retired" tag | Career events, Wealth drift |
| isMarried | Tag "married" AND no subsequent "divorced"/"widowed" | Family events, Stress/Happiness modifiers |
| hasChildren | Tag "parent" | Generational Inheritance eligibility |
| hasDebt | Wealth < 30 AND tag "debt" | Financial events, Stress modifier |
| ownsHome | Wealth > 50 AND tag "homeowner" | Stability events, Wealth modifier |
| hasCriminalRecord | Tag "criminal_record" | Career eligibility gates |
| isRetired | Tag "retired" | Career events cease, free time events unlock |

**Rules**:
1. Flags are **recomputed** after every state change, not stored independently.
   They are views, not data.
2. New flags can be added by defining a derivation rule. No flag exists without
   a clear derivation from Layers 1-5.

### States and Transitions

The Character State Model itself does not have gameplay states — it IS the state.
However, it tracks the character's **life phase**, which determines what systems
and events are active:

| Life Phase | Age Range | Agency Level | Available Systems |
|------------|-----------|-------------|-------------------|
| Infancy | 0-2 | None | Observation only, family events |
| Early Childhood | 3-5 | Minimal | Rare micro-choices, personality seeds |
| Childhood | 6-11 | Low | School events, friendship formation, minor choices |
| Adolescence | 12-17 | Medium | Identity choices, education path, rebellion/conformity |
| Young Adult | 18-25 | Full | Career, education, romance, independence, major life choices |
| Adult | 26-45 | Full | Career progression, family, financial, peak agency |
| Midlife | 46-60 | Full | Career plateau, health concerns, relationship evolution |
| Elder | 61-80+ | Declining | Health decline, retirement, reflection, legacy choices |
| Death | Variable | None | Triggers Epitaph Generator, tree finalization |

**Transition rules**:
1. Phase transitions are triggered by `currentAge` crossing the threshold.
2. Death is triggered probabilistically: base chance starts at age 65 and
   increases each year, modified by Health attribute. Very low Health can
   trigger early death events at any age.
3. Phase transitions are **one-directional** — time never reverses (Pillar 3:
   Time Never Stops).

### Interactions with Other Systems

| System | Direction | Data Interface |
|--------|-----------|---------------|
| **Starting Conditions Generator** | Writes → this | Sets all Layer 1 (Identity), initial Layer 2 (spectrums at 0), initial Layer 3 (attributes based on family background), initial Layer 5 (family relationships) |
| **Timeline Engine** | Reads ← this; Writes → this | Reads currentAge and life phase to determine pacing. Writes currentAge increment, applies passive drifts (health aging, stress recovery, happiness regression, relationship fade) |
| **Choice & Consequence System** | Reads ← this; Writes → this | Reads all layers to determine choice availability and consequence magnitude. Writes attribute deltas, spectrum shifts, tag additions, relationship modifications |
| **Life Event Generator** | Reads ← this | Queries attributes, spectrums, tags, flags, relationships, and life phase to select eligible events. Never writes directly — all state changes go through Choice & Consequence |
| **Event Presentation Layer** | Reads ← this | Reads attribute buckets and relationship data for narrative text generation ("Your years of study pay off...") |
| **Save / State Persistence** | Reads ← this; Writes → this | Serializes the entire state model for save. Deserializes to restore. |
| **Epitaph / Life Summary Generator** | Reads ← this | Reads final state at death to generate life summary. Queries tag history, peak attribute values, key relationships |
| **Branching Tree Visualizer** | Reads ← this (via Save) | Uses saved state snapshots at decision points to display branch metadata |
| **Generational Inheritance System** | Reads ← this | Reads parent's final state (Layer 1 familyBackground, Layer 2 spectrums, Layer 3 attributes, Layer 4 tags, Layer 5 relationships) to generate child's starting conditions |
| **Relationship Tracker** | Reads ← this; Writes → this | A specialized subsystem that manages Layer 5 (Relationships). Reads relationship data, writes closeness changes, status transitions |
| **Dashboard UI** | Reads ← this | Reads Layer 3 attributes for bucket display, Layer 5 for relationship summaries, Layer 4 for life story tag list |

## Formulas

### Personality Inertia

When a choice applies a delta to a personality spectrum, inertia reduces
opposite-direction shifts for strongly-defined personalities.

```
effective_delta = delta * inertia_factor
inertia_factor = 1.0 - (0.2 * (abs(current_value) / 100))
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| delta | int | -30 to +30 | Choice data | Raw spectrum shift from a choice |
| current_value | int | -100 to +100 | Character state | Current spectrum value |
| inertia_factor | float | 0.8 to 1.0 | Calculated | Reduction multiplier |
| effective_delta | int | -30 to +30 | Calculated | Actual shift applied (rounded) |

**Expected output**: At current_value = 0 (neutral), full delta applies.
At current_value = +100, opposite-direction deltas are reduced by 20%.
**Edge case**: If delta is in the same direction as current_value (reinforcing),
inertia does NOT apply — only opposite-direction shifts are dampened.
**Implementation note**: Apply inertia only when `sign(delta) != sign(current_value)`.
Same-direction deltas (reinforcing the existing personality) apply at full strength
with no reduction: `effective_delta = delta` (no inertia_factor multiplication).

### Personality Passive Decay

Unused spectrums drift toward 0 over time.

```
new_value = current_value - sign(current_value) * DECAY_RATE
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| current_value | int | -100 to +100 | Character state | Current spectrum value |
| DECAY_RATE | int | 1 | Tuning knob | Points per year of decay |
| new_value | int | -100 to +100 | Calculated | Value after decay |

**Expected output**: A spectrum at +50 with no reinforcing choices drifts to
+49 after one year. After 50 years of neglect, it returns to 0.
**Edge case**: If current_value is 0, no decay occurs (already neutral).
Decay is applied only if no choices affected this spectrum in the current year.

### Health Aging

Health declines passively after age 40, accelerating after 60.

```
health_drift = -BASE_AGING_RATE * aging_multiplier - stress_penalty
aging_multiplier = 1.0 if age <= 60 else 1.0 + ((age - 60) * 0.05)
stress_penalty = STRESS_HEALTH_RATE if stress > 80 else 0
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| BASE_AGING_RATE | float | 0.5 | Tuning knob | Health loss per year after 40 |
| aging_multiplier | float | 1.0-2.0 | Calculated | Accelerates after 60 |
| stress_penalty | float | 0 or 1.0 | Calculated | Extra health loss from high stress |
| STRESS_HEALTH_RATE | float | 1.0 | Tuning knob | Health cost of sustained stress |

**Expected output**: At age 45, health drifts -0.5/year. At age 70 with low
stress, -1.0/year. At age 70 with high stress, -2.0/year.
**Edge case**: Health never drops below 0. At Health = 0, death is triggered.

### Happiness Hedonic Adaptation

Extreme happiness or sadness regresses toward the mean over time.

```
happiness_drift = 0 if 30 <= happiness <= 70
happiness_drift = -ADAPTATION_RATE if happiness > 70
happiness_drift = +ADAPTATION_RATE if happiness < 30
happiness_drift += relationship_bonus
relationship_bonus = RELATIONSHIP_HAPPINESS_RATE if relationships > 60 else 0
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| ADAPTATION_RATE | float | 1.0 | Tuning knob | Regression speed per year |
| RELATIONSHIP_HAPPINESS_RATE | float | 1.0 | Tuning knob | Happiness boost from strong relationships |
| happiness | int | 0-100 | Character state | Current happiness |
| relationships | int | 0-100 | Character state | Current relationships attribute |

**Expected output**: Happiness of 90 drifts toward 70 at -1/year. Happiness
of 15 drifts toward 30 at +1/year. Strong relationships give +1/year bonus.

### Derived Relationships Attribute

The Relationships attribute is computed from active relationship closeness.

```
relationships_attribute = sum(closeness for r in active_relationships) / max(active_count, 1)
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| active_relationships | list | 0-20 items | Layer 5 | Relationships with status "active" |
| closeness | int | 0-100 | Each relationship | Individual closeness score |
| active_count | int | 0-20 | Calculated | Number of active relationships |

**Expected output**: 5 active relationships averaging closeness 60 → Relationships = 60.
**Edge case**: If active_count is 0, Relationships = 0 (Isolated).

### Death Probability

Starting at age 65, each year has a chance to trigger death.

```
death_chance = BASE_DEATH_RATE * (1 + (age - DEATH_START_AGE) * DEATH_ACCELERATION)
                * health_modifier
health_modifier = 2.0 - (health / 100)  // low health doubles death chance
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| BASE_DEATH_RATE | float | 0.02 | Tuning knob | 2% base chance at death start age |
| DEATH_START_AGE | int | 65 | Tuning knob | Age when death becomes possible |
| DEATH_ACCELERATION | float | 0.03 | Tuning knob | Rate of increase per year |
| health_modifier | float | 1.0-2.0 | Calculated | Low health increases death probability |

**Expected output**: At age 65, health 100: 2% chance. At age 75, health 50: ~9%.
At age 85, health 30: ~24%. Maximum practical lifespan ~95-100 with perfect health.
**Edge case**: Health = 0 at any age triggers immediate death (crisis event, not
probability roll). Before age 65, death only occurs via specific crisis events
(accident, illness), not the probability formula.

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Attribute hits 0 | Clamp at 0. Health = 0 triggers death. Other attributes at 0 trigger crisis events but don't end the game. | A life with 0 Wealth isn't over — it's just very hard. Only Health = 0 is fatal. |
| Attribute exceeds 100 | Clamp at 100. Excess is lost, not banked. | Prevents runaway accumulation. A "Wealthy" life doesn't become "impossibly rich." |
| All personality spectrums near 0 | Character is "undefined" — events treat them as a blank slate, offering more personality-defining choices. | Young characters or passive players should get more opportunities to define themselves, not fewer. |
| Personality spectrum at max (+100 or -100) | No further movement in that direction. Opposite-direction choices still work (with inertia). | Cap prevents infinite accumulation; inertia prevents instant reversal. |
| Relationship closeness hits 0 | Relationship status transitions to "estranged." Person stops generating events unless a reconciliation event fires. | 0 closeness = you've lost this person. They're not deleted — they're estranged, which is its own narrative state. |
| Maximum 20 active relationships exceeded | Least-close non-family relationship is archived. Archived relationships appear in history but don't generate events. | Prevents unbounded relationship bloat. Family is protected because you can't "forget" family. |
| Character has no active relationships | Relationships attribute = 0 (Isolated). Triggers loneliness events. Happiness drifts down faster (-2/year instead of standard). | Isolation is a valid life state that creates its own narrative — it shouldn't crash the system. |
| Two life events try to modify the same attribute simultaneously | Events are processed sequentially in the order they were generated. Each event sees the result of the previous one. | No true simultaneity — the Timeline Engine processes events in deterministic order. |
| Generational inheritance with extreme parent stats | Child starting conditions are moderated: they inherit a fraction of parent's deviation from baseline, not the raw values. See Generational Inheritance System GDD for formula. | Prevents dynasty optimization — a Wealth: 100 parent doesn't give their child Wealth: 100. Real inheritance is partial and unpredictable. |
| Death at age < 18 (childhood death) | Rare crisis event only. No generational inheritance (no children). Life ends, epitaph generated, tree branch terminates. | Childhood death is emotionally heavy and should be very rare, but not impossible — it serves the "Life is Unfair" pillar. |
| Player has no choices available in a year | Year passes with only passive drifts and auto-generated minor events. No "empty" years with zero content. | The Life Event Generator always produces at least one minor timeline event per year. Choiceless years happen in infancy/early childhood by design. |
| Save data corrupted or missing fields | Load with defaults for missing fields. Missing attributes default to 50 (neutral). Missing spectrums default to 0. Missing relationships default to empty list. Log warning. | Graceful degradation over crash. A partially loaded save is better than a lost save. |

## Dependencies

| System | Direction | Nature | Hard/Soft | Interface |
|--------|-----------|--------|-----------|-----------|
| Starting Conditions Generator | Writes to this | Initializes all layers at birth | Hard | `initializeCharacter(familyBackground, startingClass) → CharacterState` |
| Timeline Engine | Reads + writes | Advances age, applies passive drifts | Hard | `applyYearTick(state) → state` with drift calculations |
| Choice & Consequence System | Reads + writes | Core modifier of all mutable state | Hard | `applyChoice(state, choiceEffects) → state` |
| Life Event Generator | Reads | Queries state for event eligibility | Hard | `queryState(attribute, spectrum, tags, flags, relationships) → values` |
| Event Presentation Layer | Reads | Reads attributes/relationships for narrative text | Soft | `getDisplayBucket(attribute) → string`, `getRelationship(id) → Relationship` |
| Save / State Persistence | Reads + writes | Serializes/deserializes full state | Hard | `serialize(state) → JSON`, `deserialize(json) → CharacterState` |
| Epitaph / Life Summary | Reads | Reads final state for summary generation | Soft | `getFinalState() → CharacterState` |
| Branching Tree Visualizer | Reads (via Save) | Uses state snapshots at decision points | Soft | No direct interface — reads from save data |
| Generational Inheritance | Reads | Reads parent's final state for child generation | Soft | `getInheritableState() → subset of CharacterState` |
| Relationship Tracker | Reads + writes | Manages Layer 5 (Relationships) | Hard | `addRelationship()`, `updateCloseness()`, `transitionStatus()` |
| Dashboard UI | Reads | Displays attributes, tags, relationships | Soft | `getDisplayState() → { attributes: BucketMap, tags: string[], relationships: RelationshipSummary[] }` |

**This system has NO upstream dependencies.** It is pure data — it depends on
nothing and everything depends on it. This is by design: the Character State Model
is the foundation layer.

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| PERSONALITY_DECAY_RATE | 1/year | 0-3 | Personality fades faster, more "blank slate" over time | Personality is more permanent once established |
| PERSONALITY_INERTIA_MAX | 0.2 (20%) | 0-0.5 | Stronger personalities are harder to shift | All personalities shift equally regardless of history |
| HEALTH_BASE_AGING_RATE | 0.5/year | 0.1-2.0 | Health declines faster after 40, shorter lives | Slower aging, longer average lifespan |
| HEALTH_AGING_START_AGE | 40 | 30-50 | Earlier aging onset | Later aging onset |
| HEALTH_AGING_ACCELERATION | 0.05/year after 60 | 0.01-0.1 | Steeper health decline in old age | Gentler old-age decline |
| STRESS_HEALTH_RATE | 1.0/year | 0-3.0 | High stress is more physically damaging | Stress has less health impact |
| STRESS_NATURAL_RECOVERY | 2.0/year | 0-5.0 | Stress fades faster naturally | Stress is more persistent |
| HAPPINESS_ADAPTATION_RATE | 1.0/year | 0-3.0 | Faster regression to mean (happiness is fleeting) | Extreme happiness/sadness lasts longer |
| RELATIONSHIP_HAPPINESS_RATE | 1.0/year | 0-3.0 | Relationships matter more to happiness | Relationships have less happiness impact |
| RELATIONSHIP_PASSIVE_DECAY | 1.0/year | 0-3.0 | Friendships fade faster without contact | Friendships persist longer without reinforcement |
| MAX_ACTIVE_RELATIONSHIPS | 20 | 10-30 | More relationship juggling, richer social life | Tighter social circle, more impactful relationships |
| DEATH_BASE_RATE | 0.02 (2%) | 0.01-0.05 | More deaths at 65, shorter average lifespan | Longer average lifespan |
| DEATH_START_AGE | 65 | 55-75 | Death possible earlier | Death only possible later |
| DEATH_ACCELERATION | 0.03/year | 0.01-0.05 | Death probability ramps faster | Gentler increase, more lives reaching 90+ |
| POVERTY_STRESS_RATE | 2.0/year | 0-5.0 | Poverty causes more stress | Poverty is less stressful |
| WEALTH_CLASS_THRESHOLDS | [0, 25, 50, 80] | Adjustable | Higher thresholds = harder to reach upper class | Lower thresholds = easier social mobility |

**Interaction warnings**:
- HEALTH_BASE_AGING_RATE and DEATH_BASE_RATE together determine average lifespan.
  Increasing both creates very short lives; decreasing both creates very long ones.
  Tune together.
- STRESS_HEALTH_RATE and POVERTY_STRESS_RATE chain: poverty → stress → health loss.
  High values on both can create death spirals for low-wealth characters. Cap the
  combined effect or playtest carefully.
- HAPPINESS_ADAPTATION_RATE at 0 allows permanent extreme happiness/sadness, which
  undermines the "Life is Unfair" pillar. Keep above 0.5.

## Visual/Audio Requirements

| Event | Visual Feedback | Audio Feedback | Priority |
|-------|----------------|---------------|----------|
| Attribute changes | Dashboard indicator shifts smoothly (animated transition between buckets) | Subtle chime for improvement, muted tone for decline | Medium |
| Life phase transition | Full-screen transition card ("Childhood → Adolescence") with age indicator | Phase-appropriate ambient music transition | High |
| Relationship status change | Relationship entry updates in dashboard with brief highlight | Warm tone for closeness gain, somber tone for estrangement | Low |
| Tag earned | "Life Story" list gains new entry with brief glow animation | Achievement-like soft sound | Low |
| Death triggered | Screen fade, final state snapshot captured for epitaph | Music fades to silence | High |

## UI Requirements

| Information | Display Location | Update Frequency | Condition |
|-------------|-----------------|-----------------|-----------|
| Life attributes (7 buckets) | Life Summary Dashboard | After every event/choice | Always available via dashboard toggle |
| Current age and life phase | Timeline header | Every year tick | Always visible during gameplay |
| Active relationships (top 5) | Dashboard relationships tab | After relationship events | Always available via dashboard |
| Life tags ("Life Story") | Dashboard story tab | After tag earned | Always available via dashboard |
| Personality summary | Dashboard personality tab | After spectrum changes | Shows qualitative labels only |
| Current location | Timeline header | After moving events | Always visible during gameplay |

## Acceptance Criteria

- [ ] All 6 data layers are implemented and hold correct types
- [ ] Attributes clamp to 0-100 after any modification
- [ ] Personality spectrums clamp to -100 to +100 after any modification
- [ ] Personality inertia reduces opposite-direction deltas by up to 20%
- [ ] Personality decay of 1/year occurs for unreinforced spectrums
- [ ] Health passive drift activates after age 40 and accelerates after 60
- [ ] Happiness hedonic adaptation regresses extreme values toward 30-70 band
- [ ] Stress natural recovery of 2/year applies when no stress-adding events occur
- [ ] Cross-attribute effects work: high stress damages health, poverty adds stress, strong relationships boost happiness
- [ ] Socioeconomic class reclassifies correctly when Wealth crosses thresholds
- [ ] Relationships cap at 20 active; lowest-closeness non-family archived when exceeded
- [ ] Relationship closeness < 10 transitions status to "estranged"
- [ ] Flags are correctly derived from attributes + tags (not independently stored)
- [ ] Life phase transitions at correct age thresholds
- [ ] Death probability formula activates at DEATH_START_AGE and scales correctly
- [ ] Health = 0 triggers immediate death regardless of age
- [ ] Full state serializes to JSON and deserializes without data loss
- [ ] Corrupted/partial save data loads gracefully with defaults
- [ ] Dashboard display buckets match attribute ranges (e.g., Health 75 → "Healthy")
- [ ] No attribute value is ever displayed as a raw number to the player
- [ ] All tuning knobs are externalized in a config file, not hardcoded
- [ ] State modification completes within 1ms per operation (browser performance)
- [ ] Full state serialization completes within 10ms

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should personality spectrums be visible on the dashboard, or only inferred from narrative? | Game Designer | During Event Presentation Layer design | Currently showing qualitative labels; may be too "gamey" |
| Optimal number of starting condition variations for meaningful replay diversity? | Systems Designer | During Starting Conditions Generator design | Need enough variety without exponential content requirements |
| How much of parent's state should transfer to children in generational inheritance? | Game Designer | During Generational Inheritance System design | Too much → dynasty optimization; too little → disconnect between generations |
| Should derived flags be eagerly recomputed or lazily evaluated? | Gameplay Programmer | During implementation | Eager is simpler; lazy may perform better with many flags |
| Is hedonic adaptation (happiness regression) fun for players, or does it feel punishing? | QA / Playtesting | After MVP prototype | The formula is psychologically accurate but may frustrate players who "earn" high happiness |
