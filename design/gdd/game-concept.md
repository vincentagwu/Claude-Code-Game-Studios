# Game Concept: LifePath

*Created: 2026-03-22*
*Status: Draft*

---

## Elevator Pitch

> Live an entire human life from birth to death — born into random circumstances
> you don't control, gaining agency as you age, making choices that ripple across
> your lifetime and into the next generation. After death, explore the roads not
> taken through a branching life tree, or continue the story through your children
> who inherit the world you shaped.

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | Life Simulator / Interactive Narrative / Choice-Driven |
| **Platform** | Web (responsive PWA) + Mobile browsers; potential native app wrapper |
| **Target Audience** | Narrative-curious gamers, 18-35, who enjoy "what if" exploration (see Player Profile) |
| **Player Count** | Single-player |
| **Session Length** | 30-60 minutes per life |
| **Monetization** | TBD (premium or freemium — to be decided after MVP validation) |
| **Estimated Scope** | Large (9-12+ months for full vision) |
| **Comparable Titles** | BitLife, Reigns, Crusader Kings 3, 80 Days |

---

## Core Fantasy

You get to live an entire human life — not your own, but one shaped by
circumstances you didn't choose and decisions you did. The fantasy isn't power
or escapism; it's **perspective**. What would your life look like if you'd been
born somewhere else, to someone else? What if you'd made that other choice at 18?

This game lets you answer questions you can never answer in real life:
*"What if I had taken the other path?"*

The emotional promise is a blend of **reflection** ("that could have been me"),
**empathy** ("now I understand what that's like"), **accomplishment** ("I built
something meaningful from nothing"), and **curiosity** ("what happens if I try
the opposite next time?").

---

## Unique Hook

Like BitLife, AND ALSO every major life moment plays out as a rich narrative
scene (not just a text popup), your choices create a visual branching tree you
can explore after death, and your children inherit the consequences of your
decisions — making each generation a new game built on the last.

Three layers, one game:
1. **The Life** — deep, narrative-driven life simulation
2. **The Tree** — visual map of all paths taken and not taken
3. **The Legacy** — generational continuity where your past shapes their future

---

## Player Experience Analysis (MDA Framework)

### Target Aesthetics (What the player FEELS)

| Aesthetic | Priority | How We Deliver It |
| ---- | ---- | ---- |
| **Sensation** (sensory pleasure) | 6 | Clean minimalist design, satisfying timeline scroll, ambient audio |
| **Fantasy** (make-believe, role-playing) | 2 | Living someone else's life, experiencing circumstances unlike your own |
| **Narrative** (drama, story arc) | 1 | Deep story scenes at life turning points, character relationships, life arcs |
| **Challenge** (obstacle course, mastery) | 5 | Navigating difficult life circumstances, optimizing outcomes across generations |
| **Fellowship** (social connection) | N/A | Single-player; potential future sharing features |
| **Discovery** (exploration, secrets) | 3 | Branching paths, rare life events, hidden outcomes, generational surprises |
| **Expression** (self-expression, creativity) | 4 | Building a unique life, shaping your family tree, defining your legacy |
| **Submission** (relaxation, comfort zone) | 7 | Meditative timeline scroll during routine years, low-pressure pacing |

### Key Dynamics (Emergent player behaviors)

- Players will replay lives to explore alternate branches ("what if I'd picked
  the other college?")
- Players will emotionally invest in their character's relationships and feel
  genuine loss when life events take them away
- Players will try to "fix" their parents' mistakes in the next generation
- Players will share their life trees and compare wildly different outcomes
  from similar starting conditions
- Players will seek out rare or unusual life events to fill out their tree

### Core Mechanics (Systems we build)

1. **Timeline Engine** — Time progression system with accelerated routine years
   and decelerated milestone moments. The backbone of pacing.
2. **Choice & Consequence System** — Branching decision trees with cascading
   effects tracked through traits, flags, relationships, and stats. Choices at
   age 12 can trigger events at age 40.
3. **Life Event Generator** — Procedural + handcrafted hybrid system that
   produces minor timeline events and triggers major narrative moments based on
   age, traits, circumstances, and previous choices.
4. **Branching Tree Visualizer** — Interactive visual map showing the player's
   life path and all unexplored branches. Serves as the replay hub.
5. **Generational Inheritance System** — Transfers wealth, trauma, advantages,
   relationships, and world-state from parent's life to child's starting
   conditions.

---

## Player Motivation Profile

### Primary Psychological Needs Served

| Need | How This Game Satisfies It | Strength |
| ---- | ---- | ---- |
| **Autonomy** (freedom, meaningful choice) | Every major life moment offers meaningful choices with real consequences. Agency grows naturally with age — you can't choose as a baby, but by adulthood, the world is open. | Core |
| **Competence** (mastery, skill growth) | Players learn which choices lead to which outcomes over multiple lives. Understanding the consequence system IS the skill. Generational play rewards long-term strategic thinking. | Supporting |
| **Relatedness** (connection, belonging) | Deep narrative scenes build genuine emotional connections with in-game family, friends, and partners. Generational play creates care for characters you created. | Core |

### Player Type Appeal (Bartle Taxonomy)

- [x] **Explorers** (discovery, understanding systems, finding secrets) — How:
  Branching tree exploration, rare event discovery, alternate path curiosity.
  PRIMARY audience.
- [x] **Achievers** (goal completion, collection, progression) — How: Life
  milestones, rare achievements, completing the family tree, epitaph collection.
  SECONDARY audience.
- [ ] **Socializers** (relationships, cooperation, community) — How: Future
  feature — sharing life trees, comparing outcomes. Not in MVP.
- [ ] **Killers/Competitors** (domination, PvP, leaderboards) — Not served.
  This is not a competitive game.

### Flow State Design

- **Onboarding curve**: The game starts you as a baby — zero agency, pure
  observation. This IS the tutorial. You watch life happen, learn the timeline
  interface, and gradually gain choices as you age. By teen years, you're
  making real decisions and understand the system.
- **Difficulty scaling**: Early-life choices are low-stakes and reversible.
  Adult choices become more consequential and permanent. Elder-life choices
  have legacy implications. Difficulty is narrative weight, not mechanical
  complexity.
- **Feedback clarity**: Choices visibly shift your life trajectory — career
  changes, relationship status, living situation, and the branching tree
  updates in real-time showing paths opening and closing.
- **Recovery from failure**: Death isn't failure — it's completion. A "bad"
  life is still a story worth telling. The tree and generational systems
  let you explore what-ifs or try to course-correct through the next
  generation.

---

## Core Loop

### Moment-to-Moment (30 seconds)

The timeline scrolls forward through your life. Small events appear and
disappear — "You learned to ride a bike," "You got into a fight at school,"
"Your grandmother visited." Occasionally, a minor choice appears inline:
"Your friend dares you to sneak out — do you?" These are quick, personality-
building micro-decisions. The player is always watching, reading, and
occasionally choosing.

### Short-Term (5-15 minutes)

A life stage plays out (childhood, teen years, young adulthood, etc.). The
timeline scrolls through routine years with pop-up events, then **stops** at
a major crossroads. The format shifts to a rich scene — maybe a visual-novel
dialogue for your first love, a scenario card for "which career do you
pursue?", or a mini-narrative for a family crisis. You make the big choice.
Your life path visibly shifts. The timeline resumes.

### Session-Level (30-60 minutes)

One complete life: Birth → Childhood → Teens → Young Adult → Career →
Relationships → Midlife → Aging → Death. At death, you see your life
summary — an epitaph capturing who you were, what you achieved, what you
lost. The branching tree reveals your path among all possible paths. Natural
stopping point, but the tree invites "one more life."

### Long-Term Progression

Across multiple lives, the player builds out:
- A **branching life tree** showing every path explored and every road not taken
- A **family dynasty** where each generation inherits the last
- A **collection of epitaphs** — unique life summaries from radically different lives
- **Rare event discovery** — unusual life events that only trigger under specific
  conditions, rewarding replay and experimentation

### Retention Hooks

- **Curiosity**: "What would have happened if I'd chosen differently at that
  crossroads?" The tree visualization makes unexplored paths visible and
  inviting.
- **Investment**: "My character's daughter inherited the family business I built
  — I want to see what she does with it." Generational continuity creates
  emotional stakes.
- **Mastery**: "Can I build a better life if I understand the systems better?
  Can I find the rarest life events?" Systems knowledge rewards replay.
- **Social** (future): "My life tree looks completely different from my friend's,
  even though we started in the same circumstances." Shareable outcomes.

---

## Game Pillars

### Pillar 1: Every Choice Echoes

Decisions have visible, lasting consequences. No throwaway choices. If you
chose to skip college, that follows you for decades. If you were kind to
someone at age 12, it might matter at 40. The consequence system is the
game's core promise.

*Design test*: "Should we add a choice that doesn't connect to any future
outcome?" — No. Every choice must ripple forward, even if the ripple is
small. Dead-end choices betray the pillar.

### Pillar 2: Life is Unfair (and That's the Point)

Starting conditions are random and unequal. Some lives begin privileged,
some don't. The game does not pretend life is a level playing field. This
contrast drives empathy ("now I understand"), replayability ("what if I'd
started differently?"), and emotional authenticity.

*Design test*: "Should we let players choose their starting conditions?" —
No. Randomness is essential. The lack of control over your birth is what
creates the game's emotional core.

### Pillar 3: Time Never Stops

The timeline always moves forward. You cannot grind, pause to optimize, or
go back mid-life. Every life ends. This creates urgency, makes choices feel
weighty, and prevents the game from becoming a stat-optimization puzzle.

*Design test*: "Should we add a way to undo a choice or rewind time?" — No.
Forward only. The tree exists for exploring alternate paths AFTER death, not
during life.

### Pillar 4: The Road Not Taken

The branching tree is always present. The game constantly reminds you that
other paths existed. Curiosity about "what if" is the primary replay
motivation. The tree is not just a feature — it's the game's visual identity.

*Design test*: "Should we hide alternate paths to avoid overwhelming new
players?" — No. Visible branches create desire. Seeing the road not taken
is what makes players start another life.

### Anti-Pillars (What This Game Is NOT)

- **NOT a number-crunching optimizer**: Stats exist under the hood, but the
  primary interface is narrative, not spreadsheets. "Happiness: 73" is not
  how this game communicates. If a feature turns the game into a stat
  optimization puzzle, it violates the narrative pillar.
- **NOT a sandbox with no structure**: Players cannot do anything at any
  time. Life has constraints — age gates, circumstantial limitations,
  opportunity windows that close. Structure creates meaning.
- **NOT a power fantasy**: Not every life ends in success. Some lives are
  hard. Some end early. Some are quietly ordinary. That's what makes the
  extraordinary moments meaningful. If every life is "winnable," the game
  loses its emotional authenticity.

---

## Inspiration and References

| Reference | What We Take From It | What We Do Differently | Why It Matters |
| ---- | ---- | ---- | ---- |
| BitLife | Proved life simulation has massive casual appeal (100M+ downloads). Quick life-through-tapping format. | We add narrative depth at key moments instead of pure text popups. Mixed formats instead of uniform presentation. | Validates the market exists and is huge |
| Reigns | Proved that "swipe to choose, consequences cascade" is a compelling game loop. Elegant simplicity. | We use a timeline scroll instead of card swipes, and our consequence chains span decades, not just a few turns. | Validates the choice-consequence core loop |
| Crusader Kings 3 | Proved that generational dynasty simulation has a dedicated audience. Emergent narrative through systems. | We focus on the personal/emotional scale, not political strategy. One life at a time, deeply felt, not managing an empire. | Validates the generational legacy layer |
| 80 Days (Inkle) | Proved that branching narrative with visible replay paths works commercially on web/mobile. Beautiful writing at scale. | We apply the branching approach to an entire lifespan instead of a single journey. The tree IS the map. | Validates branching replay on our target platform |

**Non-game inspirations**:
- *The Midnight Library* (Matt Haig) — A novel about exploring all the lives
  you could have lived. Direct thematic inspiration for the branching tree.
- *Boyhood* (Richard Linklater) — A film that captures the feeling of time
  passing and a life unfolding. Inspiration for the timeline scroll pacing.
- *This Is Us* (TV series) — Multi-generational storytelling where past
  choices echo in present lives. Inspiration for the generational layer.

---

## Target Player Profile

| Attribute | Detail |
| ---- | ---- |
| **Age range** | 18-35 |
| **Gaming experience** | Casual to mid-core; comfortable with narrative games and mobile/web games |
| **Time availability** | 30-60 minute sessions; plays during commute, before bed, or in short bursts |
| **Platform preference** | Mobile browser or desktop web; values accessibility over graphical fidelity |
| **Current games they play** | BitLife, Reigns, Florence, 80 Days, Slay the Princess, or similar choice-narrative games |
| **What they're looking for** | A life sim with more depth and emotional weight than BitLife; meaningful choices, not just random tapping |
| **What would turn them away** | Excessive stat management, slow pacing, lack of narrative variety, repetitive events across playthroughs |

---

## Technical Considerations

| Consideration | Assessment |
| ---- | ---- |
| **Recommended Stack** | Web-native: React/Next.js or Svelte frontend, JSON-driven event system, serverless backend. No traditional game engine needed — this is a narrative/UI-driven game. |
| **Key Technical Challenges** | 1) Consequence tracking across decades of choices (flag/trait system at scale). 2) Content volume — enough narrative variety for replay. 3) Branching tree visualization that stays readable as it grows. 4) Procedural event generation that feels authored, not random. |
| **Art Style** | Minimalist / Abstract — clean typography, subtle illustrations, icon-driven UI. The timeline and tree are the primary visual elements. |
| **Art Pipeline Complexity** | Low — typography-first design with occasional illustrations for major life moments. SVG/vector assets scale to any screen. |
| **Audio Needs** | Moderate — ambient soundtrack that shifts with life stage (playful childhood → energetic youth → contemplative elder). UI sounds for choices and timeline events. |
| **Networking** | Minimal — save data sync, user accounts. Potential future: shared life tree comparison. |
| **Content Volume** | ~8 life stages, ~15-20 major event types with variants, ~200+ minor timeline events, ~200+ branching choice points. Procedural mixing multiplies effective content. |
| **Procedural Systems** | Hybrid procedural/handcrafted: minor events are procedurally selected and parameterized; major life moments are handcrafted with procedural triggers and variable details. |

---

## Risks and Open Questions

### Design Risks
- **Repetition on replay**: Life events may feel samey after 3-5 lives.
  Mitigation: large event pool, procedural variation, rare events that only
  trigger under specific conditions.
- **The "boring middle"**: Adult routine years (30-50) risk feeling like a
  slog between interesting choices. Mitigation: accelerated timeline pacing,
  surprise crisis events, relationship dynamics that create drama.
- **Generational attachment**: Players may not care about a new character
  after investing in their parent. Mitigation: strong inheritance mechanics
  that make the new life feel connected, not reset.

### Technical Risks
- **Consequence graph complexity**: Tracking cascading effects across decades
  and generations could become unmaintainable. Mitigation: trait/flag system
  with bounded propagation rules, not full state simulation.
- **Content authoring at scale**: Hundreds of narrative events need writing,
  testing, and balancing. Mitigation: modular event templates with variable
  slots; potential AI-assisted content generation for minor events.
- **Tree visualization performance**: A heavily-branched tree could become
  unreadable or slow. Mitigation: progressive disclosure, zoom levels,
  summary views for deep branches.

### Market Risks
- **BitLife comparison**: Players may dismiss this as "another BitLife" before
  understanding the depth difference. Mitigation: the tree visualization is
  the key visual differentiator — lead marketing with it.
- **Niche audience**: Deep narrative life sims may appeal to a smaller
  audience than casual life sims. Mitigation: the timeline scroll pacing
  keeps it accessible to casual players while depth appeals to mid-core.

### Scope Risks
- **Content volume exceeds solo capacity**: A solo developer writing hundreds
  of narrative events while building the tech is a massive workload. Mitigation:
  modular content system that allows incremental expansion; ship MVP with
  less content and expand post-launch.
- **Three-layer complexity**: Implementing Life + Tree + Legacy simultaneously
  could balloon scope. Mitigation: strict layer-by-layer development — MVP
  is Layer 1 only.

### Open Questions
- **Monetization model**: Premium ($5-10), freemium (free first life, pay for
  tree + generations), or subscription? Needs market research and player
  testing.
- **AI-assisted content**: Can LLMs help generate minor event text at
  sufficient quality? Needs prototyping.
- **Optimal life length**: Is 30-60 minutes per life the right pacing?
  Needs playtesting — too short feels shallow, too long feels exhausting.
- **Generation limit**: How many generations should one dynasty span before
  the experience dilutes? Needs playtesting.

---

## MVP Definition

**Core hypothesis**: Players find it compelling to live a procedurally-varied
human life from birth to death, making choices that visibly shape their path,
and are motivated to replay to explore alternate outcomes.

**Required for MVP**:
1. Random starting conditions (family, location, socioeconomic class)
2. Timeline scroll with minor pop-up events across 8 life stages
3. 10+ major life moments in mixed formats (visual novel, scenario card,
   mini-narrative)
4. Choice-consequence system with visible effects on life trajectory
5. End-of-life summary / epitaph
6. Basic branching tree visualization (see paths taken and not taken)
7. Ability to replay from any crossroads in the tree

**Explicitly NOT in MVP** (defer to later):
- Generational inheritance system (Layer 3)
- User accounts and save syncing
- Audio / soundtrack
- Social features (sharing, comparing trees)
- Monetization systems
- Mobile app wrapper (web-only for MVP)

### Scope Tiers (if budget/time shrinks)

| Tier | Content | Features | Timeline |
| ---- | ---- | ---- | ---- |
| **MVP** | 1 complete life, ~50 events | Timeline + choices + basic tree | 6 months |
| **v1.0** | Full event variety, ~200 events | Polished tree, audio, accounts | 9 months |
| **v1.5** | Generational content | Legacy system (Layer 3) | 12 months |
| **Full Vision** | Deep content, rare events, social | Sharing, leaderboards, mobile app | 15+ months |

---

## Next Steps

- [ ] Configure technology stack — since this is web-native, update CLAUDE.md with React/Svelte + web stack (not a game engine)
- [ ] Validate concept with `/design-review design/gdd/game-concept.md`
- [ ] Discuss vision with the `creative-director` agent for pillar refinement
- [ ] Decompose into systems with `/map-systems` — identify all subsystems, map dependencies, prioritize build order
- [ ] Author per-system GDDs with `/design-system` (Timeline Engine, Choice System, Event Generator, Tree Visualizer, Inheritance System)
- [ ] Prototype the core loop with `/prototype timeline-scroll` — build a single life stage with timeline + events + one major moment
- [ ] Playtest the prototype with `/playtest-report` to validate the core hypothesis
- [ ] Plan first milestone with `/sprint-plan new`
