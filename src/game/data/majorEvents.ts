/**
 * Seed major events — milestone moments at ages 12, 18, and 25.
 *
 * 3 fully authored events with 2+ choices each.
 * Each choice has distinct consequences and branch points.
 *
 * @see design/gdd/event-content-database.md — Major Event Structure
 */

import type { LifeEvent } from "../events/types";

export const MAJOR_EVENTS: readonly LifeEvent[] = [
  // -----------------------------------------------------------------------
  // Age 12: Middle school crossroads
  // -----------------------------------------------------------------------
  {
    id: "childhood_bully_encounter",
    type: "major",
    category: "school",
    stages: ["childhood"],
    minAge: 11,
    maxAge: 12,
    conditions: [],
    exclusions: [],
    prerequisites: [],
    weight: 85,
    maxOccurrences: 1,
    isMilestone: true,
    format: "scenario_card",
    content: {
      setup:
        "A bigger kid has been shoving your friend around at lunch for weeks. " +
        "Today they knocked their tray onto the floor while everyone watched. " +
        "Your friend looks at you. The cafeteria is quiet. Everyone is waiting " +
        "to see what happens next.",
      choices: [
        {
          id: "stand_up",
          label: "Step between them",
          description: "Confront the bully directly",
          effects: [
            { type: "spectrum", target: "courage", operation: "add", value: 15 },
            { type: "attribute", target: "happiness", operation: "add", value: -5 },
            { type: "attribute", target: "stress", operation: "add", value: 8 },
            {
              type: "spectrum",
              target: "empathy",
              operation: "add",
              value: 5,
              delay: 3,
              probability: 0.8,
              narrative:
                "Years later, your friend still talks about the day you stood up for them. " +
                "It meant more than you realized at the time.",
            },
          ],
          narrative:
            "Your heart hammers as you step forward. Your voice comes out steadier " +
            "than you feel. The bully sizes you up — and backs off. Your hands are " +
            "shaking, but your friend is smiling.",
          branchPoint: true,
        },
        {
          id: "tell_teacher",
          label: "Get a teacher",
          description: "Find an adult to handle it",
          effects: [
            { type: "spectrum", target: "conformity", operation: "add", value: 10 },
            { type: "attribute", target: "stress", operation: "add", value: 3 },
          ],
          narrative:
            "You slip away and find Ms. Rodriguez. She handles it — the bully gets " +
            "detention. Your friend is safe, but some kids call you a snitch for a week. " +
            "You did the right thing. You think.",
          branchPoint: true,
        },
        {
          id: "do_nothing",
          label: "Look away",
          description: "Pretend you didn't see",
          effects: [
            { type: "spectrum", target: "courage", operation: "add", value: -10 },
            { type: "attribute", target: "happiness", operation: "add", value: -3 },
            {
              type: "attribute",
              target: "stress",
              operation: "add",
              value: 5,
              delay: 1,
              narrative:
                "You still think about the cafeteria sometimes. About what you could have done.",
            },
          ],
          narrative:
            "You stare at your own tray. The moment passes. Your friend picks up " +
            "their food alone. They don't look at you for the rest of the day. " +
            "Something small and important shifts between you.",
          branchPoint: true,
        },
      ],
    },
    effects: [],
    choices: undefined,
    tags: ["moral", "friendship", "defining_moment"],
    rarity: "common",
    author: "seed",
  },

  // -----------------------------------------------------------------------
  // Age 18: College decision
  // -----------------------------------------------------------------------
  {
    id: "adolescence_college_decision",
    type: "major",
    category: "education_choices",
    stages: ["adolescence"],
    minAge: 17,
    maxAge: 18,
    conditions: [
      { type: "attribute", target: "education", operator: ">=", value: 40 },
    ],
    exclusions: [],
    prerequisites: [],
    weight: 90,
    maxOccurrences: 1,
    isMilestone: true,
    format: "visual_novel",
    content: {
      dialogue: [
        {
          speaker: "Narrator",
          text: "The acceptance letter sits on the kitchen table.",
          emotion: "contemplative",
        },
        {
          speaker: "Narrator",
          text:
            "Your parents exchange a look you can't quite read. Pride? Worry? " +
            "Both, probably.",
        },
        {
          speaker: "Narrator",
          text:
            "This is the first decision that feels like it belongs entirely to you. " +
            "Not your parents' plan. Not your teachers' advice. Yours.",
          emotion: "emotional",
        },
      ],
      choices: [
        {
          id: "attend_college",
          label: "Accept — go to college",
          effects: [
            { type: "attribute", target: "education", operation: "add", value: 15 },
            { type: "attribute", target: "wealth", operation: "add", value: -10 },
            { type: "tag", target: "college_student", operation: "add_tag", value: "" },
            { type: "attribute", target: "stress", operation: "add", value: 5 },
            {
              type: "attribute",
              target: "career",
              operation: "add",
              value: 8,
              delay: 4,
              narrative:
                "Your degree opens doors you didn't know existed. The late nights " +
                "and dining hall food were worth it.",
            },
          ],
          narrative:
            "You pack your bags with a mix of terror and excitement. The campus " +
            "feels enormous on move-in day, but by the end of the first week, it " +
            "starts to feel like possibility.",
          branchPoint: true,
        },
        {
          id: "skip_college",
          label: "Decline — enter the workforce",
          effects: [
            { type: "attribute", target: "career", operation: "add", value: 8 },
            { type: "attribute", target: "wealth", operation: "add", value: 5 },
            { type: "tag", target: "workforce_early", operation: "add_tag", value: "" },
            { type: "spectrum", target: "ambition", operation: "add", value: 10 },
            {
              type: "attribute",
              target: "wealth",
              operation: "add",
              value: 10,
              delay: 3,
              narrative:
                "Three years of real-world experience have given you a head start " +
                "your college-bound friends are only now catching up to.",
            },
          ],
          narrative:
            "You fold the letter and put it in a drawer. There's a world out there " +
            "that doesn't require a classroom. By Monday, you're looking for work.",
          branchPoint: true,
        },
      ],
    },
    effects: [],
    choices: undefined,
    tags: ["education", "independence", "defining_moment"],
    rarity: "common",
    author: "seed",
  },

  // -----------------------------------------------------------------------
  // Age 25: Career crossroads
  // -----------------------------------------------------------------------
  {
    id: "young_adult_career_crossroads",
    type: "major",
    category: "career_start",
    stages: ["youngAdult"],
    minAge: 24,
    maxAge: 26,
    conditions: [
      { type: "attribute", target: "career", operator: ">=", value: 20 },
    ],
    exclusions: [],
    prerequisites: [],
    weight: 80,
    maxOccurrences: 1,
    isMilestone: true,
    format: "scenario_card",
    content: {
      setup:
        "Your boss pulls you aside after a meeting. There's an opening — a real " +
        "position, not the entry-level work you've been doing. Better pay, more " +
        "responsibility, longer hours. At the same time, a friend from college has " +
        "been texting about a startup idea. It's risky, unpaid at first, but it " +
        "could be something. You stare at the ceiling that night, running the " +
        "numbers and the feelings.",
      choices: [
        {
          id: "take_promotion",
          label: "Take the promotion",
          description: "Stable career growth with a clear path",
          effects: [
            { type: "attribute", target: "career", operation: "add", value: 12 },
            { type: "attribute", target: "wealth", operation: "add", value: 8 },
            { type: "attribute", target: "stress", operation: "add", value: 10 },
            { type: "spectrum", target: "ambition", operation: "add", value: 8 },
            {
              type: "attribute",
              target: "wealth",
              operation: "add",
              value: 10,
              delay: 5,
              narrative:
                "The steady climb paid off. You've built something solid — a career " +
                "people respect, even if you sometimes wonder about the road not taken.",
            },
          ],
          narrative:
            "You shake your boss's hand. The new title feels heavier than you " +
            "expected. The hours are real, but so is the paycheck. You text your " +
            "friend: 'Sorry, can't do it. Good luck though.' You mean it.",
          branchPoint: true,
        },
        {
          id: "join_startup",
          label: "Join the startup",
          description: "High risk, high potential, uncertain path",
          effects: [
            { type: "attribute", target: "wealth", operation: "add", value: -15 },
            { type: "attribute", target: "stress", operation: "add", value: 15 },
            { type: "attribute", target: "career", operation: "add", value: -5 },
            { type: "spectrum", target: "courage", operation: "add", value: 12 },
            { type: "tag", target: "entrepreneur", operation: "add_tag", value: "" },
            {
              type: "attribute",
              target: "career",
              operation: "add",
              value: 20,
              delay: 4,
              probability: 0.6,
              narrative:
                "Against all odds, the startup found its footing. Those terrifying " +
                "early months turned into something you're genuinely proud of.",
            },
            {
              type: "attribute",
              target: "wealth",
              operation: "add",
              value: -10,
              delay: 2,
              probability: 0.4,
              narrative:
                "The startup burned through its runway faster than expected. The " +
                "dream isn't dead, but your savings took a hit.",
            },
          ],
          narrative:
            "You hand in your resignation letter with sweating palms. Your boss " +
            "looks disappointed. Your friend looks thrilled. The garage office is " +
            "cramped and smells like coffee and anxiety. It feels terrifying. It " +
            "feels alive.",
          branchPoint: true,
        },
      ],
    },
    effects: [],
    choices: undefined,
    tags: ["career", "risk", "defining_moment"],
    rarity: "common",
    author: "seed",
  },
];
