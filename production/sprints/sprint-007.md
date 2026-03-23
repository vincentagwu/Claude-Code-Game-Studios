# Sprint 7 — 2026-07-06 to 2026-07-26

## Sprint Goal

Build the Branching Tree Visualizer: track branch points during gameplay, store
completed lives, render an interactive SVG tree of decisions taken, and enable
replaying from any branch point. The player can now see "the road not taken."

## Tasks

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S7-01 | Branch point tracking | During gameplay, snapshot CharacterState at major choices marked branchPoint:true. Store chosen + alternate options. | 3 |
| S7-02 | Life tree data store | Persistent store (IndexedDB) for completed lives: epitaph, branch points, death age. Track parent-child life links. | 3 |
| S7-03 | Save completed life on death | When a life ends, save the completed LifeRecord to the tree store with all branch points and epitaph. | 2 |
| S7-04 | Tree visualization page (/tree) | SVG-based tree showing completed lives as nodes, branch points as decision markers. Vertical layout, scroll/zoom. | 5 |
| S7-05 | Branch replay | Click an unexplored branch → start a new life from that state snapshot with the alternate choice applied. | 4 |
| S7-06 | Tree navigation UI | "View Tree" from death screen and title screen work correctly. Back to title from tree. | 2 |
| S7-07 | Tests for tree features | Unit tests for branch point tracking, life tree store, branch replay logic. | 3 |

### Should Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S7-08 | Life summary on tree node hover | Hovering/clicking a life node shows a mini epitaph (name, age, headline). | 2 |
