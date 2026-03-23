/**
 * Fallback events — universal, no-condition events that fire when
 * no other eligible events exist. Ensures no year is ever empty.
 *
 * @see design/gdd/event-content-database.md — Fallback Events
 */

import type { MinorEventTemplate } from "../events/types";

export const FALLBACK_EVENTS: readonly MinorEventTemplate[] = [
  makeFallback("fallback_quiet_01", ["infancy", "earlyChildhood"],
    "A {adjective} day passes. {moment}",
    [
      { name: "adjective", source: "pool", pool: ["warm", "gentle", "quiet", "peaceful"] },
      { name: "moment", source: "pool", pool: ["The world feels safe.", "You sleep soundly.", "Sunlight fills the room."] },
    ]),
  makeFallback("fallback_quiet_02", ["childhood"],
    "A {adjective} day at {place}. {thought}",
    [
      { name: "adjective", source: "pool", pool: ["normal", "ordinary", "sunny", "rainy"] },
      { name: "place", source: "pool", pool: ["school", "home", "the park", "the library"] },
      { name: "thought", source: "pool", pool: ["Nothing remarkable happens, but life goes on.", "You think about what to have for dinner.", "Time passes like it always does."] },
    ]),
  makeFallback("fallback_quiet_03", ["adolescence"],
    "Another {day_type} in {location}. {feeling}",
    [
      { name: "day_type", source: "pool", pool: ["school day", "weekend", "long afternoon", "restless evening"] },
      { name: "location", source: "state", stateQuery: "identity.location" },
      { name: "feeling", source: "pool", pool: ["You feel like something is about to change.", "The days blur together.", "You stare out the window.", "Music fills the silence."] },
    ]),
  makeFallback("fallback_quiet_04", ["youngAdult"],
    "The {season} passes without incident. {reflection}",
    [
      { name: "season", source: "pool", pool: ["spring", "summer", "autumn", "winter"] },
      { name: "reflection", source: "pool", pool: ["You're finding your rhythm.", "Life is busy but manageable.", "You wonder where the time goes.", "Some weeks feel like months."] },
    ]),
  makeFallback("fallback_quiet_05", ["adult"],
    "A {adjective} stretch of months. {routine}",
    [
      { name: "adjective", source: "pool", pool: ["steady", "uneventful", "comfortable", "routine"] },
      { name: "routine", source: "pool", pool: ["Work, home, sleep, repeat.", "The bills get paid. The days pass.", "You settle into a rhythm you didn't plan.", "Stability has its own quiet comfort."] },
    ]),
  makeFallback("fallback_quiet_06", ["midlife"],
    "The year {verb}. {thought}",
    [
      { name: "verb", source: "pool", pool: ["unfolds quietly", "passes without drama", "slips by", "moves at its own pace"] },
      { name: "thought", source: "pool", pool: ["You notice the seasons more than you used to.", "Time feels different now.", "The mirror shows someone you're still getting to know.", "You catch yourself thinking about the past more often."] },
    ]),
  makeFallback("fallback_quiet_07", ["elder"],
    "A {adjective} day. {moment}",
    [
      { name: "adjective", source: "pool", pool: ["peaceful", "slow", "quiet", "gentle"] },
      { name: "moment", source: "pool", pool: ["The morning light feels precious.", "You sit with your thoughts and find them good company.", "Some days, doing nothing is enough.", "The world outside moves fast. In here, time is kind."] },
    ]),
  // Additional universal fallbacks
  makeFallback("fallback_seasons_01", ["childhood", "adolescence", "youngAdult", "adult", "midlife", "elder"],
    "The seasons change. {observation}",
    [
      { name: "observation", source: "pool", pool: ["Spring brings new growth.", "Summer stretches long and warm.", "Autumn colors fill the streets.", "Winter settles in like an old friend.", "The year turns."] },
    ]),
  makeFallback("fallback_memory_01", ["adolescence", "youngAdult", "adult", "midlife", "elder"],
    "You {action} and think about {subject}. {conclusion}",
    [
      { name: "action", source: "pool", pool: ["look through old photos", "hear a familiar song", "smell something from childhood", "run into an old acquaintance"] },
      { name: "subject", source: "pool", pool: ["how much has changed", "the person you used to be", "roads not taken", "the small moments that mattered most"] },
      { name: "conclusion", source: "pool", pool: ["You smile.", "It stirs something you can't name.", "Life is strange.", "The moment passes."] },
    ]),
  makeFallback("fallback_weather_01", ["childhood", "adolescence", "youngAdult", "adult"],
    "A {weather} day. You spend it {activity}.",
    [
      { name: "weather", source: "pool", pool: ["rainy", "sunny", "overcast", "breezy", "snowy"] },
      { name: "activity", source: "pool", pool: ["inside, doing nothing in particular", "wandering without purpose", "catching up on things you've been putting off", "enjoying the quiet"] },
    ]),
  makeFallback("fallback_night_01", ["adolescence", "youngAdult", "adult", "midlife"],
    "Late at night, you {action}. {thought}",
    [
      { name: "action", source: "pool", pool: ["can't sleep", "stare at the ceiling", "scroll through your phone", "listen to the quiet"] },
      { name: "thought", source: "pool", pool: ["Tomorrow will be different. Or maybe the same.", "Your mind wanders to places you don't visit during the day.", "Eventually, sleep comes.", "The silence is louder than you expected."] },
    ]),
  makeFallback("fallback_small_joy_01", ["childhood", "adolescence", "youngAdult", "adult", "midlife", "elder"],
    "A small {joy}. {reaction}",
    [
      { name: "joy", source: "pool", pool: ["kindness from a stranger", "perfect cup of coffee", "sunset that stops you in your tracks", "moment of unexpected laughter", "song on the radio that hits just right"] },
      { name: "reaction", source: "pool", pool: ["It makes the day worthwhile.", "You carry it with you for hours.", "These moments matter more than they should.", "You almost miss it, but you don't."] },
    ]),
  makeFallback("fallback_elder_reflect_01", ["elder"],
    "You {action}. {wisdom}",
    [
      { name: "action", source: "pool", pool: ["watch the birds outside your window", "read a book you've read before", "call someone just to hear their voice", "sit in the garden"] },
      { name: "wisdom", source: "pool", pool: ["The simple things were always the best things.", "You wish you'd known that sooner.", "There's peace in repetition.", "Every day is a gift you used to take for granted."] },
    ]),
  makeFallback("fallback_infancy_01", ["infancy", "earlyChildhood"],
    "You {milestone}. {reaction}",
    [
      { name: "milestone", source: "pool", pool: ["learn a new word", "take a few wobbly steps", "reach for something just out of grasp", "laugh at something only you understand"] },
      { name: "reaction", source: "pool", pool: ["The world is enormous and fascinating.", "Everything is new.", "You don't know it yet, but this is the beginning."] },
    ]),
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function makeFallback(
  id: string,
  stages: string[],
  template: string,
  variables: MinorEventTemplate["variables"]
): MinorEventTemplate {
  return {
    id,
    type: "minor",
    category: "fallback",
    stages: stages as MinorEventTemplate["stages"],
    minAge: 0,
    maxAge: 120,
    conditions: [],
    exclusions: [],
    prerequisites: [],
    weight: 20,
    maxOccurrences: 5,
    isMilestone: false,
    format: "timeline_popup",
    content: { text: "" },
    effects: [],
    tags: [],
    rarity: "common",
    author: "seed",
    template,
    variables,
  };
}
