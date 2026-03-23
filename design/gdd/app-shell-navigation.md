# App Shell & Navigation

> **Status**: Designed
> **Author**: User + ux-designer, ui-programmer
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Time Never Stops (immersive single-screen flow)

## Overview

The App Shell is the Next.js application container that holds all game views and
manages navigation between them. It follows a **context-driven navigation** model:
the visible interface changes based on game state rather than player-driven tab
switching. During a life, the timeline dominates with the dashboard accessible as
a slide-out panel. After death, the epitaph and branching tree become the primary
views. This immersive approach keeps players in the story during gameplay and
shifts to exploration mode between lives.

The App Shell also manages responsive layout (desktop and mobile), PWA
configuration (offline support, installability), and global state providers
(game state context, theme/stage visual identity).

## Player Fantasy

The player should never feel like they're using an "app" — they should feel like
they're living a life. Navigation should be invisible during gameplay. The timeline
fills the screen; the dashboard is there when you want it but never intrudes. After
death, the transition to the tree view should feel like stepping back to see the
bigger picture — a natural shift in perspective, not a UI context switch.

## Detailed Design

### Core Rules

#### Application States

The app has 4 top-level states that determine what the player sees:

| App State | Primary View | Secondary Access | Entry Condition |
|-----------|-------------|-----------------|-----------------|
| **Title** | Title screen + New Life / Continue / Settings | None | App launch, return from tree |
| **Living** | Timeline scroll (full screen) | Dashboard (slide-out panel), Settings (modal) | New life started or continued |
| **Death** | Epitaph view (full screen) | None during epitaph animation | Character death triggered |
| **Tree** | Branching tree explorer (full screen) | Life details (slide-out), New Life / Continue Generation | Epitaph dismissed, or direct access from title |

#### Route Structure (Next.js App Router)

```
/                     → Title screen (app state: Title)
/life                 → Active life timeline (app state: Living)
/life/dashboard       → Dashboard slide-out panel (overlay, not a route change)
/death                → Epitaph view (app state: Death)
/tree                 → Branching tree explorer (app state: Tree)
/tree/[branchId]      → Specific branch detail view
/settings             → Settings page (accessible from any state)
```

**Rules**:
1. During **Living** state, the player cannot navigate away from `/life` except
   via the Settings modal. There is no back button, no tab bar, no escape from
   the timeline. Time never stops (until it does).
2. **Death** state is entered automatically — the player doesn't navigate to it.
   The timeline fades and the epitaph appears.
3. **Tree** state is entered after dismissing the epitaph. From the tree, the
   player can start a new life (returns to Living) or return to title.
4. The browser back button is intercepted during Living state to prevent
   accidental game exit. A confirmation dialog appears.
5. Deep links to `/tree/[branchId]` are supported for sharing (MVP — basic
   routing support; full sharing UX is post-MVP).

#### Layout Structure

```
AppShell
├── ThemeProvider (stage-aware visual identity)
├── GameStateProvider (character state context)
├── AudioProvider (ambient audio control)
├── Header (minimal — age counter, settings icon)
│   ├── [Living] Age display + life stage indicator
│   ├── [Tree] "LifePath" logo + navigation
│   └── [Title] Empty / hidden
├── MainView (full-screen, state-dependent)
│   ├── [Living] TimelineView
│   ├── [Death] EpitaphView
│   ├── [Tree] TreeExplorerView
│   └── [Title] TitleScreenView
├── DashboardPanel (slide-out, Living state only)
│   ├── Attributes tab (7 life attributes as visual indicators)
│   ├── Relationships tab (active relationships list)
│   ├── Life Story tab (accumulated tags as narrative list)
│   └── Personality tab (spectrum labels, qualitative)
└── SettingsModal (accessible from any state)
    ├── Audio toggle
    ├── Text size
    ├── Pacing speed (future: 1x/2x)
    └── About / Credits
```

#### Dashboard Panel Behavior

The dashboard is a slide-out panel during Living state:

1. **Desktop**: Slides in from the right side, occupying ~30% width. Timeline
   continues scrolling (dimmed) in the background.
2. **Mobile**: Slides up from the bottom as a half-sheet. Can be swiped up to
   full screen or swiped down to dismiss.
3. **Access**: Tap/click a subtle icon in the header, or swipe from the right
   edge (mobile).
4. **Timeline pause**: Opening the dashboard does NOT pause the timeline by
   default (minor events continue scrolling). The dashboard is a glance, not a
   deep dive. However, during a major event, the timeline is already paused, so
   the dashboard can be opened without missing anything.
5. **Auto-close**: Dashboard closes automatically when a major event triggers
   (the narrative demands attention).

#### Responsive Breakpoints

| Breakpoint | Layout Behavior |
|------------|----------------|
| Desktop (>1024px) | Timeline centered at 600px max-width. Dashboard slides from right. Comfortable reading experience. |
| Tablet (768-1024px) | Timeline full-width with padding. Dashboard overlays. |
| Mobile (<768px) | Timeline full-width. Dashboard slides up as bottom sheet. Touch gestures for navigation. |

#### PWA Configuration

- **Service Worker**: Cache static assets (fonts, icons, base CSS/JS) for offline start
- **Manifest**: App name "LifePath", theme color adapts to current life stage
- **Offline support**: Game is fully playable offline (all state in localStorage/IndexedDB).
  Save sync requires connectivity.
- **Install prompt**: Shown after completing first life ("Add LifePath to your home screen")

### States and Transitions

| Current State | Trigger | Next State | Transition Effect |
|--------------|---------|------------|-------------------|
| Title | "New Life" button | Living | Fade to black → birth event |
| Title | "Continue" button | Living | Fade to life, resume from save |
| Title | "Explore Tree" button | Tree | Cross-fade to tree view |
| Living | Character death | Death | Timeline fades → epitaph animation (3-5s) |
| Death | Player dismisses epitaph | Tree | Epitaph slides up, tree reveals below |
| Tree | "New Life" (from scratch) | Living | Fade to black → birth event |
| Tree | "Continue Legacy" (play child) | Living | Family tree zooms into child node → birth |
| Tree | "Replay from branch" | Living | Tree zooms into branch point → life resumes |
| Tree | "Back to Title" | Title | Cross-fade |
| Any | Settings icon | Settings modal | Modal overlay (no state change) |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| **Timeline Engine** | Contains | TimelineView renders inside MainView. App Shell provides the viewport. |
| **Event Presentation Layer** | Contains | Event modals/cards render inside TimelineView via App Shell's modal system. |
| **Branching Tree Visualizer** | Contains | TreeExplorerView renders inside MainView. App Shell provides navigation context. |
| **Epitaph / Life Summary Generator** | Contains | EpitaphView renders inside MainView using generated epitaph data. |
| **Save / State Persistence** | Reads/Writes | App Shell triggers save on state transitions (entering Death, leaving Living). Loads save on "Continue." |
| **Character State Model** | Provides context | GameStateProvider wraps the app, making character state available to all child components. |
| **Life Stage Definitions** | Reads | ThemeProvider reads current stage to apply visual identity (colors, typography). |
| **Audio Manager** | Contains | AudioProvider wraps the app, managing ambient audio lifecycle. |

## Formulas

### Transition Timing

```
transition_duration = BASE_TRANSITION_MS + (context_weight * CONTEXT_FACTOR)
```

| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| BASE_TRANSITION_MS | int | 300 | Tuning knob | Minimum transition time |
| context_weight | int | 0-3 | App state | 0 for minor transitions, 3 for death |
| CONTEXT_FACTOR | int | 500 | Tuning knob | Additional time per context weight |

**Expected output**: Dashboard open = 300ms. Title → Living = 800ms. Death transition = 1800ms.

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| Browser back button during Living | Confirmation dialog: "Leave your current life? Progress is auto-saved." | Prevent accidental game exit. |
| Browser tab hidden during Living | Timeline pauses. Resumes when tab becomes visible again. | Prevents the game from "playing itself" in background. |
| Offline with unsaved progress | All state is saved to localStorage every 30 seconds and on every major event. No data loss from going offline. | PWA must be resilient to connectivity loss. |
| Very small screen (<320px) | Timeline text scales down. Dashboard becomes full-screen only (no half-sheet). Minimum viable experience maintained. | Support low-end mobile browsers without breaking layout. |
| Multiple browser tabs | Only one active game session at a time. Second tab shows "LifePath is open in another tab" message. Uses localStorage lock flag with 5-minute timeout. | Prevents save data conflicts. |
| Tab lock becomes stale (crashed tab) | Lock has a 5-minute timeout (TAB_LOCK_TIMEOUT_MS). After timeout, new tab can claim the lock. User sees "Resuming session..." message. | Prevents permanent lockout from crashed tabs. |
| Save in progress when new save triggers | New save is queued (debounced). Only one save operation runs at a time. If queued save waits >5 seconds, it replaces the in-flight save. | Prevents save corruption from concurrent writes. |
| Page refresh during major event | Save triggers before refresh completes (async IndexedDB flush preferred over sync localStorage). On reload, game resumes at the same event. | No progress loss from accidental refresh. |

## Dependencies

| System | Direction | Nature | Hard/Soft |
|--------|-----------|--------|-----------|
| None upstream | — | App Shell has no dependencies | — |
| All UI systems | Downstream | Every UI/presentation system renders inside the App Shell | Hard |
| Save / State Persistence | Bidirectional | App Shell triggers saves and loads saves | Hard |
| Character State Model | Reads | Provides state via React Context | Hard |
| Life Stage Definitions | Reads | Reads visual theme per stage | Soft |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| BASE_TRANSITION_MS | 300 | 100-500 | Smoother but slower transitions | Snappier but more abrupt |
| DEATH_TRANSITION_MS | 1800 | 800-3000 | More dramatic death transition | Quicker, less ceremonial |
| DASHBOARD_WIDTH_DESKTOP | 30% | 20-40% | More dashboard space, less timeline | More timeline space |
| AUTO_SAVE_INTERVAL_MS | 30000 | 10000-60000 | More frequent saves, more IO | Less frequent, higher data loss risk |
| INSTALL_PROMPT_AFTER_LIVES | 1 | 1-3 | Prompt after first life | Prompt after player is more invested |
| TAB_LOCK_TIMEOUT_MS | 300000 | 60000-600000 | Longer timeout before stale lock expires | Faster recovery from crashed tabs |

## Acceptance Criteria

- [ ] All 4 app states (Title, Living, Death, Tree) render correctly
- [ ] State transitions play correct animations
- [ ] Dashboard slides in/out on desktop and mobile with correct responsive behavior
- [ ] Dashboard auto-closes when major event triggers during Living state
- [ ] Browser back button shows confirmation dialog during Living state
- [ ] Timeline pauses when browser tab is hidden
- [ ] Auto-save fires every 30 seconds and on state transitions
- [ ] PWA installs correctly on Chrome, Safari, Firefox
- [ ] Offline play works with no connectivity
- [ ] Multiple tab detection prevents concurrent sessions
- [ ] Responsive layout works at 320px, 768px, and 1440px widths
- [ ] Stage visual theme applies correctly (colors, typography change per life stage)
- [ ] Page refresh during any state resumes correctly from save
- [ ] Deep link to /tree/[branchId] loads correct branch view
- [ ] Initial page load under 3 seconds on broadband, under 5 seconds on 3G
- [ ] Bundle size under 200KB gzipped (initial load)

## Open Questions

| Question | Owner | Target Resolution | Notes |
|----------|-------|-------------------|-------|
| Should the tree be accessible during a life (as a spoiler-free preview), or only after death? | UX Designer | During Branching Tree Visualizer design | Current design: tree only after death. But showing it during life might reinforce "The Road Not Taken" pillar. |
| Keyboard shortcuts for desktop (spacebar to advance, D for dashboard, etc.)? | UX Designer | During implementation | Good for power users and accessibility. |
| Should the dashboard show real-time attribute changes or only update at end-of-year? | Game Designer | During playtesting | Real-time gives immediate feedback but might be distracting. |
