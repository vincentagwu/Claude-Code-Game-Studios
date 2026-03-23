/**
 * Event Content Database — TypeScript type definitions.
 *
 * Defines the schema for all life events: minor templates,
 * major events, crisis events, conditions, choices, and effects.
 *
 * @see design/gdd/event-content-database.md
 */

import type { StageName } from "../stages/lifeStages";

// ---------------------------------------------------------------------------
// Conditions — determine when an event is eligible to fire
// ---------------------------------------------------------------------------

export type ConditionType =
  | "attribute"
  | "spectrum"
  | "tag"
  | "flag"
  | "relationship"
  | "identity";

export type ComparisonOperator = ">" | "<" | ">=" | "<=" | "==" | "!=";
export type HasOperator = "has" | "!has";
export type ConditionOperator = ComparisonOperator | HasOperator;

export interface Condition {
  readonly type: ConditionType;
  readonly target: string;
  readonly operator: ConditionOperator;
  readonly value?: number | string | boolean;
}

// ---------------------------------------------------------------------------
// Effects — state modifications (extends base Effect from state/types.ts)
// ---------------------------------------------------------------------------

/**
 * Event-level effect with optional delay and probability.
 * This extends the base Effect concept with delayed consequence support.
 */
export interface EventEffect {
  readonly type: "attribute" | "spectrum" | "tag" | "relationship";
  readonly target: string;
  readonly operation:
    | "add"
    | "multiply"
    | "set"
    | "add_tag"
    | "create_relationship"
    | "modify_relationship";
  readonly value: number | string | RelationshipEffectValue;
  /** Years before this effect fires. 0 = immediate. */
  readonly delay?: number;
  /** 0-1, chance this effect actually occurs. Default 1.0. */
  readonly probability?: number;
  /** Text shown when a delayed effect triggers (connects to original choice). */
  readonly narrative?: string;
}

export interface RelationshipEffectValue {
  readonly name?: string;
  readonly type?: string;
  readonly closeness?: number;
  readonly status?: string;
  readonly traits?: readonly string[];
}

// ---------------------------------------------------------------------------
// Choices — player decisions within events
// ---------------------------------------------------------------------------

export interface Choice {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly conditions?: readonly Condition[];
  readonly effects: readonly EventEffect[];
  readonly narrative: string;
  readonly branchPoint: boolean;
}

// ---------------------------------------------------------------------------
// Event content formats
// ---------------------------------------------------------------------------

export interface DialogueLine {
  readonly speaker: string;
  readonly text: string;
  readonly emotion?: string;
}

export interface TimelinePopupContent {
  readonly text: string;
}

export interface ScenarioCardContent {
  readonly setup: string;
  readonly choices: readonly Choice[];
}

export interface VisualNovelContent {
  readonly dialogue: readonly DialogueLine[];
  readonly choices: readonly Choice[];
}

export interface MiniNarrativeContent {
  readonly pages: readonly string[];
  readonly choices: readonly Choice[];
}

export interface EchoEventContent {
  readonly text: string;
  readonly sourceEventId: string;
  readonly sourceAge: number;
}

export type EventContent =
  | TimelinePopupContent
  | ScenarioCardContent
  | VisualNovelContent
  | MiniNarrativeContent
  | EchoEventContent;

export type EventFormat =
  | "timeline_popup"
  | "scenario_card"
  | "visual_novel"
  | "mini_narrative"
  | "echo_event";

// ---------------------------------------------------------------------------
// Life Event — base schema shared by all event types
// ---------------------------------------------------------------------------

export type EventType = "minor" | "major" | "crisis";
export type EventRarity = "common" | "uncommon" | "rare" | "legendary";

export interface LifeEvent {
  readonly id: string;
  readonly type: EventType;
  readonly category: string;

  // Eligibility
  readonly stages: readonly StageName[];
  readonly minAge: number;
  readonly maxAge: number;
  readonly conditions: readonly Condition[];
  readonly exclusions: readonly string[];
  readonly prerequisites: readonly string[];
  readonly weight: number;
  readonly maxOccurrences: number;
  readonly isMilestone: boolean;

  // Presentation
  readonly format: EventFormat;
  readonly content: EventContent;

  // Consequences
  readonly effects: readonly EventEffect[];
  readonly choices?: readonly Choice[];

  // Metadata
  readonly tags: readonly string[];
  readonly rarity: EventRarity;
  readonly author: string;
}

// ---------------------------------------------------------------------------
// Minor Event Template — parameterized for volume scaling
// ---------------------------------------------------------------------------

export type VariableSource = "pool" | "state" | "relationship";

export interface VariableSlot {
  readonly name: string;
  readonly source: VariableSource;
  /** If source is "pool", pick a random entry from this list. */
  readonly pool?: readonly string[];
  /** If source is "state", dot-notation path into CharacterState. */
  readonly stateQuery?: string;
  /** If source is "relationship", type filter (e.g., "type:friend"). */
  readonly relationshipQuery?: string;
}

export interface MinorEventTemplate extends LifeEvent {
  readonly type: "minor";
  readonly template: string;
  readonly variables: readonly VariableSlot[];
}
