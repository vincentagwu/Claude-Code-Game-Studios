/**
 * Template variable resolver — resolves MinorEventTemplate variables
 * into concrete text.
 *
 * Handles three variable sources:
 * - pool: random selection from a list
 * - state: dot-notation query into CharacterState
 * - relationship: type-filtered random relationship name
 *
 * @see design/gdd/event-content-database.md — Minor Event Templates
 */

import type { CharacterState } from "../state/types";
import type { MinorEventTemplate, VariableSlot } from "./types";

/**
 * Resolve a minor event template into concrete text.
 *
 * @param template - The minor event template with variable slots
 * @param state - Current character state for state/relationship queries
 * @param rng - Random number generator (0-1), defaults to Math.random
 * @returns The resolved text string, or null if a required variable can't be resolved
 */
export function resolveTemplate(
  template: MinorEventTemplate,
  state: CharacterState,
  rng: () => number = Math.random
): string | null {
  let text = template.template;

  for (const variable of template.variables) {
    const value = resolveVariable(variable, state, rng);
    if (value === null) return null;
    text = text.replace(`{${variable.name}}`, value);
  }

  return text;
}

function resolveVariable(
  slot: VariableSlot,
  state: CharacterState,
  rng: () => number
): string | null {
  switch (slot.source) {
    case "pool":
      return resolvePool(slot, rng);
    case "state":
      return resolveStateQuery(slot, state);
    case "relationship":
      return resolveRelationship(slot, state, rng);
  }
}

function resolvePool(slot: VariableSlot, rng: () => number): string | null {
  if (!slot.pool || slot.pool.length === 0) return null;
  const index = Math.floor(rng() * slot.pool.length);
  return slot.pool[index];
}

/**
 * Resolve a state query using dot notation.
 * Examples: "attributes.wealth", "identity.name", "spectrums.courage"
 */
function resolveStateQuery(
  slot: VariableSlot,
  state: CharacterState
): string | null {
  if (!slot.stateQuery) return null;

  const parts = slot.stateQuery.split(".");
  let current: unknown = state;

  for (const part of parts) {
    if (current === null || current === undefined) return null;
    if (typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }

  if (current === null || current === undefined) return null;
  return String(current);
}

/**
 * Resolve a relationship query.
 * Format: "type:friend" returns a random active friend's name.
 * Falls back to generic text if no matching relationship exists.
 */
function resolveRelationship(
  slot: VariableSlot,
  state: CharacterState,
  rng: () => number
): string | null {
  if (!slot.relationshipQuery) return null;

  const query = slot.relationshipQuery;

  if (query.startsWith("type:")) {
    const relType = query.slice(5);
    const matches = state.relationships.filter(
      (r) => r.type === relType && r.status === "active"
    );

    if (matches.length === 0) {
      return getFallbackName(relType);
    }

    const index = Math.floor(rng() * matches.length);
    return matches[index].name;
  }

  // Direct ID lookup
  const rel = state.relationships.find(
    (r) => r.id === query && r.status === "active"
  );
  return rel ? rel.name : getFallbackName("person");
}

/** Generic fallback names when no matching relationship exists. */
function getFallbackName(type: string): string {
  switch (type) {
    case "friend":
      return "a friend";
    case "family":
      return "a family member";
    case "romantic":
      return "someone special";
    case "professional":
      return "a colleague";
    case "rival":
      return "a rival";
    default:
      return "someone";
  }
}
