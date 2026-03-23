# Event Content Database

> **Status**: Designed
> **Author**: User + game-designer, systems-designer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Every Choice Echoes

## Overview

The Event Content Database is the structured data store containing every life
event in LifePath — from minor timeline blips ("You scraped your knee") to deep
narrative crossroads ("Which college will you attend?"). It defines the schema
for events, their eligibility conditions, consequence mappings, and presentation
metadata. The Life Event Generator queries this database to select events; the
Event Presentation Layer reads it to render them.

Content follows a **tiered authoring model**: major narrative events are fully
hand-written for maximum emotional impact; minor timeline events use parameterized
templates with variable substitution for volume scaling. This allows a solo
developer to build 200+ effective events while maintaining narrative quality where
it matters most.

## Player Fantasy

The player should feel that life is rich, varied, and surprising — not a
predictable sequence of scripted moments. Minor events create the texture of daily
life (the small joys, setbacks, and incidentals). Major events create the turning
points that define who you become. Across multiple playthroughs, the player should
encounter familiar event types but with enough variation that no two lives feel
identical. The database is invisible to the player, but its quality determines
whether LifePath feels like living a life or reading a script.

## Detailed Design

### Core Rules

#### Event Types

There are 3 event types, each with distinct authoring requirements:

| Type | Description | Authoring | Pauses Timeline? | Player Agency |
|------|------------|-----------|-------------------|---------------|
| **Minor Event** | Small life moments shown on the timeline scroll. Brief text, no choices or simple inline choice. | Template + variables | No (appears during scroll) | None or micro-choice |
| **Major Event** | Deep narrative moments at life crossroads. Rich presentation in mixed formats. | Fully authored | Yes (timeline stops) | Full choice with consequences |
| **Crisis Event** | Unplanned disruptions (illness, accident, job loss, death). Can be minor or major. | Fully authored (critical) or template (routine) | Depends on severity | Reactive choices |

#### Event Schema (Base)

Every event, regardless of type, shares this base schema:

```typescript
interface LifeEvent {
  // Identity
  id: string;                    // Unique identifier: "childhood_bully_encounter"
  type: "minor" | "major" | "crisis";
  category: string;              // From Life Stage Definitions: "school", "romance", etc.

  // Eligibility
  stages: LifeStage[];           // Which life stages this can fire in
  minAge: number;                // Minimum age (overrides stage if needed)
  maxAge: number;                // Maximum age
  conditions: Condition[];       // State conditions that must be true
  exclusions: string[];          // Event IDs that prevent this from firing
  prerequisites: string[];       // Event IDs that must have fired first
  weight: number;                // Selection probability weight (1-100)
  maxOccurrences: number;        // How many times this can fire per life (1 = unique)
  isMilestone: boolean;           // If true, fires at minAge with weight 100, bypassing normal selection

  // Presentation
  format: "timeline_popup" | "scenario_card" | "visual_novel" | "mini_narrative" | "echo_event";
  content: EventContent;         // Type-specific content (see below)

  // Consequences
  effects: Effect[];             // State modifications when event fires
  choices?: Choice[];            // Player choices (if any)

  // Metadata
  tags: string[];                // Searchable tags: "emotional", "funny", "tragic"
  rarity: "common" | "uncommon" | "rare" | "legendary";
  author: string;                // For content tracking
}
```

#### Condition Schema

Conditions determine when an event is eligible to fire:

```typescript
interface Condition {
  type: "attribute" | "spectrum" | "tag" | "flag" | "relationship" | "identity";
  target: string;                // Which attribute/spectrum/tag/flag to check
  operator: ">" | "<" | ">=" | "<=" | "==" | "!=" | "has" | "!has";
  value: number | string | boolean;
}
```

**Examples**:
- `{ type: "attribute", target: "wealth", operator: ">=", value: 60 }` — requires comfortable wealth
- `{ type: "tag", target: "college_graduate", operator: "has" }` — requires college grad tag
- `{ type: "relationship", target: "type:romantic", operator: "has" }` — requires active romantic relationship
- `{ type: "spectrum", target: "courage", operator: ">=", value: 40 }` — requires at least somewhat brave

#### Effect Schema

Effects describe state modifications:

```typescript
interface Effect {
  type: "attribute" | "spectrum" | "tag" | "relationship" | "flag";
  target: string;
  operation: "add" | "multiply" | "set" | "add_tag" | "create_relationship" | "modify_relationship";
  value: number | string | object;
  delay?: number;                // Years before this effect fires (0 = immediate)
  probability?: number;          // 0-1, chance this effect actually occurs
  narrative?: string;            // Text shown when delayed effect triggers
}
```

**Delayed effects** are the heart of "Every Choice Echoes." An event at age 15 can
create an effect with `delay: 10` that fires at age 25. The narrative text explains
the connection: "That summer job you took at 15 leads to an unexpected career
opportunity..." Delayed effects are stored in a queue and processed by the Choice &
Consequence System each year tick.

**Relationship effect operations**: `modify_relationship` expects `value` as
`{ closeness?: number, status?: string }`. Example:
`{ operation: "modify_relationship", target: "friend_marcus", value: { closeness: +10 } }`
increases Marcus's closeness by 10. `create_relationship` expects `value` as
`{ name: string, type: string, closeness: number, traits: string[] }`.

#### Choice Schema

Choices within events:

```typescript
interface Choice {
  id: string;                    // "accept" or "decline"
  label: string;                 // Player-facing text: "Accept the scholarship"
  description?: string;          // Optional tooltip/preview
  conditions?: Condition[];      // Some choices only appear if conditions are met
  effects: Effect[];             // Consequences of this choice
  narrative: string;             // Story text shown after choosing
  branchPoint: boolean;          // If true, this choice creates a node in the branching tree
}
```

**Branch points**: Only choices marked `branchPoint: true` create nodes in the
Branching Tree Visualizer. Not every choice is a branch point — minor inline
choices modify state but don't create explorable alternate paths. Major life
decisions (career, marriage, education, moral crossroads) should be branch points.

### Minor Event Templates

Minor events use a template system with variable slots:

```typescript
interface MinorEventTemplate extends LifeEvent {
  template: string;              // "You {verb} at {location} with {person}."
  variables: VariableSlot[];     // Definitions for each slot
}

interface VariableSlot {
  name: string;                  // "verb", "location", "person"
  source: "pool" | "state" | "relationship";
  pool?: string[];               // If source is "pool", pick from this list
  stateQuery?: string;           // If source is "state", derive from character state
  relationshipQuery?: string;    // If source is "relationship", pick from relationships
}
```

**State query syntax**: `stateQuery` uses dot notation to access Character State
Model fields. Examples: `"attributes.wealth"` returns the wealth value,
`"spectrums.courage"` returns courage value, `"identity.location"` returns location
string, `"identity.name"` returns character name. Read-only access; no expressions
or operators. `relationshipQuery` uses type filters: `"type:friend"` returns a
random active friend, `"type:family"` returns a random family member.

**Example minor event**:
```json
{
  "id": "childhood_playground_001",
  "type": "minor",
  "template": "You {action} at the {location}. {reaction}",
  "variables": [
    { "name": "action", "source": "pool", "pool": ["climbed the monkey bars", "played tag", "sat on the swings", "built a sandcastle"] },
    { "name": "location", "source": "pool", "pool": ["playground", "park near school", "neighbor's backyard"] },
    { "name": "reaction", "source": "pool", "pool": ["It was a good day.", "You felt free.", "Time flew by.", "You made a new friend."] }
  ],
  "stages": ["childhood"],
  "effects": [{ "type": "attribute", "target": "happiness", "operation": "add", "value": 2 }],
  "weight": 50,
  "maxOccurrences": 3,
  "rarity": "common"
}
```

This single template produces 4 × 3 × 4 = **48 variations** from one authored event.

### Major Event Structure

Major events are fully authored — no templates. Each major event is a self-contained
narrative moment with:

1. **Setup text** (scene-setting paragraph)
2. **Character dialogue or internal monologue** (emotional hook)
3. **2-4 meaningful choices** with distinct consequences
4. **Outcome narrative** per choice (what happens after)
5. **Delayed effects** where appropriate (consequences that echo forward)

**Example major event structure**:
```json
{
  "id": "adolescence_college_decision",
  "type": "major",
  "format": "visual_novel",
  "stages": ["adolescence"],
  "minAge": 17,
  "maxAge": 18,
  "conditions": [
    { "type": "attribute", "target": "education", "operator": ">=", "value": 40 }
  ],
  "content": {
    "setup": "The acceptance letter sits on the kitchen table. Your parents exchange a look you can't quite read. This is the first decision that feels like it belongs entirely to you.",
    "choices": [
      {
        "id": "attend_college",
        "label": "Accept — go to college",
        "narrative": "You pack your bags with a mix of terror and excitement. The campus feels enormous on move-in day, but by the end of the first week, it starts to feel like possibility.",
        "branchPoint": true,
        "effects": [
          { "type": "attribute", "target": "education", "operation": "add", "value": 15 },
          { "type": "attribute", "target": "wealth", "operation": "add", "value": -10 },
          { "type": "tag", "target": "college_student", "operation": "add_tag" },
          { "type": "attribute", "target": "career", "operation": "add", "value": 5, "delay": 4, "narrative": "Your degree opens doors you didn't know existed." }
        ]
      },
      {
        "id": "skip_college",
        "label": "Decline — enter the workforce",
        "narrative": "You fold the letter and put it in a drawer. There's a world out there that doesn't require a classroom.",
        "branchPoint": true,
        "effects": [
          { "type": "attribute", "target": "career", "operation": "add", "value": 8 },
          { "type": "attribute", "target": "wealth", "operation": "add", "value": 5 },
          { "type": "tag", "target": "workforce_early", "operation": "add_tag" },
          { "type": "spectrum", "target": "ambition", "operation": "add", "value": 10 }
        ]
      }
    ]
  },
  "weight": 90,
  "maxOccurrences": 1,
  "rarity": "common"
}
```

### Format Content Requirements

Each format requires specific content fields in the `content` object:

| Format | Required Content Fields | Description |
|--------|----------------------|-------------|
| `timeline_popup` | `{ text: string }` | Brief text shown on scrolling timeline |
| `scenario_card` | `{ setup: string, choices: Choice[] }` | Description + choice buttons |
| `visual_novel` | `{ dialogue: DialogueLine[], choices: Choice[] }` | Character dialogue sequence + final choice |
| `mini_narrative` | `{ pages: string[], choices: Choice[] }` | Multi-screen story (3-5 pages) + final choice |
| `echo_event` | `{ text: string, sourceEventId: string, sourceAge: number }` | Delayed consequence with connection to original choice |

Where `DialogueLine = { speaker: string, text: string, emotion?: string }`.
`emotion` is optional and used by the Event Presentation Layer to adjust typewriter
speed (e.g., `"emotional"` = slower reveal).

### Content Volume Targets

| Category | Minor Templates | Minor Variations | Major Events | Total Effective Events |
|----------|----------------|-----------------|-------------|----------------------|
| Family | 15 | ~300 | 8 | ~308 |
| School/Education | 12 | ~200 | 6 | ~206 |
| Friendship | 10 | ~150 | 5 | ~155 |
| Romance | 10 | ~150 | 8 | ~158 |
| Career | 12 | ~200 | 8 | ~208 |
| Health | 8 | ~100 | 5 | ~105 |
| Financial | 8 | ~100 | 4 | ~104 |
| Crisis | 10 | ~120 | 8 | ~128 |
| Identity/Moral | 5 | ~50 | 6 | ~56 |
| Hobbies/Lifestyle | 10 | ~150 | 3 | ~153 |
| **TOTAL** | **100** | **~1,520** | **61** | **~1,581** |
| Fallback (universal) | 20 | ~100 | 0 | ~100 |

**Fallback events** have no conditions, no prerequisites, and `maxOccurrences ≥ 3`.
They fire when no other eligible events exist for a year. Examples: "A quiet day
passes," "You spend time at home," "The seasons change," "Nothing remarkable happens,
but life goes on." These ensure no year is ever event-free.

**MVP target**: 40 minor templates (~600 variations) + 20 major events + 20 fallback.
**v1.0 target**: 100 minor templates (~1,500 variations) + 61 major events + 20 fallback.

### States and Transitions

The Event Content Database itself has no runtime states — it is static data
loaded at game start. However, events have a lifecycle tracked by the Life Event
Generator:

| State | Meaning |
|-------|---------|
| Available | Conditions met, not yet fired, under maxOccurrences |
| Fired | Event has been triggered and shown to the player |
| Exhausted | maxOccurrences reached — cannot fire again this life |
| Blocked | Excluded by another event or failed prerequisite |
| Ineligible | Conditions not met (may become available later) |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Life Event Generator** | Reads this | Queries events by stage, category, conditions. Receives candidate list, applies weights, selects events. |
| **Choice & Consequence System** | Reads this | Reads effect definitions from selected events and choices. Processes immediate and delayed effects. |
| **Event Presentation Layer** | Reads this | Reads format, content, and choice data to render the event in the appropriate visual format. |
| **Character State Model** | Referenced | Conditions and effects reference the Character State Model's data layers (attributes, spectrums, tags, relationships, flags). |
| **Life Stage Definitions** | Referenced | Events reference stage names for eligibility. Category unlocks from Life Stage Definitions constrain which events are queryable. |
| **Content Authoring Schema** | Validates this | The authoring schema validates that all events conform to the schemas defined here. |
| **Save / State Persistence** | Referenced | Fired event IDs are stored in the save data to track which events have occurred (for maxOccurrences and prerequisites). |

## Formulas

### Template Variation Count

```
effective_variations = product(pool_size for each variable_slot)
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| pool_size | int | 2-10 | Template definition | Number of options in each variable slot |

**Expected output**: A template with 3 slots of 4 options each = 64 variations.
Target: each minor template should produce 10-50 effective variations minimum.

### Event Weight Normalization

When the Life Event Generator selects an event, weights are normalized:

```
selection_probability = event_weight / sum(all_eligible_event_weights)
```

Rare events have lower weights (5-15). Common events have higher weights (40-80).
This ensures rare events are genuinely rare but not impossible.

### Content Freshness Score

To prevent repetition, the Life Event Generator tracks a freshness score:

```
freshness = 1.0 - (times_fired / maxOccurrences) * REPETITION_PENALTY
effective_weight = weight * freshness
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| times_fired | int | 0-N | Save data | How many times this event has fired this life |
| maxOccurrences | int | 1-5 | Event definition | Maximum allowed firings |
| REPETITION_PENALTY | float | 0.5 | Tuning knob | How much to penalize repeated events |

**Expected output**: First firing = full weight. Second of 3 max = weight × 0.83.
Prevents the same event dominating even when technically eligible.

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| No eligible events for a year | Life Event Generator falls back to a universal "quiet year" pool of generic minor events that have no conditions. Every year must have at least 1 event. | No empty years — even uneventful years have texture. |
| Prerequisite event was never fired | Event remains ineligible for this life. It may fire in a different playthrough where prerequisites are met. | Prerequisites create narrative chains; they shouldn't be bypassed. |
| Conflicting effects from simultaneous events | Effects are applied sequentially in event fire order. Each effect sees the result of the previous one. | Deterministic ordering prevents race conditions. |
| Template variable refers to a relationship that no longer exists | Variable falls back to a generic substitute: "{your friend}" becomes "a classmate" or "a neighbor." | Graceful degradation over error. |
| Event text references a character state that changed between event selection and presentation | Event text is generated at selection time using current state, not at presentation time. Brief delay is acceptable. | Prevents jarring inconsistencies like "You feel wealthy" when Wealth just dropped. |
| Player sees a choice they've seen before (in a different life) | This is expected and desired — the same crossroads with different context. The variation comes from different character state, not different choice text. | Replayability comes from different outcomes, not different prompts. Familiar crossroads feel meaningful when you know what the other path held. |
| Delayed effect queue grows very large | Cap at 50 active delayed effects. If exceeded, oldest low-impact effects are silently expired. | Prevents memory bloat in extremely long or eventful lives. |
| Event at maxOccurrences during weight calculation | Event is removed from the eligibility pool entirely before weight normalization. Freshness score does NOT apply to exhausted events — they are filtered out, not weighted to zero. | Prevents exhausted events from polluting the probability distribution. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Life Event Generator | This is read by | Provides the event pool and schemas | Hard |
| Choice & Consequence System | This is read by | Provides effect definitions | Hard |
| Event Presentation Layer | This is read by | Provides content and format | Hard |
| Content Authoring Schema | Validates this | Validates event data against schemas | Soft |
| Character State Model | Referenced by | Conditions/effects reference state model structures | Structural |
| Life Stage Definitions | Referenced by | Events reference stage names and categories | Structural |
| Save / State Persistence | Referenced by | Fired event tracking for maxOccurrences/prerequisites | Soft |

**This system has NO upstream dependencies.** It is pure content data.

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| REPETITION_PENALTY | 0.5 | 0.1-1.0 | Repeated events are more heavily penalized | Repeated events stay relevant longer |
| MAX_DELAYED_EFFECTS | 50 | 20-100 | More consequences can be in flight simultaneously | Fewer in-flight consequences, simpler state |
| RARE_EVENT_BASE_WEIGHT | 10 | 1-25 | Rare events are more common | Rare events are truly rare |
| COMMON_EVENT_BASE_WEIGHT | 60 | 30-80 | Common events dominate selection | More variety in event selection |
| UNIVERSAL_FALLBACK_WEIGHT | 20 | 5-50 | Generic events fire more often | Generic events are a last resort |
| MIN_TEMPLATE_VARIATIONS | 10 | 5-30 | Templates must produce more unique text | Simpler templates are acceptable |

## Acceptance Criteria

- [ ] Event schema validates correctly (all required fields present, types match)
- [ ] Condition evaluation correctly checks all 6 condition types against Character State Model
- [ ] Effect application correctly modifies all 6 Character State Model layers
- [ ] Delayed effects are queued and fire at the correct future age
- [ ] Template variable substitution produces grammatically correct text
- [ ] Template variables with relationship sources fall back gracefully when relationship is missing
- [ ] Weight normalization produces valid probability distribution (sums to 1.0)
- [ ] Freshness score correctly reduces weight for repeated events
- [ ] maxOccurrences is enforced — exhausted events never fire
- [ ] Prerequisites are enforced — events with unmet prerequisites are never selected
- [ ] Exclusions are enforced — mutually exclusive events cannot both fire
- [ ] MVP content meets target: 40 minor templates + 20 major events
- [ ] At least 1 event fires per year in any state combination (no empty years)
- [ ] Event data loads from JSON files within 100ms at startup
- [ ] All event content is externalized in data files, not hardcoded

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should LLM-generated content be used for minor event template pools? | Game Designer | During prototyping | Could 10x the variation pool but quality is uncertain |
| Should major events have multiple narrative "voices" based on personality spectrums? | Narrative Director | During Event Presentation Layer design | A brave character might narrate differently than a cautious one |
| Should event content be moddable (user-created events)? | Technical Director | Post-v1.0 | Community content could solve the volume problem permanently |
| Optimal balance between handcrafted major events and procedural minor events? | Game Designer | After MVP playtesting | Current 40/60 split is a hypothesis |
