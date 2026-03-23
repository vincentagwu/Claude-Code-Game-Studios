/**
 * Crisis events — unplanned disruptions using mini_narrative and scenario_card formats.
 *
 * Health scares, financial crises, relationship crises.
 * Can fire at various ages across multiple stages.
 */

import type { LifeEvent } from "../events/types";

export const CRISIS_EVENTS: readonly LifeEvent[] = [
  // Health crisis (mini_narrative format)
  {
    id: "crisis_health_scare",
    type: "crisis", category: "health_events",
    stages: ["adult", "midlife", "elder"],
    minAge: 30, maxAge: 75,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 25, maxOccurrences: 1, isMilestone: false,
    format: "mini_narrative",
    content: {
      pages: [
        "It starts with something small — a pain you've been ignoring, a test result that comes back wrong. The doctor's face tells you more than their words do.",
        "The next few weeks are a blur of appointments, waiting rooms, and phone calls you don't want to make. The world doesn't stop, but yours does.",
        "Finally, the news comes. It could have been worse — much worse. But it changes how you see things. Time, health, the body you've taken for granted.",
      ],
      choices: [
        {
          id: "fight",
          label: "Take control of your health",
          description: "Commit to treatment and lifestyle changes",
          effects: [
            { type: "attribute", target: "health", operation: "add", value: -10 },
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "attribute", target: "health", operation: "add", value: 8, delay: 3, probability: 0.8, narrative: "The lifestyle changes paid off. You feel stronger than you have in years." },
            { type: "tag", target: "survived_illness", operation: "add_tag", value: "" },
          ],
          narrative: "You change everything — diet, exercise, habits you've had for decades. It's hard. Some days it feels impossible. But you show up anyway.",
          branchPoint: true,
        },
        {
          id: "accept",
          label: "Accept what comes",
          description: "Live with it, not against it",
          effects: [
            { type: "attribute", target: "health", operation: "add", value: -15 },
            { type: "attribute", target: "stress", operation: "add", value: -5 },
            { type: "spectrum", target: "courage", operation: "add", value: 8 },
            { type: "tag", target: "survived_illness", operation: "add_tag", value: "" },
          ],
          narrative: "You don't fight it so much as learn to live alongside it. Some things you can't control. But you can choose how to carry them.",
          branchPoint: true,
        },
      ],
    },
    effects: [],
    tags: ["health", "crisis", "defining_moment"],
    rarity: "uncommon",
    author: "seed",
  },

  // Financial crisis (scenario_card)
  {
    id: "crisis_financial",
    type: "crisis", category: "financial_milestones",
    stages: ["youngAdult", "adult", "midlife"],
    minAge: 22, maxAge: 55,
    conditions: [{ type: "attribute", target: "wealth", operator: ">=", value: 25 }],
    exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "The call comes on a Tuesday. A job loss, a market crash, an investment gone wrong — the specifics barely matter. What matters is the number in your bank account and the bills that don't care about your circumstances. You stare at a spreadsheet that used to make sense and now looks like a countdown.",
      choices: [
        {
          id: "hustle",
          label: "Fight your way back",
          description: "Take on extra work, cut everything, rebuild",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: -20 },
            { type: "attribute", target: "stress", operation: "add", value: 15 },
            { type: "spectrum", target: "ambition", operation: "add", value: 10 },
            { type: "tag", target: "debt", operation: "add_tag", value: "" },
            { type: "attribute", target: "wealth", operation: "add", value: 15, delay: 3, probability: 0.7, narrative: "The hustle paid off. You clawed your way back, dollar by dollar." },
          ],
          narrative: "You take on two jobs. Then three. Sleep becomes optional. Food becomes fuel. Every dollar is a small victory against the tide.",
          branchPoint: true,
        },
        {
          id: "ask_for_help",
          label: "Reach out for help",
          description: "Lean on family, friends, or programs",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: -15 },
            { type: "attribute", target: "stress", operation: "add", value: 8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
            { type: "tag", target: "debt", operation: "add_tag", value: "" },
          ],
          narrative: "Asking for help is the hardest phone call you've ever made. But the voice on the other end doesn't judge. They just ask how much you need.",
          branchPoint: true,
        },
      ],
    },
    effects: [],
    tags: ["financial", "crisis", "defining_moment"],
    rarity: "uncommon",
    author: "seed",
  },

  // Relationship crisis (scenario_card)
  {
    id: "crisis_relationship_breakup",
    type: "crisis", category: "relationship_evolution",
    stages: ["youngAdult", "adult", "midlife"],
    minAge: 20, maxAge: 55,
    conditions: [{ type: "tag", target: "in_relationship", operator: "has" }],
    exclusions: ["crisis_relationship_breakup"],
    prerequisites: [],
    weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "The arguments have gotten worse. Or maybe they've stopped entirely, which is worse. You lie in bed next to someone you used to know and wonder when the distance grew so wide. One morning, one of you says what both of you have been thinking.",
      choices: [
        {
          id: "fight_for_it",
          label: "Fight for the relationship",
          description: "Suggest counseling, make changes",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 8 },
            { type: "attribute", target: "happiness", operation: "add", value: 8, delay: 2, probability: 0.6, narrative: "The work you put into the relationship paid off. It's not what it was — it's something new, something harder-won." },
          ],
          narrative: "You sit across from a therapist and say things you've never said out loud. It's terrifying. But you keep showing up, both of you, week after week.",
          branchPoint: true,
        },
        {
          id: "let_go",
          label: "Let go",
          description: "Accept that it's over",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -12 },
            { type: "attribute", target: "stress", operation: "add", value: 8 },
            { type: "tag", target: "divorced", operation: "add_tag", value: "" },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: 10, delay: 3, probability: 0.8, narrative: "Time did what it does. The wound closed, and underneath it, you found someone you'd forgotten — yourself." },
          ],
          narrative: "The apartment feels too big for one person. The silence has a shape. But somewhere beneath the grief, there's a strange, terrifying freedom.",
          branchPoint: true,
        },
      ],
    },
    effects: [],
    tags: ["relationship", "crisis", "defining_moment"],
    rarity: "uncommon",
    author: "seed",
  },
];
