/**
 * Major life milestone events — marriage, home, loss, empty nest, windfall.
 *
 * Key turning points that define the shape of a life.
 */

import type { LifeEvent } from "../events/types";

export const MILESTONE_EVENTS: readonly LifeEvent[] = [
  // Marriage proposal
  {
    id: "milestone_marriage_proposal",
    type: "major", category: "romance",
    stages: ["youngAdult", "adult"],
    minAge: 24, maxAge: 40,
    conditions: [
      { type: "tag", target: "in_relationship", operator: "has" },
      { type: "tag", target: "married", operator: "!has" },
    ],
    exclusions: [], prerequisites: [], weight: 70, maxOccurrences: 1, isMilestone: false,
    format: "visual_novel",
    content: {
      dialogue: [
        { speaker: "Narrator", text: "The evening is quiet. You've rehearsed this moment a hundred times in your head, but now that it's here, every word evaporates." },
        { speaker: "Narrator", text: "Your partner looks at you across the table — candlelight, or maybe just the glow of a lamp in your apartment. The setting doesn't matter. They do.", emotion: "emotional" },
        { speaker: "Narrator", text: "You take a breath. This is the moment where everything before becomes a prologue.", emotion: "emotional" },
      ],
      choices: [
        {
          id: "propose",
          label: "Ask them to marry you",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 15 },
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "tag", target: "married", operation: "add_tag", value: "" },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
          ],
          narrative: "They say yes before you finish the sentence. You laugh, they cry, or maybe it's the other way around. The world shrinks to two people and a promise.",
          branchPoint: true,
        },
        {
          id: "wait",
          label: "Not yet — you're not ready",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: -3 },
            { type: "attribute", target: "happiness", operation: "add", value: -2 },
          ],
          narrative: "You put the thought away for another night. There's no rush. But part of you wonders if you'll always find a reason to wait.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["romance", "defining_moment", "milestone"], rarity: "common", author: "seed",
  },

  // Buying a home
  {
    id: "milestone_home_purchase",
    type: "major", category: "financial_milestones",
    stages: ["youngAdult", "adult"],
    minAge: 26, maxAge: 45,
    conditions: [
      { type: "attribute", target: "wealth", operator: ">=", value: 45 },
      { type: "tag", target: "homeowner", operator: "!has" },
    ],
    exclusions: [], prerequisites: [], weight: 55, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You've been looking at listings for months. The numbers make your head spin — mortgage rates, down payments, inspection costs. But today you're standing in a house that feels like it could be yours. The floors creak. The garden needs work. The kitchen is smaller than you'd like. But the light through the front windows is perfect.",
      choices: [
        {
          id: "buy",
          label: "Make an offer",
          description: "Take the leap into homeownership",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: -15 },
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "tag", target: "homeowner", operation: "add_tag", value: "" },
            { type: "attribute", target: "wealth", operation: "add", value: 10, delay: 8, probability: 0.7, narrative: "The house has appreciated nicely. Your biggest financial gamble paid off." },
          ],
          narrative: "The paperwork takes weeks. The anxiety takes months. But the first night you sleep in your own home — really yours — the silence sounds different. It sounds like belonging.",
          branchPoint: true,
        },
        {
          id: "keep_renting",
          label: "Keep renting for now",
          description: "Freedom has its own value",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: -3 },
            { type: "attribute", target: "wealth", operation: "add", value: 3 },
          ],
          narrative: "You close the listing and put your phone away. Homeownership isn't the only way to build a life. Flexibility has its own kind of security.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["financial", "milestone", "defining_moment"], rarity: "common", author: "seed",
  },

  // Loss of a parent
  {
    id: "milestone_parent_death",
    type: "crisis", category: "loss_of_peers",
    stages: ["adult", "midlife", "elder"],
    minAge: 35, maxAge: 80,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "mini_narrative",
    content: {
      pages: [
        "The phone rings at an hour when phones shouldn't ring. You know before you answer. Some part of you has been preparing for this call your entire adult life, and none of that preparation matters.",
        "The days that follow have a strange, underwater quality. There are arrangements to make, people to call, a house to sort through. You find a photo of yourself as a child, held in arms that no longer exist.",
        "At the service, someone tells a story you've never heard. Your parent, it turns out, was a person you only partially knew. The grief is tangled with regret, with love, with the sudden understanding that you are now the oldest version of yourself that has ever existed.",
      ],
      choices: [
        {
          id: "grieve_openly",
          label: "Let yourself grieve fully",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -15 },
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "spectrum", target: "empathy", operation: "add", value: 8 },
            { type: "attribute", target: "happiness", operation: "add", value: 8, delay: 2, probability: 0.9, narrative: "The grief softened, not into forgetting, but into something you could carry. Your parent's memory became a quiet companion." },
          ],
          narrative: "You cry in the shower. You cry at the grocery store. You cry holding a sweater that still smells like them. It hurts in a way nothing has hurt before. But you don't look away from it.",
          branchPoint: true,
        },
        {
          id: "stay_strong",
          label: "Hold it together — people need you",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -8 },
            { type: "attribute", target: "stress", operation: "add", value: 15 },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
          ],
          narrative: "You become the one who handles things. The logistics, the paperwork, the relatives who need reassurance. You hold it together because someone has to. The grief will come later, when there's time. If there's ever time.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["loss", "family", "defining_moment", "emotional"], rarity: "uncommon", author: "seed",
  },

  // Empty nest — child leaving
  {
    id: "milestone_empty_nest",
    type: "major", category: "empty_nest",
    stages: ["midlife"],
    minAge: 46, maxAge: 55,
    conditions: [{ type: "tag", target: "parent", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 65, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "The car is packed. Your child stands in the driveway, taller than you now, trying to look brave and excited and not at all like they want to cry. You've spent two decades preparing for this moment. You are not prepared for this moment.",
      choices: [
        {
          id: "let_go_gracefully",
          label: "Send them off with love",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
            { type: "attribute", target: "stress", operation: "add", value: -8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "You hug them one second longer than they expect. You wave until the car turns the corner. Then you walk inside, sit down at the kitchen table, and feel the silence of a house that raised a person.",
          branchPoint: false,
        },
        {
          id: "struggle_letting_go",
          label: "Ask if they're sure about this",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: -3 },
          ],
          narrative: "You say the wrong thing. You know it as you're saying it. They smile tightly, and the goodbye is more awkward than it should have been. You'll call tomorrow to apologize.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["family", "parenting", "life_transition"], rarity: "common", author: "seed",
  },

  // Unexpected windfall or setback
  {
    id: "milestone_windfall",
    type: "major", category: "financial_milestones",
    stages: ["adult", "midlife"],
    minAge: 30, maxAge: 55,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "An inheritance you didn't expect. A settlement from years ago. A forgotten investment that somehow grew. However it happened, you're holding a check for more money than you've ever seen at once. It's not life-changing wealth — but it's enough to change something.",
      choices: [
        {
          id: "invest",
          label: "Save and invest it",
          description: "Security for the future",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: 15 },
            { type: "attribute", target: "stress", operation: "add", value: -5 },
            { type: "attribute", target: "wealth", operation: "add", value: 8, delay: 5, probability: 0.7, narrative: "The investment grew steadily. Patient money turned into peace of mind." },
          ],
          narrative: "You deposit the check and barely touch it. It sits there, growing slowly, a quiet cushion against the unknown. Financial security feels less exciting than you imagined. But it lets you sleep.",
          branchPoint: false,
        },
        {
          id: "spend_generously",
          label: "Share it — treat people you love",
          description: "Money comes and goes, but moments don't",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: 10 },
            { type: "spectrum", target: "generosity", operation: "add", value: 10 },
          ],
          narrative: "You take everyone somewhere they've never been. You pay off someone's debt. You buy the thing you've been wanting for years. The money disappears faster than you expected, but the memories don't.",
          branchPoint: false,
        },
        {
          id: "quit_job",
          label: "Use it to make a change",
          description: "This is your runway to try something new",
          effects: [
            { type: "attribute", target: "career", operation: "add", value: -10 },
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "spectrum", target: "courage", operation: "add", value: 10 },
          ],
          narrative: "You quit your job on a Friday. On Monday, you start building something you've been thinking about for years. The money won't last forever, but for the first time, your time belongs to you.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["financial", "defining_moment"], rarity: "rare", author: "seed",
  },
];
