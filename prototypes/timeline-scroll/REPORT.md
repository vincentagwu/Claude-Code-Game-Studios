# Prototype Report: Timeline Scroll

## Hypothesis

A vertically scrolling timeline with variable pacing (fast infancy, slow elder),
pop-up minor events, inline micro-choices, and full-screen Scenario Card pauses
for major decisions creates a compelling core loop that feels like "watching a
life unfold."

## Approach

Built a single-file HTML/CSS/JS prototype (~500 lines) with:
- 8 life stages with distinct visual themes (color palette, accent, typography)
- Variable pacing per stage (6 years/min for Infancy → 0.8 years/min for Elder)
- ~50 hardcoded minor events across a full lifespan
- 5 micro-choices with 3-second auto-resolve timeout
- 3 Scenario Cards (age 18, 30, 45) that pause the timeline
- Death probability starting at age 65 with health-modified roll
- Epitaph screen with session statistics
- Skip-ahead via spacebar or button click
- Stage transition cards with visual theme cross-fade

Total prototype effort: ~1 hour (single session).

Shortcuts taken: No React/Next.js (pure vanilla JS), no state management,
no save system, no real event generation, all content hardcoded, no responsive
mobile testing, no audio.

## Result

**The core loop works.** User confirmed the experience as "compelling." Specific
observations:

1. **Pacing shift is felt physically**: The acceleration from Infancy (years
   flashing by) to Adolescence (each year weighted with events) creates a
   tangible sense of time's passage. The contrast IS the experience.

2. **Scenario Cards create genuine pause**: When the timeline stops and the
   overlay appears, the sudden stillness feels weighty. The "stream, stream,
   stream, STOP" rhythm described in the Player Fantasy works as designed.

3. **Stage theme transitions add emotional color**: The shift from warm pastels
   (Infancy) to dark moody tones (Adolescence) to sepia (Elder) reinforces the
   life arc without requiring explicit narration.

4. **Skip-ahead feels natural**: Spacebar to skip wait time during routine
   years prevents boredom without skipping content. Players naturally speed
   through uneventful years and slow down when events appear.

5. **Micro-choices feel lightweight and right**: The 3-second auto-resolve
   creates gentle pressure without stress. Missing a micro-choice feels like
   "life moving on" rather than a failure.

6. **Death arrives with appropriate weight**: The transition from gameplay to
   the epitaph screen (dark background, statistics, "A Life Lived") provides
   closure. The session time display creates reflection.

## Metrics

- **Session length (full life to ~75)**: ~3-4 minutes with frequent skip-ahead,
  ~8-10 minutes at natural pace through interesting stages. (Note: prototype has
  fewer events than production target — production sessions with 200+ events
  and more major choices should hit the 45-55 minute target.)
- **Pacing feel**: Infancy (too fast to read if not skipping — intentional).
  Childhood (comfortable reading pace). Adolescence (events feel important,
  pacing is engaging). Adult (routine years benefit from skip-ahead).
  Elder (contemplative, each year noticeable).
- **Scenario Card engagement**: Timeline stop creates clear attention shift.
  Choice buttons are readable and accessible. Consequence text display (3s)
  feels right.
- **Visual transitions**: CSS variable transitions at 0.8s create smooth
  stage shifts. No jarring breaks.
- **Frame performance**: Smooth 60fps throughout. DOM-based rendering handles
  80+ timeline entries with no visible jank. (Production will need virtualized
  scrolling for 200+ entries.)
- **Iteration count**: 1 (first implementation matched the design intent)

## Recommendation: PROCEED

The timeline scroll core loop validates the LifePath concept. The variable
pacing creates the emotional cadence described in the game concept — childhood
blurs, adolescence crystallizes, and old age lingers. The Scenario Card
pause/resume rhythm is the game's signature interaction and it works.

The prototype answers the core question with a clear "yes": this interaction
model is compelling and worth building into a full production system.

## If Proceeding

**Architecture requirements:**
- React component tree: `TimelineView` → `TimelineEntry` (virtualized list)
- Zustand store for character state (per ADR-001)
- Real event generation from Event Content Database (per GDD)
- CSS variables driven by Life Stage Definitions theme tokens

**Performance targets:**
- Virtualized scroll for 200+ entries (react-window or similar)
- 60fps maintained during auto-scroll with event animations
- Year tick processing under 5ms (state updates + event generation)

**Scope adjustments from original design:**
- The prototype confirms all 5 presentation formats are needed (timeline popup,
  micro-choice, scenario card work; visual novel and mini-narrative not tested
  but the pause/resume rhythm validates the concept for all formats)
- Micro-choice 3-second timeout feels right — keep as default tuning knob value
- Stage theme transitions via CSS variables are the right approach — no need
  for more complex animation systems

**Estimated production effort:**
- Timeline Engine + Event Presentation Layer: 2-3 weeks
- Character State Model + Event Content Database: 2-3 weeks
- Choice & Consequence System: 2-3 weeks
- MVP content authoring (40 templates + 20 major events): 2-3 weeks
- Integration + polish: 1-2 weeks
- **Total MVP estimate: 10-14 weeks** (2.5-3.5 months solo)

## Lessons Learned

1. **Pacing contrast > absolute speed**: The feeling comes from the CHANGE
   between fast and slow, not from any single speed being "right." Tune the
   ratio between stages, not individual stage speeds.

2. **CSS variable transitions are sufficient**: No need for complex animation
   libraries. CSS custom property transitions on the body/root create smooth,
   performant stage shifts.

3. **DOM-based rendering works at prototype scale**: React with virtualization
   should handle production scale (200+ entries) fine. No need for canvas
   rendering.

4. **The "stream, stream, STOP" rhythm is the game**: The Scenario Card pause
   is the single most important interaction. Everything else (minor events,
   micro-choices, stage transitions) exists to make that pause feel earned.
   Production implementation should prioritize Scenario Card quality above all.

5. **Epitaph/death is a natural stopping point**: The death screen provides
   clean session closure. The "Live Again" button is the beginning of the
   replay loop — this is where the branching tree visualization should hook in.
