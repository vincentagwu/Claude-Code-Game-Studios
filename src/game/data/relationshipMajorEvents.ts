/**
 * Relationship-driven major events — friendship, romance, family, loss.
 *
 * 17 major events that make NPCs feel like real people.
 * These require active relationships of specific types.
 */

import type { LifeEvent } from "../events/types";

export const RELATIONSHIP_MAJOR_EVENTS: readonly LifeEvent[] = [
  // =========================================================================
  // FRIENDSHIP ARC (5 events)
  // =========================================================================

  {
    id: "rel_friendship_tested",
    type: "major", category: "friendships",
    stages: ["adolescence", "youngAdult", "adult"],
    minAge: 14, maxAge: 45,
    conditions: [{ type: "relationship", target: "type:friend", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 45, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Your friend needs money. Not a little — enough to matter. They sit across from you, unable to look you in the eye, and explain a situation that sounds desperate and possibly their own fault. You've been here for each other before, but never like this. This is the kind of ask that changes things, one way or another.",
      choices: [
        {
          id: "help_no_strings",
          label: "Help them, no questions asked",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: -8 },
            { type: "spectrum", target: "generosity", operation: "add", value: 10 },
            { type: "attribute", target: "wealth", operation: "add", value: 5, delay: 3, probability: 0.5, narrative: "They paid you back, eventually. The money mattered less than the fact that they tried." },
          ],
          narrative: "You write the check without asking what it's for. They exhale like they've been holding their breath for days. Some friendships are measured in moments like these.",
          branchPoint: true,
        },
        {
          id: "help_with_conditions",
          label: "Help, but set boundaries",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: -5 },
            { type: "attribute", target: "stress", operation: "add", value: 3 },
          ],
          narrative: "You help, but you're honest about your limits. They nod, grateful and slightly stung. The boundary was necessary. Whether it was kind is harder to say.",
          branchPoint: false,
        },
        {
          id: "say_no",
          label: "Say you can't",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
          ],
          narrative: "The silence after you say no is the loudest thing you've ever heard. They say they understand. The conversation ends. You stare at the wall for a long time after they leave.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["friendship", "moral", "defining_moment"], rarity: "uncommon", author: "seed",
  },

  {
    id: "rel_friendship_growing_apart",
    type: "major", category: "friendships",
    stages: ["youngAdult", "adult", "midlife"],
    minAge: 22, maxAge: 55,
    conditions: [{ type: "relationship", target: "type:friend", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You realize you haven't talked to your old friend in months. Not because of a fight — just... life. Different cities, different schedules, different worlds. You scroll past their name in your contacts and feel a pang of something you can't name. You could call. You could let it go.",
      choices: [
        {
          id: "reach_out",
          label: "Call them right now",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "They pick up on the second ring. 'I was literally just thinking about you,' they say. You talk for two hours. Nothing has changed and everything has changed. Some threads don't break — they just stretch.",
          branchPoint: false,
        },
        {
          id: "let_it_fade",
          label: "Let it be — people grow apart",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -3 },
            { type: "spectrum", target: "courage", operation: "add", value: 3 },
          ],
          narrative: "You put the phone down. Not every relationship needs maintenance. Some were meant for a season, not a lifetime. You carry them with you anyway.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["friendship", "loss", "emotional"], rarity: "common", author: "seed",
  },

  {
    id: "rel_friendship_reconciliation",
    type: "major", category: "friendships",
    stages: ["adult", "midlife", "elder"],
    minAge: 30, maxAge: 75,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "mini_narrative",
    content: {
      pages: [
        "A letter arrives. Or a message. Or you run into them at a store, both of you frozen in the produce aisle like deer. Someone you haven't spoken to in years. Someone you hurt, or who hurt you — the order doesn't matter anymore.",
        "The conversation is awkward at first. You both talk around the thing neither of you wants to name. But then one of you says it: 'I'm sorry.' And the other one exhales.",
        "You get coffee. Then lunch. Then you lose track of time. The years between you collapse into something manageable. You're different people now. Maybe that's why it works this time.",
      ],
      choices: [
        {
          id: "forgive_fully",
          label: "Let it go — truly",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 8 },
          ],
          narrative: "Forgiveness isn't a feeling. It's a decision you make every day until the feeling catches up. Today, it caught up.",
          branchPoint: false,
        },
        {
          id: "cautious_reconnect",
          label: "Keep them at arm's length",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 3 },
            { type: "attribute", target: "stress", operation: "add", value: 2 },
          ],
          narrative: "You're glad to have them back in your life. But you keep a hand on the door, just in case. Trust takes longer to rebuild than it does to break.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["friendship", "reconciliation", "emotional"], rarity: "uncommon", author: "seed",
  },

  {
    id: "rel_friend_in_crisis",
    type: "crisis", category: "friendships",
    stages: ["youngAdult", "adult", "midlife"],
    minAge: 20, maxAge: 55,
    conditions: [{ type: "relationship", target: "type:friend", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 25, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Your friend calls at 2 AM. Something is very wrong. They're not making sense, and you can hear that they've been crying. They need you — not tomorrow, not when it's convenient. Now.",
      choices: [
        {
          id: "drop_everything",
          label: "Go to them immediately",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 10 },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: 5, delay: 1, narrative: "Your friend never forgot that night. Neither did you." },
          ],
          narrative: "You're in the car before you hang up. You sit with them until the sun comes up, saying nothing that matters and everything that does. This is what friendship looks like when the stakes are real.",
          branchPoint: true,
        },
        {
          id: "help_from_distance",
          label: "Talk them through it on the phone",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "You stay on the phone for three hours. Your voice is the only thing keeping them together. It's not the same as being there, but it's enough. You hope it's enough.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["friendship", "crisis", "defining_moment"], rarity: "rare", author: "seed",
  },

  {
    id: "rel_unexpected_kindness",
    type: "major", category: "friendships",
    stages: ["youngAdult", "adult", "midlife", "elder"],
    minAge: 20, maxAge: 80,
    conditions: [{ type: "relationship", target: "type:friend", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You come home to find something waiting for you. A note, a gift, a solved problem you didn't ask anyone to solve. Your friend did this — quietly, without being asked, without wanting credit. You didn't even know they noticed you were struggling.",
      choices: [
        {
          id: "accept_gratefully",
          label: "Accept it and tell them what it means",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "You call them and your voice breaks before you get three words out. They laugh it off, but you can hear them smiling. This is the kind of moment that makes everything else bearable.",
          branchPoint: false,
        },
        {
          id: "pay_it_forward",
          label: "Do something just as kind for someone else",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 6 },
            { type: "spectrum", target: "generosity", operation: "add", value: 8 },
          ],
          narrative: "Kindness is contagious. Within the week, you've quietly done the same for someone who needed it. The chain doesn't need to end with you.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["friendship", "kindness", "emotional"], rarity: "uncommon", author: "seed",
  },

  // =========================================================================
  // ROMANCE ARC (5 events)
  // =========================================================================

  {
    id: "rel_romance_deepening",
    type: "major", category: "romance",
    stages: ["youngAdult", "adult"],
    minAge: 20, maxAge: 40,
    conditions: [{ type: "relationship", target: "type:romantic", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 50, maxOccurrences: 1, isMilestone: false,
    format: "visual_novel",
    content: {
      dialogue: [
        { speaker: "Narrator", text: "A rainy Sunday. You're both on the couch, not doing anything in particular. They lean against you, and you realize you've stopped performing." },
        { speaker: "Narrator", text: "This is the version of you that doesn't try to be interesting. The one that forgets to hold in their stomach. The one that laughs too loud and talks with food in their mouth.", emotion: "emotional" },
        { speaker: "Narrator", text: "They've seen all of it. And they're still here.", emotion: "emotional" },
      ],
      choices: [
        {
          id: "say_it",
          label: "Tell them you love them",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 10 },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
          ],
          narrative: "The words come out simpler than you expected. They don't echo or explode. They just land, soft and certain, like they've been waiting there all along.",
          branchPoint: false,
        },
        {
          id: "show_dont_tell",
          label: "Don't say anything — just pull them closer",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
          ],
          narrative: "Some things don't need words. You tighten your arm around them, and the rain outside sounds like the most perfect soundtrack ever written for a Sunday.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["romance", "emotional", "milestone"], rarity: "common", author: "seed",
  },

  {
    id: "rel_romance_conflict",
    type: "major", category: "romance",
    stages: ["youngAdult", "adult", "midlife"],
    minAge: 22, maxAge: 55,
    conditions: [{ type: "relationship", target: "type:romantic", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "The fight starts about something small — dishes, or plans, or a comment that lands wrong. But it becomes about everything. All the things you've been swallowing for months come pouring out in a voice you barely recognize as your own. They give as good as they get. The apartment feels too small for this much anger.",
      choices: [
        {
          id: "stay_and_fix",
          label: "Stay and work through it",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 8 },
            { type: "attribute", target: "happiness", operation: "add", value: -3 },
            { type: "spectrum", target: "empathy", operation: "add", value: 8 },
            { type: "attribute", target: "happiness", operation: "add", value: 6, delay: 1, probability: 0.8, narrative: "The fight led to the most honest conversation you'd ever had. Something shifted after that — deeper, harder, more real." },
          ],
          narrative: "You sit down. They sit down. The anger doesn't disappear, but it makes room for something harder: honesty. You talk until you're both exhausted and somehow closer than before.",
          branchPoint: true,
        },
        {
          id: "walk_away_cool_off",
          label: "Walk out — you need air",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
          ],
          narrative: "You grab your jacket and leave. The night air hits your face and you walk until the anger cools into something more like sadness. You'll go back. You'll apologize. But right now, you need to remember who you are without them in the room.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["romance", "conflict", "defining_moment"], rarity: "common", author: "seed",
  },

  {
    id: "rel_romance_long_term",
    type: "major", category: "romance",
    stages: ["adult", "midlife"],
    minAge: 35, maxAge: 55,
    conditions: [
      { type: "relationship", target: "type:romantic", operator: "has" },
      { type: "tag", target: "married", operator: "has" },
    ],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "You watch your partner across the room at a party, talking to someone you don't know. You've been together for years. The electricity is gone — replaced by something quieter. You know how they take their coffee, how they sleep, what makes them cry. Is that love, or just habit? The question has been sitting in your chest for months.",
      choices: [
        {
          id: "recommit",
          label: "Choose them again, deliberately",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "Love isn't a feeling — it's a decision you make when the feelings get complicated. You cross the room and take their hand. They look surprised. Then they don't.",
          branchPoint: false,
        },
        {
          id: "acknowledge_distance",
          label: "Admit something needs to change",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: -2 },
            { type: "spectrum", target: "courage", operation: "add", value: 5 },
          ],
          narrative: "You drive home in silence. That night, you say the thing: 'I think we need to talk about us.' The conversation lasts until 3 AM. It doesn't solve anything, but at least you're both looking at the same problem now.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["romance", "long_term", "emotional"], rarity: "common", author: "seed",
  },

  {
    id: "rel_romance_anniversary",
    type: "major", category: "romance",
    stages: ["adult", "midlife", "elder"],
    minAge: 30, maxAge: 80,
    conditions: [
      { type: "relationship", target: "type:romantic", operator: "has" },
      { type: "tag", target: "married", operator: "has" },
    ],
    exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "A milestone anniversary. You've been together long enough that the years have stopped feeling countable and started feeling geological. Your partner looks at you over dinner and says: 'Do you remember our first date? You were so nervous you knocked over a glass of water.'",
      choices: [
        {
          id: "reminisce",
          label: "Spend the evening remembering",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 10 },
          ],
          narrative: "You trade stories until the restaurant closes around you. Each memory is a thread in something vast and warm. You walk home hand in hand, and the years feel light.",
          branchPoint: false,
        },
        {
          id: "look_forward",
          label: "Talk about the future instead",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "spectrum", target: "ambition", operation: "add", value: 3 },
          ],
          narrative: "You talk about what's next — places to go, things to try, the life you haven't lived yet. The future feels more interesting than the past, and that might be the greatest gift of all.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["romance", "milestone", "emotional"], rarity: "uncommon", author: "seed",
  },

  {
    id: "rel_romance_surprise",
    type: "major", category: "romance",
    stages: ["youngAdult", "adult"],
    minAge: 20, maxAge: 40,
    conditions: [{ type: "relationship", target: "type:romantic", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Your partner did something unexpected. Planned a trip. Learned something just to surprise you. Left a note in your jacket pocket that you found three days later. It's not grand — it's specific. They know you, the real you, well enough to get the details right.",
      choices: [
        {
          id: "match_energy",
          label: "Plan something equally thoughtful",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 6 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "You spend a week planning something just for them. When they see it, their face does that thing — the one you fell in love with. Reciprocity is its own language.",
          branchPoint: false,
        },
        {
          id: "be_present",
          label: "Just be grateful and say so",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
          ],
          narrative: "Sometimes the best response to a gift is just receiving it. You say thank you, and you mean it more than you usually do.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["romance", "kindness"], rarity: "common", author: "seed",
  },

  // =========================================================================
  // FAMILY DYNAMICS (4 events)
  // =========================================================================

  {
    id: "rel_family_parent_conflict",
    type: "major", category: "family_events",
    stages: ["youngAdult", "adult"],
    minAge: 20, maxAge: 40,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Your parent disapproves of a choice you've made — your career, your partner, your lifestyle, something fundamental. The conversation starts calm and ends with a door closing harder than either of you intended. You're an adult. You don't need their approval. But you want it. God, you still want it.",
      choices: [
        {
          id: "stand_ground",
          label: "Stand your ground — this is your life",
          effects: [
            { type: "spectrum", target: "courage", operation: "add", value: 10 },
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
            { type: "attribute", target: "stress", operation: "add", value: 8 },
          ],
          narrative: "You don't apologize. Not because you don't care, but because backing down now would cost you something you can't get back. The silence that follows is its own kind of courage.",
          branchPoint: true,
        },
        {
          id: "find_middle",
          label: "Look for middle ground",
          effects: [
            { type: "spectrum", target: "empathy", operation: "add", value: 8 },
            { type: "attribute", target: "stress", operation: "add", value: 5 },
          ],
          narrative: "You call them back. You explain, not defend. You listen, even when it's hard. You don't agree, but you try to see it through their eyes. That's not weakness — it's love doing difficult work.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["family", "conflict", "defining_moment"], rarity: "common", author: "seed",
  },

  {
    id: "rel_family_sibling_bond",
    type: "major", category: "family_events",
    stages: ["adult", "midlife"],
    minAge: 28, maxAge: 55,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Your sibling — or the person who feels like one — calls out of nowhere. They're going through something. Not a crisis, just... life being heavy. They don't ask for advice. They just need someone who remembers who they were before they became who they had to be.",
      choices: [
        {
          id: "be_there",
          label: "Drop everything and be present",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 5 },
          ],
          narrative: "You listen. You remember stories from a kitchen that doesn't exist anymore, a yard that's probably a parking lot now. The shared past is a language only the two of you speak.",
          branchPoint: false,
        },
        {
          id: "share_your_own",
          label: "Open up about your own struggles",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 5 },
            { type: "attribute", target: "stress", operation: "add", value: -3 },
          ],
          narrative: "You trade burdens. Yours for theirs. Something about saying it out loud to someone who knew you at seven makes it lighter. Family isn't always the people who raised you — sometimes it's the people who grew up beside you.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["family", "bonding", "emotional"], rarity: "common", author: "seed",
  },

  {
    id: "rel_family_caring_for_parent",
    type: "major", category: "family_events",
    stages: ["midlife", "elder"],
    minAge: 45, maxAge: 70,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 1, isMilestone: false,
    format: "mini_narrative",
    content: {
      pages: [
        "The roles have reversed so gradually you almost didn't notice. Your parent needs help with things that used to be automatic — appointments, groceries, remembering to eat. The person who carried you is now being carried.",
        "Some days are good. They tell old stories with sharp detail, and you see the person they used to be shining through. Other days, you repeat yourself three times and pretend it doesn't break your heart.",
        "You rearrange your life around their needs. Work understands. Your partner understands. Your own health takes a hit you pretend not to notice. This is the price of love that outlasts strength.",
      ],
      choices: [
        {
          id: "fully_commit",
          label: "Make them your priority",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 12 },
            { type: "attribute", target: "health", operation: "add", value: -5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 10 },
            { type: "attribute", target: "happiness", operation: "add", value: 5, delay: 3, probability: 0.8, narrative: "You never regretted the time you gave them. Not once." },
          ],
          narrative: "You move them closer. You show up every day. You learn patience you didn't know you had. The exhaustion is real, but so is the grace of being needed by someone who once needed nothing.",
          branchPoint: true,
        },
        {
          id: "seek_help",
          label: "Find professional care and visit often",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "attribute", target: "wealth", operation: "add", value: -8 },
            { type: "spectrum", target: "ambition", operation: "add", value: -3 },
          ],
          narrative: "The facility is kind. The staff is gentle. You visit every week and call every day. The guilt never fully goes away, but neither does the relief. Both feelings can be true.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["family", "caregiving", "defining_moment", "emotional"], rarity: "uncommon", author: "seed",
  },

  {
    id: "rel_family_reunion",
    type: "major", category: "family_events",
    stages: ["adult", "midlife", "elder"],
    minAge: 30, maxAge: 75,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 25, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Everyone is in one place for the first time in years. Cousins you've lost track of, relatives you've only heard stories about, the whole sprawling, complicated web of people connected to you by blood and history. Someone says: 'We should do this more often.' Everyone agrees. No one will.",
      choices: [
        {
          id: "enjoy_fully",
          label: "Soak it in — this is rare and precious",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
          ],
          narrative: "You eat too much, laugh too loud, and stay up too late telling stories that get better with each retelling. For one weekend, you remember where you come from.",
          branchPoint: false,
        },
        {
          id: "observe_quietly",
          label: "Watch from the edges and reflect",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 3 },
          ],
          narrative: "You watch your family from across the yard and see yourself reflected in faces you barely know. You're part of something larger than your own story. That's both comforting and strange.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["family", "reunion", "emotional"], rarity: "uncommon", author: "seed",
  },

  // =========================================================================
  // LOSS (3 events)
  // =========================================================================

  {
    id: "rel_loss_close_friend",
    type: "crisis", category: "loss_of_peers",
    stages: ["adult", "midlife", "elder"],
    minAge: 40, maxAge: 85,
    conditions: [{ type: "relationship", target: "type:friend", operator: "has" }],
    exclusions: [], prerequisites: [], weight: 20, maxOccurrences: 1, isMilestone: false,
    format: "mini_narrative",
    content: {
      pages: [
        "You hear the news the way people always hear news like this — at the wrong time, in the wrong place, from the wrong person. Your friend is gone. Not 'gone away.' Gone.",
        "You sit with the word for a while. Gone. It doesn't feel real. You keep expecting a text. A call. The particular way they'd say your name when they were about to tell you something ridiculous.",
        "At the service, someone asks you to say a few words. You stand up and the room goes quiet. Every story you tell is a door that used to be open.",
      ],
      choices: [
        {
          id: "honor_memory",
          label: "Carry them with you — live for both of you",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -10 },
            { type: "spectrum", target: "empathy", operation: "add", value: 10 },
            { type: "attribute", target: "happiness", operation: "add", value: 5, delay: 2, probability: 0.9, narrative: "You started doing the things they always talked about. It felt like keeping a promise neither of you made out loud." },
          ],
          narrative: "You don't move on. You move forward with them riding shotgun in your memory. Every good thing you do from now on carries a silent dedication.",
          branchPoint: true,
        },
        {
          id: "grieve_privately",
          label: "Process it alone — grief is private",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -12 },
            { type: "attribute", target: "stress", operation: "add", value: 8 },
          ],
          narrative: "You close the door. The grief is a room you enter alone, and you stay there until you've touched every wall. Some losses are too specific to share.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["loss", "friendship", "defining_moment", "emotional"], rarity: "rare", author: "seed",
  },

  {
    id: "rel_loss_partner",
    type: "crisis", category: "loss_of_peers",
    stages: ["midlife", "elder"],
    minAge: 50, maxAge: 90,
    conditions: [
      { type: "relationship", target: "type:romantic", operator: "has" },
      { type: "tag", target: "married", operator: "has" },
    ],
    exclusions: [], prerequisites: [], weight: 15, maxOccurrences: 1, isMilestone: false,
    format: "mini_narrative",
    content: {
      pages: [
        "Their side of the bed is cold. It's been cold for a while now, but this morning is the first time you notice it. The house is exactly the same as yesterday, and nothing about it makes sense.",
        "People bring food. People say things. You nod. You thank them. You close the door and stand in the hallway, listening to the silence that used to be a conversation.",
        "Weeks pass. You learn the shape of absence — how it fills a room, how it sits at the dinner table, how it sleeps beside you. You learn that you can miss someone and still get up in the morning. You learn that grief isn't a thing you finish.",
      ],
      choices: [
        {
          id: "rebuild_slowly",
          label: "Take it one day at a time",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -15 },
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "tag", target: "widowed", operation: "add_tag", value: "" },
            { type: "attribute", target: "happiness", operation: "add", value: 8, delay: 3, probability: 0.8, narrative: "Time didn't heal the wound. But it taught you how to live around it. Some days are good now. Most days are okay. That's enough." },
          ],
          narrative: "You don't try to be strong. You just try to be present. One foot, then the other. The world keeps turning, and eventually, you turn with it.",
          branchPoint: true,
        },
        {
          id: "lean_on_others",
          label: "Let people in — you can't do this alone",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -12 },
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            { type: "tag", target: "widowed", operation: "add_tag", value: "" },
            { type: "spectrum", target: "sociability", operation: "add", value: 8 },
          ],
          narrative: "Your children, your friends, the neighbors — they hold you up when you can't stand. You learn that vulnerability isn't weakness. It's the bravest thing you've ever done.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["loss", "romance", "defining_moment", "emotional", "devastating"], rarity: "rare", author: "seed",
  },

  {
    id: "rel_loss_unexpected",
    type: "crisis", category: "loss_of_peers",
    stages: ["youngAdult", "adult", "midlife"],
    minAge: 22, maxAge: 55,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 15, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Someone you know — not your closest person, but someone real, someone who existed in the background of your life — is suddenly gone. An accident. No warning. No goodbye. You didn't even know they were sick. The last time you saw them, you said something forgettable and walked away. That's the last thing you'll ever say to them.",
      choices: [
        {
          id: "reflect_on_fragility",
          label: "Let it change how you live",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
            { type: "spectrum", target: "empathy", operation: "add", value: 8 },
          ],
          narrative: "You call people you haven't called in months. You say the things you've been putting off. You hug a little tighter. It won't last — the urgency will fade. But for now, you're paying attention.",
          branchPoint: false,
        },
        {
          id: "compartmentalize",
          label: "File it away and keep going",
          effects: [
            { type: "attribute", target: "stress", operation: "add", value: 5 },
          ],
          narrative: "You go to work the next day. You eat lunch. You check your email. Life doesn't stop for the dead — it barely pauses. You'll process this later. Maybe.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["loss", "mortality", "emotional"], rarity: "rare", author: "seed",
  },
];
