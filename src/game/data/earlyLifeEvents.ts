/**
 * Early life events — Infancy (0-2) and Early Childhood (3-5).
 *
 * Observation-only events with no choices (agency = none/minimal).
 * These are the first memories — fragments and impressions.
 */

import type { MinorEventTemplate } from "../events/types";

export const EARLY_LIFE_EVENTS: readonly MinorEventTemplate[] = [
  // Infancy (0-2)
  {
    id: "infancy_first_steps",
    type: "minor", category: "health_milestones",
    stages: ["infancy"], minAge: 0, maxAge: 2,
    conditions: [], exclusions: [], prerequisites: [], weight: 60, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [],
    tags: ["milestone"], rarity: "common", author: "seed",
    template: "You took your first {steps}. {reaction}",
    variables: [
      { name: "steps", source: "pool", pool: ["wobbly steps", "steps across the living room", "steps toward outstretched arms"] },
      { name: "reaction", source: "pool", pool: ["The world got bigger.", "Someone cheered.", "You fell, got up, and tried again."] },
    ],
  },
  {
    id: "infancy_first_word",
    type: "minor", category: "health_milestones",
    stages: ["infancy"], minAge: 1, maxAge: 2,
    conditions: [], exclusions: [], prerequisites: [], weight: 55, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [],
    tags: ["milestone"], rarity: "common", author: "seed",
    template: "Your first word was \"{word}.\" {context}",
    variables: [
      { name: "word", source: "pool", pool: ["mama", "dada", "no", "ball", "dog", "more"] },
      { name: "context", source: "pool", pool: ["It was repeated endlessly for weeks.", "Everyone made a much bigger deal of it than you did.", "Language had begun."] },
    ],
  },
  {
    id: "infancy_family_moment",
    type: "minor", category: "family_dynamics",
    stages: ["infancy"], minAge: 0, maxAge: 2,
    conditions: [], exclusions: [], prerequisites: [], weight: 50, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [],
    tags: ["family", "nostalgic"], rarity: "common", author: "seed",
    template: "{parent} {action}. {impression}",
    variables: [
      { name: "parent", source: "relationship", relationshipQuery: "type:family" },
      { name: "action", source: "pool", pool: ["held you close", "sang you to sleep", "carried you through the rain", "laughed at something you did"] },
      { name: "impression", source: "pool", pool: ["You wouldn't remember this, but your body would.", "Safety had a shape and a warmth.", "The world was small and complete."] },
    ],
  },

  // Early Childhood (3-5)
  {
    id: "early_child_preschool",
    type: "minor", category: "preschool",
    stages: ["earlyChildhood"], minAge: 3, maxAge: 5,
    conditions: [], exclusions: [], prerequisites: [], weight: 50, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "education", operation: "add", value: 1 }],
    tags: ["school", "social"], rarity: "common", author: "seed",
    template: "At preschool, you {activity}. {observation}",
    variables: [
      { name: "activity", source: "pool", pool: ["painted with your fingers", "shared your snack with someone", "learned to write your name", "built a tower and knocked it down"] },
      { name: "observation", source: "pool", pool: ["Other children were strange and fascinating.", "You were learning the rules of a world much bigger than home.", "The colors were brighter than anything you'd seen.", "You didn't want to leave at the end of the day."] },
    ],
  },
  {
    id: "early_child_fear",
    type: "minor", category: "early_fears",
    stages: ["earlyChildhood"], minAge: 3, maxAge: 5,
    conditions: [], exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "stress", operation: "add", value: 2 }],
    tags: ["emotional"], rarity: "common", author: "seed",
    template: "You were afraid of {fear}. {comfort}",
    variables: [
      { name: "fear", source: "pool", pool: ["the dark", "thunder", "being alone", "the monster under the bed", "loud noises"] },
      { name: "comfort", source: "pool", pool: ["Someone left a light on for you.", "You outgrew it, eventually.", "Bravery is something you learn, not something you have.", "It felt enormous at the time."] },
    ],
  },
  {
    id: "early_child_friendship",
    type: "minor", category: "first_friendships",
    stages: ["earlyChildhood"], minAge: 4, maxAge: 5,
    conditions: [], exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 2 }],
    tags: ["social", "friendship"], rarity: "common", author: "seed",
    template: "You made your first friend — {how}. {bond}",
    variables: [
      { name: "how", source: "pool", pool: ["they sat next to you at lunch", "you both liked the same toy", "they laughed at something you said", "you just started playing together one day"] },
      { name: "bond", source: "pool", pool: ["Friendship is simpler when you're small.", "You didn't know their last name and it didn't matter.", "Some connections don't need words.", "The world was less lonely after that."] },
    ],
  },
];
