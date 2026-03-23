# Sprint 4 — 2026-05-04 to 2026-05-24

## Sprint Goal

Polish the playable loop: wire magnitude scaling and narrative hints into gameplay,
add early life events (Infancy/Early Childhood), expand presentation formats, and
write integration tests that verify a full life plays through correctly.

## Tasks

### Must Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S4-01 | Wire magnitude scaling into choice effects | Apply vulnerability/resilience scaling when processing choice effects in the timeline runner. | 2 |
| S4-02 | Wire consequence hints into timeline | After a choice, show narrative hints as timeline entries when attribute changes are ≥5. | 2 |
| S4-03 | Early life events (Infancy + Early Childhood) | Author 6 minor templates for ages 0-5. No choices — observation only. | 2 |
| S4-04 | Visual novel presentation format | Update the major event overlay to render dialogue lines sequentially (speaker + text) before showing choices. | 3 |
| S4-05 | Echo event presentation | Style echo/delayed events distinctly on the timeline — purple accent, italic text with "Years ago..." prefix. | 1 |
| S4-06 | Integration test — full life simulation | Test that runs a complete life (birth → death) programmatically, verifying: events fire, choices apply, drifts work, death triggers, no crashes. | 4 |
| S4-07 | Integration test — save/load round-trip | Test that serialization → deserialization preserves a mid-life character correctly. | 2 |

### Should Have

| ID | Task | Description | Est. Hours |
|----|------|-------------|-----------|
| S4-08 | Starting conditions variety test | Test that 100 generated characters produce meaningful variety in region, class, attributes. | 2 |
| S4-09 | Event category coverage check | Verify each life stage has events in its unlocked categories. Log gaps. | 2 |
