# Web Stack — Version Reference

| Field | Value |
|-------|-------|
| **Framework** | Next.js 15 (React 19) |
| **Language** | TypeScript 5.x (strict mode) |
| **Project Pinned** | 2026-03-22 |
| **Last Docs Verified** | 2026-03-22 |
| **LLM Knowledge Cutoff** | May 2025 |

## Knowledge Gap Assessment

**Risk Level: LOW-MEDIUM**

Next.js 15 and React 19 were released in late 2024 / early 2025, which is
near the edge of the LLM's training data. Core APIs are well-known, but
some newer features (React Server Components patterns, Next.js 15-specific
features) may need verification.

Key areas to verify when uncertain:
- Next.js App Router patterns (stable but evolving)
- React 19 Server Components / Server Actions
- React 19 `use()` hook and new APIs
- Next.js 15 caching behavior (changed from 14)

## Verified Sources

- Next.js docs: https://nextjs.org/docs
- React docs: https://react.dev
- Next.js 15 release: https://nextjs.org/blog/next-15
- React 19 release: https://react.dev/blog/2024/12/05/react-19

## Stack Components

| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.x | Framework (SSR, routing, API routes) |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (TBD — to be confirmed during setup) |
| Jest | 29.x | Unit testing |
| Playwright | 1.x | E2E testing |
| React Testing Library | 16.x | Component testing |
