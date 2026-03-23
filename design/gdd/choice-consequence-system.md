# Choice & Consequence System

> **Status**: Designed
> **Author**: User + game-designer, systems-designer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Every Choice Echoes

## Overview

The Choice & Consequence System is the mechanical heart of LifePath — the engine
that makes "Every Choice Echoes" real. It processes player choices, applies
immediate effects to the Character State Model, schedules delayed effects for
future years, manages the delayed effect queue, creates branch points for the
tree visualizer, and provides the state query interface that other systems use to
determine what's possible.

The system uses a **hybrid consequence model**: choices produce both **indirect
ripples** (state changes that influence future event eligibility organically) and
**direct chains** (explicitly authored follow-up events scheduled for specific
future ages). Indirect ripples are automatic and scalable — every state change
naturally opens/closes doors. Direct chains are hand-authored for maximum emotional
impact at key moments. Together, they create the feeling that every choice matters,
without requiring the developer to author a consequence for every possible state
combination.

## Player Fantasy

When you make a choice, you should feel its weight — not just in the moment, but
in the years that follow. Choosing to skip college should follow you for decades:
fewer career options, different social circles, different self-perception. But it
should also occasionally surprise you: a direct chain event at age 35 where someone
you met at your first job offers you a partnership you'd never have gotten with a
degree. The player should frequently think: "That happened because of what I chose
10 years ago." Both the predictable ripples and the surprising echoes serve this
fantasy.

## Detailed Design

### Core Rules

#### Two Consequence Channels

Every choice produces consequences through two independent channels:

**Channel 1: Indirect Ripples (State-Based)**
- Choices modify the Character State Model (attributes, spectrums, tags, relationships)
- Future events query the state model for eligibility
- Consequences are **emergent**: the system doesn't "know" what will happen later,
  but state changes naturally open and close event doors
- Example: Choosing "study hard" → Education +10 → Future event "scholarship offer"
  becomes eligible (because it requires Education ≥ 60) → Player experiences this
  as a consequence of studying, even though no explicit link was authored

**Channel 2: Direct Chains (Authored)**
- Choices create **delayed effects** scheduled for specific future ages
- Delayed effects include narrative text that explicitly connects them to the
  original choice: "Remember when you helped that stranger at age 22? They
  remember you too..."
- Used for the most emotionally impactful consequence moments
- Example: Choosing "help the stranger" at age 22 → Delayed effect at age 35:
  the stranger has become successful and offers you a job. Explicit, authored,
  with narrative connection text.

**Design principle**: Indirect ripples do 80% of the work (automatic, scalable).
Direct chains do 20% but create 80% of the emotional impact (authored, specific).

#### Choice Processing Pipeline

When a player makes a choice:

```
1. VALIDATE CHOICE
   - Confirm choice is available (conditions met)
   - Record choice ID for branch tracking

2. APPLY IMMEDIATE EFFECTS
   - Process all effects with delay = 0
   - Attribute deltas: add/multiply/set
   - Spectrum shifts: add with inertia calculation
   - Tag additions: add_tag to Character State
   - Relationship modifications: closeness changes, status transitions
   - Flag recalculation (derived, automatic)

3. SCHEDULE DELAYED EFFECTS
   - For each effect with delay > 0:
     a. Calculate target age: currentAge + delay
     b. Add to delayed effect queue with probability check
     c. Store reference to originating choice (for narrative connection)

4. CREATE BRANCH POINT (if choice is marked branchPoint: true)
   - Snapshot current Character State
   - Record chosen option and alternate options
   - Send to Save / State Persistence for tree storage

5. TRIGGER NARRATIVE RESPONSE
   - Send choice's narrative text to Event Presentation Layer
   - Display consequence preview (if configured): brief text hint about
     immediate effects ("You feel a surge of confidence")

6. SIGNAL TIMELINE ENGINE
   - Resume timeline auto-scroll after consequence display
```

#### Delayed Effect Queue

The delayed effect queue is the core data structure for direct chains:

```typescript
interface DelayedEffect {
  id: string;                      // Unique effect ID
  sourceEventId: string;           // Event that created this effect
  sourceChoiceId: string;          // Choice that triggered it
  sourceAge: number;               // Age when the choice was made
  targetAge: number;               // Age when this effect should fire
  effect: Effect;                  // The actual state modification
  probability: number;             // 0-1, chance this actually fires (default 1.0)
  narrative: string;               // Text connecting this to the original choice
  fired: boolean;                  // Has this been processed?
  expired: boolean;                // Has this been skipped (death, etc.)?
}
```

**Queue processing** (called by Timeline Engine each year tick):

```
For each delayed effect where targetAge == currentAge:
  1. Roll probability check
  2. If passes:
     a. Apply the effect to Character State
     b. Show narrative text as a special "echo" event on timeline
     c. Mark as fired
  3. If fails:
     a. Mark as expired (silently — the consequence didn't materialize)
```

**Queue rules**:
1. Maximum 50 active delayed effects in queue (per Character State Model edge case)
2. If exceeded, oldest low-impact effects are expired silently
3. Effects with probability < 1.0 may not fire — this creates uncertainty
   about whether a past choice will come back
4. The queue is saved with the active life save data
5. On death, all unfired effects are expired (no post-death consequences)

#### Consequence Visibility

How does the player know their choice had an effect?

| Consequence Type | Visibility | Timing |
|-----------------|------------|--------|
| Immediate attribute change | Dashboard indicator shifts; brief narrative hint | Instant |
| Immediate tag addition | Tag appears in Life Story list | Instant |
| Spectrum shift | Personality label may change on dashboard | Instant (if crosses bucket threshold) |
| Relationship change | Relationship entry updates | Instant |
| Delayed effect fires | Special "echo" event on timeline with connection text | At target age |
| Indirect ripple (new event eligible) | New event appears organically — player may not realize it's connected | When event fires |

**Design principle**: Direct chains are ALWAYS visible ("Remember when you...").
Indirect ripples are SOMETIMES visible (the player connects the dots themselves,
which is more powerful when it happens).

#### Consequence Categories

Different types of choices produce different patterns of consequences:

| Choice Category | Immediate Effects | Typical Delays | Echo Pattern |
|----------------|-------------------|---------------|-------------|
| Education (school, study) | Education ±, Stress ± | 4-8 years (career impact) | Career events reference education choices |
| Career (job, promotion) | Career ±, Wealth ±, Stress ± | 2-5 years (financial, social) | Lifestyle changes cascade from career |
| Relationship (romantic, family) | Relationship closeness, Happiness ± | 1-20 years (long-term) | Relationship events reference past choices |
| Moral (ethical dilemmas) | Spectrum shifts (empathy, courage, conformity) | 5-15 years (karma-like) | Character-defining moments echo in identity |
| Financial (spending, investing) | Wealth ±, Stress ± | 3-10 years (compound) | Financial decisions snowball |
| Health (lifestyle, risk) | Health ±, Stress ± | 5-20 years (long-term) | Health choices echo in elder years |
| Identity (self-expression) | Spectrum shifts, tags | 2-10 years | "Who you became" narrative moments |

#### State Query Interface

Other systems query the Character State through this interface:

```typescript
interface StateQuery {
  // Check if conditions are met for an event/choice
  evaluateConditions(conditions: Condition[]): boolean;

  // Get the display bucket for an attribute
  getDisplayBucket(attribute: string): string;  // "Wealthy", "Struggling", etc.

  // Get personality label for a spectrum
  getPersonalityLabel(spectrum: string): string;  // "Brave", "Somewhat cautious"

  // Check if a tag exists
  hasTag(tag: string): boolean;

  // Get relationship by type or ID
  getRelationship(query: { id?: string, type?: string }): Relationship | null;

  // Get derived flag value
  getFlag(flag: string): boolean;

  // Get narrative text describing current state (for event text generation)
  getNarrativeContext(): NarrativeContext;
}
```

### States and Transitions

The Choice & Consequence System is stateless per-operation — it processes choices
and returns. The delayed effect queue is persistent state, but it's stored in the
Character State Model's save data.

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Character State Model** | Reads + Writes | Reads all layers for condition evaluation. Writes attribute deltas, spectrum shifts, tags, relationship changes. |
| **Timeline Engine** | Called by | Timeline Engine calls `processDelayedEffects(currentAge)` each year tick and `processChoice(choice)` when player chooses. |
| **Event Content Database** | Reads | Reads effect definitions and choice schemas from event data. |
| **Life Event Generator** | Provides query interface | Event Generator uses `evaluateConditions()` to check event eligibility. |
| **Event Presentation Layer** | Sends to | Sends narrative text (immediate consequences and echo events) for display. |
| **Save / State Persistence** | Saved by | Delayed effect queue is serialized with the active life save. |
| **Branching Tree Visualizer** | Sends to | Creates branch point data for tree nodes (state snapshot + choice info). |
| **Relationship Tracker** | Writes to | Relationship modifications are processed through this system's effect pipeline. |

## Formulas

### Consequence Magnitude Scaling

Consequence magnitude can scale based on character state (e.g., a financial
setback hits harder when you're already poor):

```
effective_magnitude = base_magnitude * vulnerability_factor
vulnerability_factor = 1.0 + (VULNERABILITY_SCALE * (1 - target_attribute / 100))
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| base_magnitude | float | -30 to +30 | Effect definition | Raw effect value |
| VULNERABILITY_SCALE | float | 0.5 | Tuning knob | How much current state amplifies effects |
| target_attribute | int | 0-100 | Character State | Current value of the affected attribute |
| vulnerability_factor | float | 1.0-1.5 | Calculated | Multiplier for the effect |

**Expected output**: A -15 Wealth hit with current Wealth at 80 → effective -15.
Same hit with Wealth at 20 → effective -21. Being poor makes financial setbacks
worse. This creates the downward spirals that make "Life is Unfair" feel real.

**Inverse for positive effects** (optional — reward the struggling):
```
resilience_factor = 1.0 + (RESILIENCE_SCALE * (1 - target_attribute / 100))
```
A +15 Wealth gain with current Wealth at 20 → effective +21. Small wins feel
bigger when you're struggling. This prevents permanent hopelessness.

### Branch Point Density

Not every choice creates a tree branch. Guideline:

```
branch_density = major_choices_with_branchPoint / total_major_choices
target: 60-80% of major choices are branch points
```

Minor choices are NEVER branch points. This keeps the tree readable.

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Choice modifies attribute beyond 0-100 | Clamp after applying all effects. Order: apply delta, then clamp. | Standard clamping per Character State Model rules. |
| Delayed effect targets an age the character never reaches (dies first) | Effect expires silently on death. No post-death processing. | Dead characters don't experience consequences. |
| Two delayed effects target the same age and conflict | Process in queue order (FIFO by creation time). Each sees the result of the previous. | Deterministic ordering prevents undefined behavior. |
| Delayed effect with probability 0.5 doesn't fire | Player never knows it existed. No "you almost got lucky" message. | Unrealized possibilities are invisible — this is life, not a game showing you the dice roll. |
| Player makes the same choice in two different lives | Same immediate effects, same delayed effects queued. But different life context means different emergent outcomes. | Choices are deterministic in isolation; lives are unique because context differs. |
| Choice has no effects defined | Valid — some choices are purely narrative (the choice itself is the experience). Choice is recorded for tree but doesn't modify state. | Not every decision needs mechanical consequences. "What did you say to your dying father?" matters narratively, not mechanically. |
| Vulnerability scaling creates a death spiral | Floor: no single effect can reduce an attribute by more than 30 points, regardless of scaling. | Prevents one bad event from being catastrophically amplified. |
| Delayed effect queue at capacity (50) | Expire oldest effect with lowest base_magnitude. Log for content balancing. | Graceful degradation; low-impact echoes are sacrificed for high-impact ones. |
| Choice references a relationship that no longer exists | Effect silently fails for relationship modifications. Other effects still apply. | Partial effect application is better than all-or-nothing failure. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Character State Model | Reads + Writes | Core data dependency | Hard |
| Timeline Engine | Called by | Processes choices and delayed effects on tick | Hard |
| Event Content Database | Reads | Effect/choice definitions | Hard |
| Life Event Generator | Provides query | evaluateConditions() interface | Hard |
| Event Presentation Layer | Sends to | Narrative display | Soft |
| Save / State Persistence | Saved by | Delayed effect queue persistence | Hard |
| Branching Tree Visualizer | Sends to | Branch point creation | Soft |
| Relationship Tracker | Writes through | Relationship effect processing | Soft |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| VULNERABILITY_SCALE | 0.5 | 0-1.0 | Harder spirals for struggling characters | More flat/equal impact regardless of state |
| RESILIENCE_SCALE | 0.5 | 0-1.0 | Bigger wins for struggling characters | Less comeback amplification |
| MAX_SINGLE_EFFECT | 30 | 15-50 | Bigger swings per choice | More gradual changes |
| MAX_DELAYED_EFFECTS | 50 | 20-100 | More echoes in flight | Simpler queue management |
| DEFAULT_DELAY_PROBABILITY | 1.0 | 0.5-1.0 | All delayed effects fire | Some uncertainty in echoes |
| BRANCH_POINT_TARGET_RATIO | 0.7 | 0.5-0.9 | More tree branches | Fewer, more significant branches |
| ECHO_NARRATIVE_DISPLAY_MS | 3000 | 1500-5000 | Longer echo reading time | Quicker echo display |

## Acceptance Criteria

- [ ] Immediate effects apply correctly to all 6 Character State Model layers
- [ ] Delayed effects queue correctly and fire at the target age
- [ ] Delayed effect probability rolls work correctly (some effects don't fire)
- [ ] Branch points create correct state snapshots for tree replay
- [ ] Vulnerability scaling amplifies effects for low-attribute characters
- [ ] Resilience scaling amplifies positive effects for struggling characters
- [ ] MAX_SINGLE_EFFECT cap prevents catastrophic single-event damage
- [ ] Delayed effect queue caps at MAX_DELAYED_EFFECTS, expiring lowest-impact first
- [ ] State query interface (evaluateConditions) correctly evaluates all condition types
- [ ] Narrative echo events display connection text ("Remember when you...")
- [ ] Effects with missing relationship targets fail gracefully (partial application)
- [ ] All delayed effects expire on character death
- [ ] Choice processing completes within 2ms (immediate effects + queue insertion)
- [ ] Delayed effect queue processing completes within 1ms per tick
- [ ] No choice produces undefined behavior regardless of character state

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should players ever see the delayed effect queue? (e.g., "3 consequences pending...") | UX Designer | During playtesting | Transparency vs. mystery — knowing something is coming changes how you play |
| Should indirect ripples ever have narrative callouts? ("Your education pays off...") | Game Designer | During Event Presentation Layer design | Could make indirect consequences more visible without authored chains |
| Optimal delayed effect time range — what's the sweet spot for echoes? | Game Designer | After playtesting | Too short (1-2 years) feels like immediate consequence. Too long (20+ years) and players forget the original choice. |
| Should the vulnerability/resilience system be symmetric? | Systems Designer | During balance testing | Asymmetric (harder spirals, easier comebacks) may be more fun than symmetric |
