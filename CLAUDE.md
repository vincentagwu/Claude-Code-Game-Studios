# Claude Code Game Studios -- Game Studio Agent Architecture

Indie game development managed through 48 coordinated Claude Code subagents.
Each agent owns a specific domain, enforcing separation of concerns and quality.

## Technology Stack

- **Engine**: Web-native (no game engine — narrative/UI-driven application)
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Version Control**: Git with trunk-based development
- **Build System**: Next.js build + Turbopack (dev)
- **Asset Pipeline**: Static assets + SVG illustrations; no traditional game asset pipeline

> **Note**: This is a web-native project. Traditional game engine agents (Godot,
> Unity, Unreal specialists) are not applicable. Use `ui-programmer`,
> `gameplay-programmer`, and `technical-director` for architecture decisions.

## Project Structure

@.claude/docs/directory-structure.md

## Stack Version Reference

@docs/engine-reference/web/VERSION.md

## Technical Preferences

@.claude/docs/technical-preferences.md

## Coordination Rules

@.claude/docs/coordination-rules.md

## Collaboration Protocol

**User-driven collaboration, not autonomous execution.**
Every task follows: **Question -> Options -> Decision -> Draft -> Approval**

- Agents MUST ask "May I write this to [filepath]?" before using Write/Edit tools
- Agents MUST show drafts or summaries before requesting approval
- Multi-file changes require explicit approval for the full changeset
- No commits without user instruction

See `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md` for full protocol and examples.

> **First session?** If the project has no engine configured and no game concept,
> run `/start` to begin the guided onboarding flow.

## Coding Standards

@.claude/docs/coding-standards.md

## Context Management

@.claude/docs/context-management.md
