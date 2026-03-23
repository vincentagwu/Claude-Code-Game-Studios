# Technical Preferences

<!-- Populated by /setup-engine. Updated as the user makes decisions throughout development. -->
<!-- All agents reference this file for project-specific standards and conventions. -->

## Engine & Language

- **Engine**: Web-native (Next.js — no game engine)
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript (strict mode)
- **Rendering**: DOM + SVG (timeline scroll, branching tree visualization)
- **Physics**: N/A (narrative/UI-driven — no physics engine needed)

## Naming Conventions

- **Components**: PascalCase (e.g., `TimelineScroll`, `LifeEventCard`)
- **Functions/hooks**: camelCase (e.g., `useLifeState`, `handleChoice`)
- **Variables**: camelCase (e.g., `currentAge`, `lifeEvents`)
- **Files (components)**: PascalCase matching component (e.g., `TimelineScroll.tsx`)
- **Files (utilities/hooks)**: camelCase (e.g., `useLifeState.ts`, `eventGenerator.ts`)
- **Files (routes/pages)**: kebab-case per Next.js convention (e.g., `life-tree/page.tsx`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_LIFE_SPAN`, `LIFE_STAGES`)
- **Types/Interfaces**: PascalCase with no prefix (e.g., `LifeEvent`, `Choice`)
- **CSS/Tailwind**: kebab-case for custom classes, BEM optional for complex components

## Performance Budgets

- **Initial Load**: < 3 seconds on 3G connection
- **Time to Interactive**: < 2 seconds on broadband
- **Bundle Size**: < 200KB initial JS (gzipped)
- **Timeline Scroll**: 60fps smooth scrolling
- **Tree Rendering**: < 100ms for trees with up to 500 nodes
- **Memory Ceiling**: < 100MB browser memory during gameplay

## Testing

- **Framework**: Jest + React Testing Library (unit/integration), Playwright (E2E)
- **Minimum Coverage**: 80% for game logic (event generation, consequence tracking, inheritance)
- **Required Tests**: Choice-consequence chains, event generation variety, generational inheritance, tree state management

## Forbidden Patterns

<!-- Add patterns that should never appear in this project's codebase -->
- [None configured yet — add as architectural decisions are made]

## Allowed Libraries / Addons

<!-- Add approved third-party dependencies here -->
- **Zustand** — State management (ADR-001)
- **idb** — IndexedDB wrapper for cleaner async API (ADR-002)
- Jest + React Testing Library + Playwright — Testing (configured above)

## Architecture Decisions Log

<!-- Quick reference linking to full ADRs in docs/architecture/ -->
- **ADR-001**: State Management — Zustand (selector-based, works outside React, persist middleware)
- **ADR-002**: Data Storage — IndexedDB primary + localStorage signal (async, 50MB+, transactions)
- **ADR-003**: Content Data Format — TypeScript data files for MVP (type-safe authoring, IDE autocomplete)
