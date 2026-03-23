/**
 * Later life events — Young Adult, Adult, Midlife, and Elder stages.
 *
 * 14 minor templates + 5 major events covering career, romance,
 * financial, family, health, and legacy categories.
 */

import type { MinorEventTemplate, LifeEvent } from "../events/types";

// ---------------------------------------------------------------------------
// Young Adult minor events (18-25)
// ---------------------------------------------------------------------------

const YOUNG_ADULT_MINOR: readonly MinorEventTemplate[] = [
  {
    id: "ya_first_job_001",
    type: "minor", category: "career_start",
    stages: ["youngAdult"], minAge: 18, maxAge: 22,
    conditions: [], exclusions: [], prerequisites: [], weight: 50, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "career", operation: "add", value: 5 },
      { type: "attribute", target: "wealth", operation: "add", value: 3 },
    ],
    tags: ["career", "milestone"], rarity: "common", author: "seed",
    template: "You got your first real job — {role} at {place}. {feeling}",
    variables: [
      { name: "role", source: "pool", pool: ["cashier", "intern", "barista", "office assistant", "warehouse worker"] },
      { name: "place", source: "pool", pool: ["a local shop", "a downtown office", "a restaurant", "a tech company"] },
      { name: "feeling", source: "pool", pool: ["The paycheck feels earned.", "It's not glamorous, but it's yours.", "Adulthood has officially begun.", "You're tired but proud."] },
    ],
  },
  {
    id: "ya_independence_001",
    type: "minor", category: "independence",
    stages: ["youngAdult"], minAge: 19, maxAge: 24,
    conditions: [], exclusions: [], prerequisites: [], weight: 45, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "stress", operation: "add", value: 5 },
      { type: "attribute", target: "happiness", operation: "add", value: 3 },
    ],
    tags: ["independence"], rarity: "common", author: "seed",
    template: "You moved into your own {place}. {first_night}",
    variables: [
      { name: "place", source: "pool", pool: ["apartment", "shared house", "studio", "tiny room above a shop"] },
      { name: "first_night", source: "pool", pool: ["The first night alone was louder than you expected.", "You ate cereal for dinner and called it freedom.", "The walls were thin but they were yours.", "It smelled like paint and possibility."] },
    ],
  },
  {
    id: "ya_friendship_001",
    type: "minor", category: "friendships",
    stages: ["youngAdult"], minAge: 18, maxAge: 25,
    conditions: [], exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 3 }],
    tags: ["social"], rarity: "common", author: "seed",
    template: "You and {friend} {activity}. {bond}",
    variables: [
      { name: "friend", source: "relationship", relationshipQuery: "type:friend" },
      { name: "activity", source: "pool", pool: ["stayed out too late talking", "took a road trip on a whim", "helped each other through a rough week", "laughed until your sides hurt"] },
      { name: "bond", source: "pool", pool: ["These are the years you'll remember.", "Friendship is the family you choose.", "Some people just get you.", "Not everything has to mean something. Some things just are."] },
    ],
  },
  {
    id: "ya_financial_001",
    type: "minor", category: "financial_decisions",
    stages: ["youngAdult"], minAge: 20, maxAge: 25,
    conditions: [], exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "stress", operation: "add", value: 3 }],
    tags: ["financial"], rarity: "common", author: "seed",
    template: "You {financial_event}. {consequence}",
    variables: [
      { name: "financial_event", source: "pool", pool: ["checked your bank account and winced", "had to choose between groceries and going out", "got an unexpected bill", "started thinking about savings for the first time"] },
      { name: "consequence", source: "pool", pool: ["Money is a language you're still learning.", "Adulting is expensive.", "You made it work, barely.", "Financial independence has a learning curve."] },
    ],
  },

  // -----------------------------------------------------------------------
  // Adult minor events (26-45)
  // -----------------------------------------------------------------------
  {
    id: "adult_career_growth_001",
    type: "minor", category: "career_progression",
    stages: ["adult"], minAge: 26, maxAge: 45,
    conditions: [{ type: "attribute", target: "career", operator: ">=", value: 30 }],
    exclusions: [], prerequisites: [], weight: 45, maxOccurrences: 3, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "career", operation: "add", value: 3 },
      { type: "attribute", target: "wealth", operation: "add", value: 2 },
    ],
    tags: ["career"], rarity: "common", author: "seed",
    template: "At work, you {achievement}. {reflection}",
    variables: [
      { name: "achievement", source: "pool", pool: ["finished a project you're proud of", "earned respect from your team", "learned something that changed how you work", "got recognized for your effort"] },
      { name: "reflection", source: "pool", pool: ["You're building something here.", "The hours add up, but so does the experience.", "Not every day is exciting, but the trajectory is clear.", "You're better at this than you thought you'd be."] },
    ],
  },
  {
    id: "adult_relationship_001",
    type: "minor", category: "romance",
    stages: ["adult"], minAge: 26, maxAge: 40,
    conditions: [{ type: "relationship", target: "type:romantic", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 2 }],
    tags: ["romance", "emotional"], rarity: "common", author: "seed",
    template: "You and your partner {moment}. {feeling}",
    variables: [
      { name: "moment", source: "pool", pool: ["cooked dinner together after a long day", "argued about something small and made up quickly", "talked about the future for the first time in months", "fell asleep on the couch watching a movie"] },
      { name: "feeling", source: "pool", pool: ["Love isn't always fireworks. Sometimes it's a warm kitchen.", "You're glad you're not doing this alone.", "The small moments hold the weight.", "You notice them more when you almost forget to."] },
    ],
  },
  {
    id: "adult_parenting_001",
    type: "minor", category: "parenthood",
    stages: ["adult"], minAge: 28, maxAge: 45,
    conditions: [{ type: "tag", target: "parent", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 45, maxOccurrences: 3, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "happiness", operation: "add", value: 2 },
      { type: "attribute", target: "stress", operation: "add", value: 2 },
    ],
    tags: ["family", "parenting"], rarity: "common", author: "seed",
    template: "Your child {event}. {reaction}",
    variables: [
      { name: "event", source: "pool", pool: ["said something that surprised you", "had a bad day at school", "made you laugh so hard you cried", "looked at you like you had all the answers"] },
      { name: "reaction", source: "pool", pool: ["You're making this up as you go, but so did your parents.", "The weight of responsibility never fully lifts.", "You hope you're getting this right.", "They're growing faster than you expected."] },
    ],
  },
  {
    id: "adult_health_001",
    type: "minor", category: "health_events",
    stages: ["adult"], minAge: 30, maxAge: 45,
    conditions: [], exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "health", operation: "add", value: -3 }],
    tags: ["health"], rarity: "uncommon", author: "seed",
    template: "You {health_event}. {aftermath}",
    variables: [
      { name: "health_event", source: "pool", pool: ["threw out your back", "got a health scare that turned out to be nothing", "realized you can't eat like you used to", "started needing glasses"] },
      { name: "aftermath", source: "pool", pool: ["The body keeps score.", "You promised yourself you'd take better care. You meant it this time.", "Getting older is a series of small surrenders.", "It passed, but it left a reminder."] },
    ],
  },

  // -----------------------------------------------------------------------
  // Midlife minor events (46-60)
  // -----------------------------------------------------------------------
  {
    id: "midlife_reflection_001",
    type: "minor", category: "existential_events",
    stages: ["midlife"], minAge: 46, maxAge: 55,
    conditions: [], exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [],
    tags: ["introspection"], rarity: "common", author: "seed",
    template: "You caught yourself {moment}. {thought}",
    variables: [
      { name: "moment", source: "pool", pool: ["staring at old photos", "wondering where the years went", "feeling like a stranger in your own routine", "noticing your parents' habits in yourself"] },
      { name: "thought", source: "pool", pool: ["Is this the life you imagined?", "Some questions don't have answers.", "The middle is its own kind of beginning.", "You're not who you were. That might be okay."] },
    ],
  },
  {
    id: "midlife_health_001",
    type: "minor", category: "health_concerns",
    stages: ["midlife"], minAge: 48, maxAge: 60,
    conditions: [], exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "health", operation: "add", value: -3 },
      { type: "attribute", target: "stress", operation: "add", value: 3 },
    ],
    tags: ["health", "aging"], rarity: "common", author: "seed",
    template: "The doctor {news}. {response}",
    variables: [
      { name: "news", source: "pool", pool: ["said you should exercise more", "found something worth monitoring", "recommended dietary changes", "said the numbers could be better"] },
      { name: "response", source: "pool", pool: ["You took it seriously this time.", "You nodded and forgot by Tuesday.", "Your body is sending signals you can't ignore.", "Getting older means more appointments."] },
    ],
  },

  // -----------------------------------------------------------------------
  // Elder minor events (61+)
  // -----------------------------------------------------------------------
  {
    id: "elder_legacy_001",
    type: "minor", category: "legacy_reflection",
    stages: ["elder"], minAge: 65, maxAge: 120,
    conditions: [], exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 3, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 2 }],
    tags: ["legacy", "reflection"], rarity: "common", author: "seed",
    template: "You {action}. {wisdom}",
    variables: [
      { name: "action", source: "pool", pool: ["wrote a letter you'll never send", "told a grandchild about your childhood", "looked at the world and saw it differently", "sat in silence and found it full"] },
      { name: "wisdom", source: "pool", pool: ["The things that mattered most were free.", "You lived a life. Not perfect, but yours.", "Some stories improve with age.", "The ending is just another beginning you can't see."] },
    ],
  },
  {
    id: "elder_loss_001",
    type: "minor", category: "loss_of_peers",
    stages: ["elder"], minAge: 65, maxAge: 120,
    conditions: [], exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 3, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "happiness", operation: "add", value: -5 },
      { type: "attribute", target: "stress", operation: "add", value: 3 },
    ],
    tags: ["loss", "emotional"], rarity: "uncommon", author: "seed",
    template: "You heard that {who} {event}. {grief}",
    variables: [
      { name: "who", source: "pool", pool: ["an old friend", "someone from school", "a neighbor you'd known for decades", "someone from your past"] },
      { name: "event", source: "pool", pool: ["passed away", "was in the hospital", "had moved to a care home", "wasn't doing well"] },
      { name: "grief", source: "pool", pool: ["The world gets smaller when people leave it.", "You called to say what you should have said years ago.", "Loss doesn't get easier. You just learn where to put it.", "You sat with the news for a long time."] },
    ],
  },
];

// ---------------------------------------------------------------------------
// Major events for later life stages
// ---------------------------------------------------------------------------

const LATER_MAJOR_EVENTS: readonly LifeEvent[] = [
  // Young Adult: relationship commitment
  {
    id: "ya_relationship_commitment",
    type: "major", category: "romance",
    stages: ["youngAdult", "adult"], minAge: 22, maxAge: 35,
    conditions: [
      { type: "relationship", target: "type:romantic", operator: "!has" },
      { type: "spectrum", target: "sociability", operator: ">=", value: -20 },
    ],
    exclusions: [], prerequisites: [], weight: 70, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You've been spending more time with someone. What started as casual has become something you think about constantly. They look at you like you matter — really matter. One evening, they ask where this is going.",
      choices: [
        {
          id: "commit",
          label: "Take the leap",
          description: "Commit to the relationship",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 10 },
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "tag", target: "in_relationship", operation: "add_tag", value: "" },
          ],
          narrative: "You say yes. Not to perfection — to someone who sees you. The world feels less lonely tonight.",
          branchPoint: true,
        },
        {
          id: "stay_free",
          label: "Keep your independence",
          description: "You're not ready for commitment",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -3 },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
          ],
          narrative: "You explain that you need more time, more space, more... something. They understand, or say they do. The door doesn't close, but it gets quieter.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["romance", "defining_moment"], rarity: "common", author: "seed",
  },

  // Adult: parenthood decision
  {
    id: "adult_parenthood_decision",
    type: "major", category: "parenthood",
    stages: ["adult"], minAge: 28, maxAge: 40,
    conditions: [
      { type: "tag", target: "parent", operator: "!has" },
      { type: "tag", target: "in_relationship", operator: "has" },
    ],
    exclusions: [], prerequisites: [], weight: 75, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "The conversation keeps coming back to the same question. Are you ready? Will you ever be? Your partner watches you, patient but hopeful. The world feels both too big and too small for another person in it.",
      choices: [
        {
          id: "have_child",
          label: "Start a family",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "attribute", target: "stress", operation: "add", value: 12 },
            { type: "attribute", target: "wealth", operation: "add", value: -8 },
            { type: "tag", target: "parent", operation: "add_tag", value: "" },
          ],
          narrative: "Nine months later, everything changes. Not all at once — in the space between heartbeats. You hold something impossibly small and impossibly important, and the world rearranges itself around this new center of gravity.",
          branchPoint: true,
        },
        {
          id: "not_now",
          label: "Not yet — maybe not ever",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: -3 },
            { type: "spectrum", target: "courage", operation: "add", value: 3 },
          ],
          narrative: "You're honest about it — this isn't what you want right now. Maybe not ever. Your partner takes a breath. The conversation isn't over, but for now, there's an answer.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["family", "defining_moment"], rarity: "common", author: "seed",
  },

  // Midlife: career crisis
  {
    id: "midlife_career_crisis",
    type: "major", category: "career_plateau",
    stages: ["midlife"], minAge: 46, maxAge: 55,
    conditions: [{ type: "attribute", target: "career", operator: ">=", value: 40 }],
    exclusions: [], prerequisites: [], weight: 65, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You've been doing this for two decades. The work hasn't changed, but you have. Some mornings you sit in the parking lot a little longer before going in. A friend mentions an opportunity — completely different, probably foolish at your age. But the word 'foolish' doesn't sting the way it used to.",
      choices: [
        {
          id: "reinvent",
          label: "Make the change",
          description: "Start over in a new direction",
          effects: [
            { type: "attribute", target: "career", operation: "add", value: -15 },
            { type: "attribute", target: "happiness", operation: "add", value: 10 },
            { type: "attribute", target: "stress", operation: "add", value: 15 },
            { type: "spectrum", target: "courage", operation: "add", value: 10 },
            { type: "attribute", target: "career", operation: "add", value: 12, delay: 4, probability: 0.7, narrative: "The reinvention paid off. You found purpose in the last place you expected." },
          ],
          narrative: "You hand in your resignation with shaking hands and a steady heart. Starting over at this age is terrifying. But staying felt worse.",
          branchPoint: true,
        },
        {
          id: "stay_course",
          label: "Stay the course",
          description: "There's value in what you've built",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: -5 },
            { type: "attribute", target: "wealth", operation: "add", value: 5 },
          ],
          narrative: "You close the parking lot daydream and walk inside. There's a meeting at ten. The work isn't exciting, but it's solid. You've built something here, even if some days you forget what.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["career", "existential", "defining_moment"], rarity: "common", author: "seed",
  },

  // Elder: retirement
  {
    id: "elder_retirement",
    type: "major", category: "retirement",
    stages: ["elder"], minAge: 61, maxAge: 70,
    conditions: [{ type: "tag", target: "retired", operator: "!has" }],
    exclusions: [], prerequisites: [], weight: 85, maxOccurrences: 1, isMilestone: true,
    format: "scenario_card",
    content: {
      setup: "The day arrives. Your desk is cleared, your colleagues have signed a card you'll read later when no one is watching. Decades of mornings, meetings, deadlines — and now an open calendar that stretches to the horizon. What will you do with all this time?",
      choices: [
        {
          id: "embrace_retirement",
          label: "Embrace the freedom",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 10 },
            { type: "attribute", target: "stress", operation: "add", value: -15 },
            { type: "tag", target: "retired", operation: "add_tag", value: "" },
          ],
          narrative: "You sleep in on Monday for the first time in decades. Then Tuesday. By Wednesday, you're gardening, or reading, or just sitting. The silence isn't empty — it's full of everything you postponed.",
          branchPoint: true,
        },
        {
          id: "keep_working",
          label: "Stay busy — find new work",
          description: "Retirement isn't for you",
          effects: [
            { type: "attribute", target: "career", operation: "add", value: -10 },
            { type: "attribute", target: "happiness", operation: "add", value: 3 },
            { type: "tag", target: "retired", operation: "add_tag", value: "" },
          ],
          narrative: "Within two weeks, you're consulting, volunteering, or starting something small. You can't sit still. Maybe you don't want to. The work changes, but you don't stop.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["retirement", "defining_moment", "life_transition"], rarity: "common", author: "seed",
  },

  // Elder: legacy choice
  {
    id: "elder_legacy_choice",
    type: "major", category: "legacy_reflection",
    stages: ["elder"], minAge: 70, maxAge: 85,
    conditions: [], exclusions: [], prerequisites: [], weight: 60, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You've been thinking about what you'll leave behind. Not money — though there's that too. But the shape of your life, the mark you've made. A grandchild asks you what matters most. You think for a long time before answering.",
      choices: [
        {
          id: "legacy_relationships",
          label: "\"The people. Always the people.\"",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 10 },
          ],
          narrative: "You talk about the people who shaped you. The friend who stood by you. The parent who tried their best. The love that lasted, or the one that taught you what love was. The grandchild listens, and you see something shift behind their eyes.",
          branchPoint: false,
        },
        {
          id: "legacy_achievement",
          label: "\"Build something that outlasts you.\"",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 5 },
            { type: "spectrum", target: "ambition", operation: "add", value: 10 },
          ],
          narrative: "You talk about the work, the risks, the things you created or changed. Not for glory — for meaning. The grandchild nods, and you see a familiar fire in their eyes.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["legacy", "wisdom", "emotional"], rarity: "uncommon", author: "seed",
  },
];

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const LATER_MINOR_EVENTS: readonly MinorEventTemplate[] = YOUNG_ADULT_MINOR;
export const LATER_MAJOR_EVENTS_EXPORT: readonly LifeEvent[] = LATER_MAJOR_EVENTS;
