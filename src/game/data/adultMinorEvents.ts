/**
 * Additional adult + midlife minor templates.
 *
 * Career variety, health, friendship, financial, hobbies.
 */

import type { MinorEventTemplate } from "../events/types";

export const ADULT_MINOR_EVENTS: readonly MinorEventTemplate[] = [
  {
    id: "adult_career_setback_001",
    type: "minor", category: "career_progression",
    stages: ["adult", "midlife"], minAge: 28, maxAge: 55,
    conditions: [{ type: "attribute", target: "career", operator: ">=", value: 30 }],
    exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "career", operation: "add", value: -3 },
      { type: "attribute", target: "stress", operation: "add", value: 5 },
    ],
    tags: ["career", "adversity"], rarity: "common", author: "seed",
    template: "At work, {setback}. {response}",
    variables: [
      { name: "setback", source: "pool", pool: ["you were passed over for a promotion", "a project you led fell apart", "a new boss changed everything", "layoffs swept through the department"] },
      { name: "response", source: "pool", pool: ["You dusted yourself off and kept going.", "It stung more than you expected.", "You updated your resume, just in case.", "Setbacks have a way of revealing what matters."] },
    ],
  },
  {
    id: "adult_exercise_001",
    type: "minor", category: "health_events",
    stages: ["adult", "midlife"], minAge: 28, maxAge: 60,
    conditions: [], exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 3, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "health", operation: "add", value: 2 },
      { type: "attribute", target: "stress", operation: "add", value: -2 },
    ],
    tags: ["health", "lifestyle"], rarity: "common", author: "seed",
    template: "You started {activity}. {result}",
    variables: [
      { name: "activity", source: "pool", pool: ["running in the mornings", "going to the gym after work", "taking long walks", "doing yoga", "cycling on weekends"] },
      { name: "result", source: "pool", pool: ["Your body thanked you.", "The first week was terrible. The second was slightly less terrible.", "You felt more like yourself.", "It became the best part of your day."] },
    ],
  },
  {
    id: "adult_old_friend_001",
    type: "minor", category: "friendships",
    stages: ["adult", "midlife"], minAge: 30, maxAge: 55,
    conditions: [], exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 3 }],
    tags: ["friendship", "nostalgia"], rarity: "common", author: "seed",
    template: "You ran into {who} after years apart. {reunion}",
    variables: [
      { name: "who", source: "pool", pool: ["an old school friend", "someone from your first job", "a neighbor from your childhood", "a college roommate"] },
      { name: "reunion", source: "pool", pool: ["You talked for hours like no time had passed.", "They looked different but sounded exactly the same.", "You exchanged numbers and actually meant to call.", "Some connections survive any distance."] },
    ],
  },
  {
    id: "adult_financial_milestone_001",
    type: "minor", category: "financial_milestones",
    stages: ["adult", "midlife"], minAge: 30, maxAge: 55,
    conditions: [{ type: "attribute", target: "wealth", operator: ">=", value: 40 }],
    exclusions: [], prerequisites: [], weight: 25, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "wealth", operation: "add", value: 3 },
      { type: "attribute", target: "happiness", operation: "add", value: 2 },
    ],
    tags: ["financial"], rarity: "uncommon", author: "seed",
    template: "You {milestone}. {feeling}",
    variables: [
      { name: "milestone", source: "pool", pool: ["paid off a major debt", "hit a savings goal", "got an unexpected raise", "made a smart investment"] },
      { name: "feeling", source: "pool", pool: ["Financial stability is quieter than expected.", "You celebrated by doing absolutely nothing different.", "One less thing to worry about.", "Money doesn't buy happiness, but it buys options."] },
    ],
  },
  {
    id: "midlife_hobby_rediscovery_001",
    type: "minor", category: "hobbies",
    stages: ["midlife"], minAge: 46, maxAge: 60,
    conditions: [], exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 4 }],
    tags: ["hobbies", "rediscovery"], rarity: "common", author: "seed",
    template: "You picked up {hobby} again after years away. {discovery}",
    variables: [
      { name: "hobby", source: "pool", pool: ["painting", "playing guitar", "woodworking", "gardening", "writing", "cooking seriously"] },
      { name: "discovery", source: "pool", pool: ["Your hands remembered what your mind forgot.", "You're not as good as you were. You enjoy it more.", "The hours disappear the same way they did at twelve.", "Midlife is full of second chances disguised as hobbies."] },
    ],
  },
  {
    id: "adult_community_001",
    type: "minor", category: "friendships",
    stages: ["adult", "midlife", "elder"], minAge: 30, maxAge: 80,
    conditions: [], exclusions: [], prerequisites: [], weight: 25, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "relationships", operation: "add", value: 3 },
      { type: "attribute", target: "happiness", operation: "add", value: 2 },
    ],
    tags: ["community", "social"], rarity: "common", author: "seed",
    template: "You {action} in your community. {impact}",
    variables: [
      { name: "action", source: "pool", pool: ["volunteered at a local shelter", "joined a neighborhood group", "helped organize a community event", "mentored a young person"] },
      { name: "impact", source: "pool", pool: ["Giving felt better than receiving.", "You found people who cared about the same things.", "The world got a little smaller, in a good way.", "Purpose doesn't always come from work."] },
    ],
  },
];
