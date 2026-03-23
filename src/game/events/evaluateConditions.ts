/**
 * Condition evaluation — checks whether a set of conditions are met
 * against the current character state.
 *
 * Handles all 6 condition types: attribute, spectrum, tag, flag,
 * relationship, identity.
 *
 * @see design/gdd/event-content-database.md — Condition Schema
 */

import type { CharacterState, DerivedFlags } from "../state/types";
import type { Condition, ComparisonOperator } from "./types";

/**
 * Evaluate all conditions against the character state.
 * Returns true only if ALL conditions pass (logical AND).
 */
export function evaluateConditions(
  conditions: readonly Condition[],
  state: CharacterState,
  flags: DerivedFlags
): boolean {
  return conditions.every((c) => evaluateCondition(c, state, flags));
}

function evaluateCondition(
  condition: Condition,
  state: CharacterState,
  flags: DerivedFlags
): boolean {
  switch (condition.type) {
    case "attribute":
      return evaluateComparison(
        state.attributes[condition.target as keyof typeof state.attributes],
        condition.operator as ComparisonOperator,
        condition.value as number
      );

    case "spectrum":
      return evaluateComparison(
        state.spectrums[condition.target as keyof typeof state.spectrums],
        condition.operator as ComparisonOperator,
        condition.value as number
      );

    case "tag":
      return condition.operator === "has"
        ? state.tags.some((t) => t.id === condition.target)
        : !state.tags.some((t) => t.id === condition.target);

    case "flag":
      return condition.operator === "has"
        ? flags[condition.target as keyof DerivedFlags] === true
        : flags[condition.target as keyof DerivedFlags] !== true;

    case "relationship":
      return evaluateRelationshipCondition(condition, state);

    case "identity":
      return evaluateIdentityCondition(condition, state);

    default:
      return false;
  }
}

function evaluateComparison(
  actual: number | undefined,
  operator: ComparisonOperator,
  expected: number
): boolean {
  if (actual === undefined) return false;

  switch (operator) {
    case ">":
      return actual > expected;
    case "<":
      return actual < expected;
    case ">=":
      return actual >= expected;
    case "<=":
      return actual <= expected;
    case "==":
      return actual === expected;
    case "!=":
      return actual !== expected;
  }
}

function evaluateRelationshipCondition(
  condition: Condition,
  state: CharacterState
): boolean {
  const target = condition.target;

  // Type filter: "type:friend", "type:romantic", etc.
  if (target.startsWith("type:")) {
    const relType = target.slice(5);
    const hasType = state.relationships.some(
      (r) => r.type === relType && r.status === "active"
    );
    return condition.operator === "has" ? hasType : !hasType;
  }

  // Specific relationship by ID
  const rel = state.relationships.find((r) => r.id === target);

  if (condition.operator === "has") return rel !== undefined && rel.status === "active";
  if (condition.operator === "!has") return rel === undefined || rel.status !== "active";

  // Numeric comparison on closeness
  if (rel === undefined) return false;
  return evaluateComparison(
    rel.closeness,
    condition.operator as ComparisonOperator,
    condition.value as number
  );
}

function evaluateIdentityCondition(
  condition: Condition,
  state: CharacterState
): boolean {
  const target = condition.target as keyof typeof state.identity;
  const actual = state.identity[target];

  if (condition.operator === "has" || condition.operator === "!has") {
    const exists = actual !== undefined && actual !== null && actual !== "";
    return condition.operator === "has" ? exists : !exists;
  }

  if (typeof actual === "number") {
    return evaluateComparison(
      actual,
      condition.operator as ComparisonOperator,
      condition.value as number
    );
  }

  // String comparison (location, gender, etc.)
  if (typeof actual === "string") {
    const expected = condition.value as string;
    switch (condition.operator) {
      case "==":
        return actual === expected;
      case "!=":
        return actual !== expected;
      default:
        return false;
    }
  }

  return false;
}
