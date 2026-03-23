# Sprint 8 — 2026-07-27 to 2026-08-16

## Sprint Goal

Final integration, bug fixing, PWA setup, and MVP release. Ensure all systems
work together cleanly, add PWA manifest and service worker, fix any remaining
issues, and verify all MVP success criteria are met.

## Tasks

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S8-01 | PWA manifest + icons | Add web app manifest with LifePath branding, theme colors, icon placeholders. | 2 |
| S8-02 | Service worker for offline | Configure Next.js for offline capability via next-pwa or manual SW. Cache static assets. | 3 |
| S8-03 | Title screen — "Explore Tree" button | Wire the third nav option on the title screen to load the tree if lives exist. | 1 |
| S8-04 | Save/load integration with tree | Ensure "Continue" loads correctly, new life clears old active save, tree persists across sessions. | 2 |
| S8-05 | Full integration test — multi-life tree | Simulate 2 lives, verify tree has 2 entries, branch replay produces a 3rd life. | 3 |
| S8-06 | MVP success criteria verification | Run through each criterion from the milestone doc and verify pass/fail. | 2 |
| S8-07 | Bug fixes from verification | Fix any issues found during S8-06. | 4 |

### Should Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S8-08 | Loading states | Add loading spinners/skeletons for async operations (save load, tree load). | 1 |
| S8-09 | Error boundaries | Wrap key components in React error boundaries so crashes show a recovery UI. | 2 |
