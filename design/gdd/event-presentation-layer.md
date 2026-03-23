# Event Presentation Layer

> **Status**: Designed
> **Author**: User + ux-designer, ui-programmer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Every Choice Echoes (makes consequences visible)

## Overview

The Event Presentation Layer renders life events in the appropriate visual format
based on their type and format specification. It receives events from the Timeline
Engine (sourced via the Life Event Generator), determines how to display them
(timeline popup, scenario card, visual novel scene, or mini-narrative), captures
player choices, and routes those choices to the Choice & Consequence System. This
is the primary interface between the player and the game's content.

The system implements the game's **mixed format** approach: minor events appear as
brief popups on the scrolling timeline, while major events use one of three rich
formats (scenario card, visual novel, mini-narrative) for deeper engagement. The
format for each event is defined in the Event Content Database.

## Player Fantasy

Minor events should feel like memories flickering past — brief, atmospheric, part
of life's texture. Major events should feel like time stopping — the world pauses,
the format shifts, and suddenly this moment has your full attention. The contrast
between the two creates the game's emotional rhythm: stream, stream, stream, STOP.
The player should feel the shift from observer to decision-maker every time a major
event appears.

## Detailed Design

### Core Rules

#### Presentation Formats

| Format | Used For | Visual | Interaction | Duration |
|--------|---------|--------|-------------|----------|
| **Timeline Popup** | Minor events (observations) | Brief text appearing on the scrolling timeline, left-aligned with age marker | None (read-only) or micro-choice (inline tap) | 1.5-4 seconds (based on text length) |
| **Scenario Card** | Binary/simple major choices | Full-width card overlaying the timeline. Description + 2-4 choice buttons. Clean, minimal. | Tap a choice button | Until player chooses |
| **Visual Novel** | Relationship/dialogue events | Character portrait area + dialogue text + choice buttons. Feels intimate, character-focused. | Read through dialogue, then choose | Until player finishes reading + chooses |
| **Mini-Narrative** | Complex events (3-5 screens) | Multi-step sequence: setup → development → choice. Each screen is a page with text and optional illustration placeholder. | Tap to advance, then choose on final screen | 30-90 seconds reading + choice |
| **Echo Event** | Delayed consequence firing | Special timeline popup with a distinct "echo" visual style (glowing border, connecting line to past). Narrative text references original choice. | None (read-only) | 3-5 seconds |

#### Timeline Popup Rendering

```
┌─────────────────────────────────────────┐
│ Age 8  ○ You made your first best       │
│           friend at school. Her name    │
│           was Amara.                    │
│                                         │
│ Age 8  ○ You scraped your knee on the   │
│           playground. Mom put a          │
│           bandaid on it.               │
│                                         │
│ Age 9  ◐ Your teacher asks if you want  │ ← Micro-choice indicator
│           to join the science fair.     │
│           [Yes!] [No thanks]            │ ← Inline choice buttons
│                                         │
│ Age 9  ○ The summer felt endless.       │
└─────────────────────────────────────────┘
```

**Rules**:
1. Popups appear from the bottom of the timeline and scroll upward
2. Text fades in, holds for display_duration, then remains visible but dimmed
3. Micro-choice popups show inline buttons. If no choice within 3 seconds,
   auto-resolve with default (first option)
4. Maximum 3 popups visible at once. Older popups scroll up and fade.
5. Pop-up dot style: ○ = observation, ◐ = micro-choice, ★ = major event trigger

#### Scenario Card Rendering

```
┌─────────────────────────────────────────┐
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║                                   ║  │
│  ║  "The acceptance letter sits on   ║  │
│  ║   the kitchen table. Your parents ║  │
│  ║   exchange a look you can't       ║  │
│  ║   quite read."                    ║  │
│  ║                                   ║  │
│  ║  ┌─────────────────────────────┐  ║  │
│  ║  │  Accept — go to college     │  ║  │
│  ║  └─────────────────────────────┘  ║  │
│  ║  ┌─────────────────────────────┐  ║  │
│  ║  │  Decline — enter workforce  │  ║  │
│  ║  └─────────────────────────────┘  ║  │
│  ║                                   ║  │
│  ╚═══════════════════════════════════╝  │
│                                         │
│  (timeline dimmed behind)               │
└─────────────────────────────────────────┘
```

**Rules**:
1. Card appears with a slide-up animation, dimming the timeline behind it
2. Setup text is displayed first with a brief typing/reveal animation
3. Choice buttons appear after setup text is fully revealed (0.5s delay)
4. Selected choice gets a brief highlight animation before consequence text shows
5. Consequence text displays for CONSEQUENCE_DISPLAY_MS, then card dismisses

#### Visual Novel Rendering

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────┐                            │
│  │         │  "I know this is hard      │
│  │ Portrait│   for you. But I think     │
│  │  Area   │   we need to talk about    │
│  │         │   what happened."          │
│  └─────────┘                            │
│                                         │
│  ── Dad, age 42 ──────────────────────  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ "You're right. Let's talk."      │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ "I don't want to talk about it." │   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Rules**:
1. Full-screen overlay, completely replacing the timeline temporarily
2. Portrait area uses abstract/minimalist character representation (silhouette
   with distinguishing feature, matching the art style)
3. Dialogue text reveals with a typewriter effect (skippable by tapping)
4. Multiple dialogue exchanges can occur before the choice appears
5. Choice buttons appear after all dialogue is revealed

#### Mini-Narrative Rendering

Multi-screen sequence with page indicators:

```
Screen 1/3: Setup
Screen 2/3: Development
Screen 3/3: Choice

Player taps to advance between screens.
Choice only appears on the final screen.
```

**Rules**:
1. Page indicator dots at bottom (● ○ ○ for screen 1 of 3)
2. Each screen has a text block with optional illustration area (placeholder for MVP)
3. Tap or swipe to advance between screens
4. Cannot go backward (time never stops, even in narrative)
5. Choice screen follows the Scenario Card format

#### Echo Event Rendering

Delayed consequence events from the Choice & Consequence System get special treatment:

```
┌─────────────────────────────────────────┐
│ Age 35 ✧ ╔════════════════════════════╗ │
│          ║ Remember that stranger you  ║ │
│          ║ helped at age 22? He's now  ║ │
│          ║ the CEO of a tech company.  ║ │
│          ║ He remembers you too.       ║ │
│          ╚════════════════════════════╝ │
│              ↑ connected to Age 22      │ ← Visual connection line
└─────────────────────────────────────────┘
```

**Rules**:
1. Echo events have a distinct visual style: glowing border, special icon (✧)
2. A subtle visual "thread" connects the echo to its source age on the timeline.
   The echo event carries `sourceAge` metadata (from Choice & Consequence System's
   DelayedEffect.sourceAge field) to render the connection line.
3. Narrative text always references the original choice explicitly
4. Echo events display for ECHO_DISPLAY_MS (longer than normal popups)
5. Echo events never have choices — they're pure consequence revelation

#### State-Aware Narrative Text

The Event Presentation Layer can inject character state into narrative text:

```
Template: "Your {education_bucket} education {education_reaction}"
If Education >= 60: "Your solid education opens doors you didn't expect"
If Education < 40: "Your lack of formal education means you have to work twice as hard"
```

This is handled by replacing state tokens in event text with the current display
bucket values from the Character State Model.

### States and Transitions

| State | Description |
|-------|------------|
| Idle | No event being presented |
| Presenting Minor | Timeline popup visible, auto-timing |
| Presenting Micro-Choice | Inline choice visible, waiting for tap or timeout |
| Presenting Major | Full overlay (card/VN/mini-narrative), timeline paused |
| Showing Consequence | Choice made, consequence text displaying |
| Presenting Echo | Delayed effect event visible with special styling |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Timeline Engine** | Receives from | Events queued for presentation. Signals when timeline should pause/resume. |
| **Choice & Consequence System** | Sends to | Player choices routed for processing. Echo events received for display. |
| **Character State Model** | Reads | State tokens for narrative text injection. Display bucket values. |
| **Life Stage Definitions** | Reads | Visual theme (colors, typography) for current stage styling. |
| **App Shell** | Contained by | Renders within the TimelineView. Major events use App Shell's modal system. |
| **Event Content Database** | Reads | Event format, content, and choice definitions. |

## Formulas

### Display Duration

```
popup_duration_ms = max(MIN_DISPLAY_MS, word_count * MS_PER_WORD)
echo_duration_ms = popup_duration_ms * ECHO_MULTIPLIER
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| MIN_DISPLAY_MS | int | 1500 | Tuning knob | Minimum popup visibility |
| MS_PER_WORD | int | 200 | Tuning knob | Reading speed estimate |
| ECHO_MULTIPLIER | float | 1.5 | Tuning knob | Echo events stay longer |

### Typewriter Speed (Visual Novel)

```
reveal_interval_ms = BASE_CHAR_INTERVAL * (1 + dramatic_factor)
dramatic_factor = 0.5 if event.tags.includes("emotional") else 0
```

**Expected output**: Normal dialogue: 30ms per character. Emotional dialogue: 45ms.

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Major event triggers while popup is displaying | Popup immediately fades. Major event takes priority. | Major events are always highest priority. |
| Player spams "skip" on visual novel dialogue | Typewriter reveals all text immediately. Then choice buttons appear. | Respect player time on replays. |
| Choice references a relationship the player doesn't recognize | Include a brief parenthetical: "Marcus (your childhood friend from school)" | Context helps players with many relationships. |
| Screen too narrow for 4 choice buttons | Stack buttons vertically. Scroll if needed. | Mobile support requires flexible layouts. |
| Echo event references an event from 30+ years ago | Include the age and a detail: "Remember when you helped that stranger at age 22 near the train station?" | Specificity helps players recall distant choices. |
| Multiple echo events fire in same year | Present sequentially with a brief pause between each. | Multiple consequences can converge — each deserves attention. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| Timeline Engine | Receives from | Events to present | Hard |
| Choice & Consequence System | Sends to, receives from | Choice results, echo events | Hard |
| Character State Model | Reads | State tokens for text | Soft |
| Life Stage Definitions | Reads | Visual theme | Soft |
| App Shell | Contained by | Render target | Hard |
| Event Content Database | Reads | Format, content | Hard |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| MIN_DISPLAY_MS | 1500 | 800-3000 | Popups stay longer | Faster scrolling |
| MS_PER_WORD | 200 | 100-400 | Slower reading assumption | Faster reading |
| ECHO_MULTIPLIER | 1.5 | 1.0-2.5 | Echo events linger | Echo events pass quickly |
| MICRO_CHOICE_TIMEOUT | 3000 | 1500-8000 | More time for inline choices | Faster auto-resolve |
| CARD_APPEAR_DELAY | 500 | 200-1000 | More dramatic card reveal | Snappier |
| TYPEWRITER_BASE_INTERVAL | 30 | 15-60 | Slower text reveal | Faster text reveal |
| MAX_VISIBLE_POPUPS | 3 | 2-5 | More timeline density visible | Cleaner timeline |

## Acceptance Criteria

- [ ] Timeline popups render with correct text, timing, and fade behavior
- [ ] Micro-choices show inline buttons and auto-resolve after timeout
- [ ] Scenario cards render with setup text + choice buttons, dimming timeline
- [ ] Visual novel scenes render with portrait area + dialogue + typewriter effect
- [ ] Mini-narratives support multi-screen sequences with page indicators
- [ ] Echo events render with distinct visual style and connection line
- [ ] State-aware narrative text correctly substitutes character state tokens
- [ ] Player choices are correctly routed to Choice & Consequence System
- [ ] Major events pause the timeline; minor events don't
- [ ] All formats responsive across desktop, tablet, mobile breakpoints
- [ ] Typewriter effect is skippable by tapping
- [ ] Visual theme matches current life stage (colors, typography)
- [ ] No visual overlap between simultaneous popups
- [ ] Consequence text displays for configured duration before dismissal
- [ ] All animations complete within 300ms (no janky transitions)
- [ ] Text renders at readable size on 320px mobile screens

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should major events have ambient sound effects? (rain, school bell, etc.) | Audio Director | During Audio Manager design | Could significantly enhance immersion |
| Should the player be able to re-read past events by scrolling up? | UX Designer | During implementation | Timeline currently scrolls — but should past events be tappable for full text? |
| Illustration placeholders for MVP — how minimal? (just icons? color blocks?) | Art Director | During visual design | Need to define MVP art level |
| Should consequence text hint at the magnitude? ("This will change everything" vs. just showing what happens) | Game Designer | During playtesting | Dramatic hints vs. organic discovery |
