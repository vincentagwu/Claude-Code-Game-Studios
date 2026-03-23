# ADR-003: Event and Content Data Format

**Status**: Accepted
**Date**: 2026-03-22
**Decision Makers**: User + technical-director

## Context

LifePath's content — life events, choices, consequences, templates — is
data-driven. The Event Content Database GDD specifies ~100 minor event templates
(producing ~1,500 variations) and ~61 major events for v1.0. This content must be:

- Authorable by a solo developer without specialized tools
- Validatable at build time (catch errors before runtime)
- Loadable at startup within 100ms
- Extensible (easy to add new events without code changes)
- Type-safe (TypeScript schemas enforced)

## Options Considered

### 1. JSON files in the repository
- **Pros**: Human-readable, Git-trackable, no build step needed, TypeScript can
  validate via JSON Schema or Zod
- **Cons**: No comments in JSON, verbose, large files become unwieldy

### 2. YAML files compiled to JSON
- **Pros**: Supports comments, more readable for narrative text, compiles to JSON
- **Cons**: Extra build step, YAML parsing edge cases, less native to TypeScript

### 3. TypeScript data files (`as const`)
- **Pros**: Full type safety at authoring time, IDE autocomplete, comments,
  no separate validation step needed
- **Cons**: Bundled with code (not truly external), harder to mod/extend post-build

### 4. Headless CMS (Strapi, Sanity, etc.)
- **Pros**: Visual editing UI, content preview, collaboration features
- **Cons**: Infrastructure cost, network dependency (breaks offline), overkill for
  solo dev, adds complexity

## Decision

**TypeScript data files** (Option 3) for MVP. Migrate to JSON + validation for v1.0
if modding support is needed.

### Rationale

1. **Full type safety during authoring**: When writing `courage: +15`, TypeScript
   catches invalid field names, wrong types, and missing required fields immediately.
   With 200+ events to author, preventing errors at write-time saves enormous
   debugging effort.
2. **IDE autocomplete**: Authoring events with full autocomplete for condition types,
   effect operations, format options, and spectrum names. Massively speeds up content
   creation for a solo dev.
3. **No validation step**: `as const` objects are validated by the TypeScript compiler.
   No need for JSON Schema, Zod, or runtime validation libraries.
4. **Comments**: Narrative events benefit from inline comments explaining design intent.
5. **Tree-shaking**: Unused events can be dead-code eliminated in production builds.

### File Structure

```
src/data/
├── events/
│   ├── minor/
│   │   ├── childhood.ts       // Minor templates for childhood stage
│   │   ├── adolescence.ts     // Minor templates for teen stage
│   │   └── ...                // One file per stage
│   ├── major/
│   │   ├── education.ts       // Major events: education category
│   │   ├── career.ts          // Major events: career category
│   │   └── ...                // One file per category
│   ├── crisis/
│   │   └── ...                // Crisis events
│   └── fallback.ts            // Universal fallback events
├── names/
│   ├── north-american.ts      // Name pool for North American region
│   └── ...                    // One file per region
├── starting-conditions/
│   ├── regions.ts             // Region definitions
│   ├── classes.ts             // Socioeconomic class definitions
│   └── families.ts            // Family structure definitions
└── index.ts                   // Re-exports all content, typed
```

### Type Definitions

```typescript
// src/types/events.ts — generated from GDD schemas
export interface LifeEvent { ... }   // From Event Content Database GDD
export interface Effect { ... }       // From Event Content Database GDD
export interface Condition { ... }    // From Event Content Database GDD
export interface Choice { ... }       // From Event Content Database GDD
```

### Migration Path to JSON (v1.0+)

If modding support or external content tools become needed:
1. Extract TypeScript data to JSON files
2. Add Zod schemas matching the TypeScript interfaces
3. Validate JSON at build time via a pre-build script
4. Load JSON at runtime instead of importing TypeScript modules

This migration is straightforward because the data shape is identical.

## Consequences

- **Positive**: Maximum type safety and IDE support for content authoring
- **Positive**: Errors caught at compile time, not runtime
- **Positive**: No extra dependencies (no JSON Schema, Zod, or validation libraries for MVP)
- **Positive**: Content is version-controlled with full diff history
- **Negative**: Content is bundled with code (not externally editable post-build)
- **Negative**: Large content files increase bundle size (mitigated by code-splitting)
- **Negative**: Migration to JSON required if modding support is added

## References

- Event Content Database GDD: `design/gdd/event-content-database.md`
- Starting Conditions Generator GDD: `design/gdd/starting-conditions-generator.md`
- Life Event Generator GDD: `design/gdd/life-event-generator.md`
