/**
 * Additional childhood + adolescence events.
 *
 * 6 minor templates + 2 major events covering hobbies, bullying,
 * self-discovery, and first job.
 */

import type { MinorEventTemplate, LifeEvent } from "../events/types";

export const MORE_CHILDHOOD_MINOR: readonly MinorEventTemplate[] = [
  {
    id: "childhood_hobby_001",
    type: "minor", category: "hobbies",
    stages: ["childhood"], minAge: 8, maxAge: 11,
    conditions: [], exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 3 }],
    tags: ["hobbies", "growth"], rarity: "common", author: "seed",
    template: "You started {hobby}. {progression}",
    variables: [
      { name: "hobby", source: "pool", pool: ["collecting rocks", "drawing comics", "building model kits", "learning guitar", "coding simple programs", "playing soccer"] },
      { name: "progression", source: "pool", pool: ["You weren't great at first, but that didn't matter.", "It gave you something that was entirely yours.", "Hours disappeared when you were doing it.", "For the first time, practice felt like play."] },
    ],
  },
  {
    id: "childhood_bullying_001",
    type: "minor", category: "bullying",
    stages: ["childhood"], minAge: 8, maxAge: 11,
    conditions: [], exclusions: [], prerequisites: [], weight: 30, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "happiness", operation: "add", value: -5 },
      { type: "attribute", target: "stress", operation: "add", value: 5 },
    ],
    tags: ["adversity", "school"], rarity: "uncommon", author: "seed",
    template: "Someone at school started {bullying}. {coping}",
    variables: [
      { name: "bullying", source: "pool", pool: ["calling you names in the hallway", "excluding you from their group", "making fun of your clothes", "spreading rumors about you"] },
      { name: "coping", source: "pool", pool: ["You pretended it didn't bother you.", "You told an adult, but it didn't change much.", "You found other friends who didn't care about that stuff.", "It hurt more than you let anyone see."] },
    ],
  },
  {
    id: "adolescence_self_discovery_001",
    type: "minor", category: "self_discovery",
    stages: ["adolescence"], minAge: 14, maxAge: 17,
    conditions: [], exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "spectrum", target: "courage", operation: "add", value: 5 }],
    tags: ["identity", "growth"], rarity: "uncommon", author: "seed",
    template: "You realized something about yourself: {realization}. {aftermath}",
    variables: [
      { name: "realization", source: "pool", pool: ["you didn't have to be who everyone expected", "your anger was actually fear in disguise", "you cared more about fairness than fitting in", "the version of yourself at home was different from school"] },
      { name: "aftermath", source: "pool", pool: ["It didn't change anything overnight, but it changed how you saw everything.", "You started making different choices after that.", "It was the beginning of something you couldn't name yet.", "Self-knowledge is a strange gift."] },
    ],
  },
  {
    id: "adolescence_first_job_001",
    type: "minor", category: "first_job",
    stages: ["adolescence"], minAge: 15, maxAge: 17,
    conditions: [], exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 1, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [
      { type: "attribute", target: "career", operation: "add", value: 3 },
      { type: "attribute", target: "wealth", operation: "add", value: 2 },
    ],
    tags: ["career", "first"], rarity: "common", author: "seed",
    template: "You got a part-time job {where}. {experience}",
    variables: [
      { name: "where", source: "pool", pool: ["bagging groceries", "at a fast-food place", "mowing lawns", "tutoring younger kids", "at the local library"] },
      { name: "experience", source: "pool", pool: ["The money was small, but earning it felt huge.", "You learned more about people in a month than school taught in a year.", "It was exhausting and satisfying in equal measure.", "Your first paycheck went straight to something you'd been wanting forever."] },
    ],
  },
  {
    id: "childhood_nature_001",
    type: "minor", category: "discovery",
    stages: ["childhood"], minAge: 6, maxAge: 11,
    conditions: [], exclusions: [], prerequisites: [], weight: 35, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "happiness", operation: "add", value: 2 }],
    tags: ["nature", "wonder"], rarity: "common", author: "seed",
    template: "You spent an afternoon {activity}. {wonder}",
    variables: [
      { name: "activity", source: "pool", pool: ["catching fireflies", "watching clouds change shape", "building a fort in the woods", "following a creek to see where it went"] },
      { name: "wonder", source: "pool", pool: ["The world was bigger than you realized.", "Childhood gives you hours that last forever.", "Some magic only works when you're small enough to believe.", "You didn't have a phone. You didn't need one."] },
    ],
  },
  {
    id: "adolescence_social_media_001",
    type: "minor", category: "identity",
    stages: ["adolescence"], minAge: 13, maxAge: 17,
    conditions: [], exclusions: [], prerequisites: [], weight: 40, maxOccurrences: 2, isMilestone: false,
    format: "timeline_popup", content: { text: "" },
    effects: [{ type: "attribute", target: "stress", operation: "add", value: 2 }],
    tags: ["social", "modern"], rarity: "common", author: "seed",
    template: "Online, you {action}. {reflection}",
    variables: [
      { name: "action", source: "pool", pool: ["compared yourself to people who seemed to have it all", "found a community that understood you", "said something you regretted", "scrolled for hours without realizing it"] },
      { name: "reflection", source: "pool", pool: ["The screen shows a world that isn't quite real.", "Connection and isolation can look the same from the outside.", "You were more careful after that.", "Everyone's highlight reel made your ordinary life feel small."] },
    ],
  },
];

export const MORE_CHILDHOOD_MAJOR: readonly LifeEvent[] = [
  // Major: Discovering a passion
  {
    id: "childhood_passion_discovery",
    type: "major", category: "hobbies",
    stages: ["childhood"], minAge: 9, maxAge: 11,
    conditions: [{ type: "attribute", target: "education", operator: ">=", value: 30 }],
    exclusions: [], prerequisites: [], weight: 60, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Something has clicked. Whether it was a book, a class, a conversation, or a moment alone — you've found something that makes the hours disappear. For the first time, you feel the pull of genuine passion. The question is how far you'll chase it.",
      choices: [
        {
          id: "pursue_passion",
          label: "Dive deep into it",
          description: "Spend every free moment practicing",
          effects: [
            { type: "attribute", target: "education", operation: "add", value: 5 },
            { type: "attribute", target: "happiness", operation: "add", value: 8 },
            { type: "spectrum", target: "ambition", operation: "add", value: 10 },
            { type: "tag", target: "passionate_hobby", operation: "add_tag", value: "" },
          ],
          narrative: "You spend every spare moment on it. Your room fills with evidence of obsession — books, sketches, practice logs. Your parents wonder if it's healthy. You've never been happier.",
          branchPoint: true,
        },
        {
          id: "keep_balanced",
          label: "Keep it as one of many interests",
          description: "Balance it with other activities",
          effects: [
            { type: "attribute", target: "happiness", operation: "add", value: 4 },
            { type: "attribute", target: "education", operation: "add", value: 3 },
          ],
          narrative: "You enjoy it without letting it consume you. There's time for friends, for school, for being a kid. The passion stays warm but never burns.",
          branchPoint: false,
        },
      ],
    },
    effects: [], tags: ["hobbies", "identity", "defining_moment"], rarity: "common", author: "seed",
  },

  // Major: First heartbreak / friendship betrayal
  {
    id: "adolescence_first_betrayal",
    type: "major", category: "friendships",
    stages: ["adolescence"], minAge: 14, maxAge: 17,
    conditions: [],
    exclusions: [], prerequisites: [], weight: 55, maxOccurrences: 1, isMilestone: false,
    format: "scenario_card",
    content: {
      setup: "Your closest friend told someone your secret. The one thing you trusted them with — and now it's everywhere. You see the looks in the hallway, hear the whispers. The betrayal burns worse than the embarrassment. You confront them after school, and they can't meet your eyes.",
      choices: [
        {
          id: "forgive",
          label: "Forgive them",
          description: "People make mistakes. You've made them too.",
          effects: [
            { type: "spectrum", target: "empathy", operation: "add", value: 10 },
            { type: "attribute", target: "happiness", operation: "add", value: -3 },
            { type: "attribute", target: "happiness", operation: "add", value: 5, delay: 2, probability: 0.8, narrative: "The friendship survived the betrayal. Somehow, it's stronger for it." },
          ],
          narrative: "It takes weeks, but you say the words. They mean them when they apologize. Trust will take longer, but you've decided this person is worth the risk.",
          branchPoint: true,
        },
        {
          id: "cut_them_off",
          label: "Walk away",
          description: "Some things can't be undone",
          effects: [
            { type: "spectrum", target: "courage", operation: "add", value: 8 },
            { type: "attribute", target: "happiness", operation: "add", value: -8 },
            { type: "attribute", target: "stress", operation: "add", value: 5 },
          ],
          narrative: "You turn and walk away. It's the loneliest you've ever felt, but also the clearest. You know what you're worth now. Some people only teach you that by failing you.",
          branchPoint: true,
        },
      ],
    },
    effects: [], tags: ["friendship", "betrayal", "defining_moment"], rarity: "common", author: "seed",
  },
];
