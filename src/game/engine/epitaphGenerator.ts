/**
 * Epitaph Generator — creates a narrative life summary at death.
 *
 * Reads the final character state and produces a structured epitaph
 * with named relationships, narrative paragraphs, and life milestones.
 *
 * @see design/gdd/character-state-model.md — Epitaph
 */

import type { CharacterState, AttributeName, SpectrumName, Relationship } from "../state/types";
import { getDisplayBucket, getPersonalityLabel } from "../state/displayBuckets";

export interface Epitaph {
  readonly name: string;
  readonly age: number;
  readonly location: string;
  readonly headline: string;
  readonly personality: string;
  readonly notableAttributes: string[];
  readonly lifeStory: string[];
  readonly relationships: string;
  /** Named relationship highlights (e.g., "Married to Alex for 40 years"). */
  readonly keyRelationships: string[];
  /** 2-3 paragraph narrative summary of the life. */
  readonly narrative: string;
  readonly finalWords: string;
}

/**
 * Generate an epitaph from the final character state.
 */
export function generateEpitaph(state: CharacterState): Epitaph {
  const { identity, attributes, spectrums, tags, relationships } = state;

  return {
    name: identity.name,
    age: identity.currentAge,
    location: identity.location,
    headline: generateHeadline(identity.currentAge, attributes),
    personality: generatePersonalitySummary(spectrums),
    notableAttributes: generateNotableAttributes(attributes),
    lifeStory: tags
      .filter((t) => !t.id.startsWith("region_") && !t.id.startsWith("class_") && !t.id.startsWith("family_"))
      .map((t) => formatTagForEpitaph(t.id, t.earnedAtAge)),
    relationships: generateRelationshipSummary(relationships),
    keyRelationships: generateKeyRelationships(relationships, identity.currentAge),
    narrative: generateNarrative(state),
    finalWords: generateFinalWords(attributes, identity.currentAge),
  };
}

// ---------------------------------------------------------------------------
// Headline
// ---------------------------------------------------------------------------

function generateHeadline(age: number, attrs: CharacterState["attributes"]): string {
  if (age < 20) return "A life cut tragically short.";
  if (age < 40) return "Gone too soon, with so much left undone.";

  const happiness = attrs.happiness;
  const wealth = attrs.wealth;

  if (happiness >= 70 && wealth >= 60) return "A life well-lived — full of joy and comfort.";
  if (happiness >= 70) return "A life rich in happiness, if not in wealth.";
  if (wealth >= 70) return "A life of material success, though happiness proved elusive.";
  if (happiness <= 30 && wealth <= 30) return "A life marked by hardship and struggle.";
  if (happiness <= 30) return "A life that never quite found its joy.";
  return "A life of ordinary complexity — neither triumph nor tragedy, but something real.";
}

// ---------------------------------------------------------------------------
// Personality
// ---------------------------------------------------------------------------

function generatePersonalitySummary(spectrums: CharacterState["spectrums"]): string {
  const dominant: string[] = [];

  const entries: [SpectrumName, number][] = Object.entries(spectrums) as [SpectrumName, number][];
  const strong = entries
    .filter(([, val]) => Math.abs(val) >= 30)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);

  for (const [key, val] of strong) {
    dominant.push(getPersonalityLabel(key, val).toLowerCase());
  }

  if (dominant.length === 0) return "A person of quiet neutrality — defined more by actions than temperament.";
  if (dominant.length === 1) return `Known for being ${dominant[0]}.`;
  const last = dominant.pop()!;
  return `Known for being ${dominant.join(", ")} and ${last}.`;
}

// ---------------------------------------------------------------------------
// Notable attributes
// ---------------------------------------------------------------------------

function generateNotableAttributes(attrs: CharacterState["attributes"]): string[] {
  const notable: string[] = [];
  const keys: AttributeName[] = ["health", "wealth", "education", "career", "relationships", "happiness"];

  for (const key of keys) {
    const val = attrs[key];
    const bucket = getDisplayBucket(key, val);
    if (val >= 70 || val <= 25) {
      notable.push(`${capitalize(key)}: ${bucket}`);
    }
  }

  return notable;
}

// ---------------------------------------------------------------------------
// Relationship summary
// ---------------------------------------------------------------------------

function generateRelationshipSummary(
  relationships: CharacterState["relationships"]
): string {
  const active = relationships.filter((r) => r.status === "active");
  const estranged = relationships.filter((r) => r.status === "estranged");
  const deceased = relationships.filter((r) => r.status === "deceased");

  const parts: string[] = [];
  if (active.length > 0) parts.push(`${active.length} close ${active.length === 1 ? "bond" : "bonds"}`);
  if (estranged.length > 0) parts.push(`${estranged.length} lost along the way`);
  if (deceased.length > 0) parts.push(`${deceased.length} gone before them`);

  return parts.length > 0 ? parts.join(". ") + "." : "Lived a solitary life.";
}

// ---------------------------------------------------------------------------
// Key relationships (named)
// ---------------------------------------------------------------------------

function generateKeyRelationships(
  relationships: Relationship[],
  deathAge: number
): string[] {
  const highlights: string[] = [];

  // Sort by closeness (highest first), then by met age (longest known)
  const sorted = [...relationships].sort((a, b) => {
    if (b.closeness !== a.closeness) return b.closeness - a.closeness;
    return a.metAge - b.metAge;
  });

  for (const rel of sorted.slice(0, 5)) {
    const yearsKnown = deathAge - rel.metAge;

    if (rel.type === "romantic" && rel.status === "active") {
      highlights.push(`Partnered with ${rel.name} for ${yearsKnown} years`);
    } else if (rel.type === "romantic" && rel.status === "deceased") {
      highlights.push(`Lost ${rel.name} — loved and remembered`);
    } else if (rel.type === "family" && rel.status === "active" && rel.closeness >= 50) {
      highlights.push(`Close to ${rel.name} (${rel.type})`);
    } else if (rel.type === "family" && rel.status === "deceased") {
      highlights.push(`Lost ${rel.name} along the way`);
    } else if (rel.type === "friend" && rel.status === "active" && rel.closeness >= 60) {
      highlights.push(`Best friend: ${rel.name} (${yearsKnown} years)`);
    } else if (rel.type === "friend" && rel.status === "estranged") {
      highlights.push(`Drifted from ${rel.name}`);
    } else if (rel.status === "active" && rel.closeness >= 40) {
      highlights.push(`Knew ${rel.name} for ${yearsKnown} years`);
    }
  }

  return highlights;
}

// ---------------------------------------------------------------------------
// Narrative paragraphs
// ---------------------------------------------------------------------------

function generateNarrative(state: CharacterState): string {
  const { identity, attributes, spectrums, tags, relationships } = state;
  const paragraphs: string[] = [];

  // Paragraph 1: Origin and early life
  const classLabel = identity.socioeconomicClass;
  paragraphs.push(
    `${identity.name} was born in ${identity.familyBackground.originLocation}, ` +
    `into a ${classLabel}-class family. ` +
    generateEarlyLifeSentence(tags, relationships)
  );

  // Paragraph 2: The defining years
  paragraphs.push(generateDefiningYearsParagraph(state));

  // Paragraph 3: The final chapter
  paragraphs.push(generateFinalChapter(state));

  return paragraphs.join("\n\n");
}

function generateEarlyLifeSentence(
  tags: CharacterState["tags"],
  relationships: Relationship[]
): string {
  const familyRels = relationships.filter((r) => r.type === "family");
  if (familyRels.length >= 3) {
    return "Surrounded by a large family, the early years were filled with noise and warmth.";
  }
  if (familyRels.length === 1) {
    return `Raised by ${familyRels[0].name}, the early years were shaped by a single steady presence.`;
  }
  return "The early years passed as they do — a blur of small discoveries and the quiet work of becoming someone.";
}

function generateDefiningYearsParagraph(state: CharacterState): string {
  const { attributes, tags, relationships, spectrums } = state;
  const parts: string[] = [];

  // Career
  if (attributes.career >= 70) {
    parts.push("Career became a source of pride and purpose");
  } else if (attributes.career <= 25) {
    parts.push("Work was always a struggle, never quite finding the right fit");
  }

  // Education
  if (tags.some((t) => t.id === "college_graduate" || t.id === "college_student")) {
    parts.push("education opened doors that might otherwise have stayed closed");
  }

  // Romance
  const romantic = relationships.find((r) => r.type === "romantic");
  if (romantic && romantic.status === "active") {
    parts.push(`love found its shape in ${romantic.name}`);
  } else if (tags.some((t) => t.id === "divorced" || t.id === "widowed")) {
    parts.push("love came and went, leaving its mark either way");
  }

  // Parenthood
  if (tags.some((t) => t.id === "parent")) {
    parts.push("parenthood changed everything — as it always does");
  }

  // Personality flavor
  if (Math.abs(spectrums.courage) >= 50) {
    parts.push(spectrums.courage > 0
      ? "courage was never in short supply"
      : "caution was a guiding principle");
  }

  if (parts.length === 0) {
    return "The middle years were lived quietly — not without meaning, but without spectacle. Some lives are rivers, not waterfalls.";
  }

  // Combine into prose
  const joined = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts.length === 1) return joined + ".";
  if (parts.length === 2) return `${joined}, and ${parts[1]}.`;
  return `${joined}, ${parts.slice(1, -1).join(", ")}, and ${parts[parts.length - 1]}.`;
}

function generateFinalChapter(state: CharacterState): string {
  const { identity, attributes, relationships } = state;
  const age = identity.currentAge;

  const activeRels = relationships.filter((r) => r.status === "active");
  const closeRels = activeRels.filter((r) => r.closeness >= 60);

  if (age >= 75 && attributes.happiness >= 60 && closeRels.length >= 2) {
    return `At ${age}, ${identity.name} was surrounded by people who loved them. The final years were gentle — marked not by what was lost, but by what remained.`;
  }
  if (age >= 75 && attributes.happiness >= 60) {
    return `${identity.name} lived to ${age} with a quiet contentment. Not everything went as planned, but enough did.`;
  }
  if (age >= 75) {
    return `The later years were not easy. ${identity.name} carried the weight of ${age} years — some joyful, some heavy, all theirs.`;
  }
  if (age >= 50) {
    return `${identity.name} died at ${age}, in the middle of a story that still had chapters left. What they built endures in the people they touched.`;
  }
  return `${identity.name} was only ${age}. The life was brief, but it was not small. Every year was lived.`;
}

// ---------------------------------------------------------------------------
// Final words
// ---------------------------------------------------------------------------

function generateFinalWords(
  attrs: CharacterState["attributes"],
  age: number
): string {
  if (age >= 80 && attrs.happiness >= 60) return "They left this world at peace.";
  if (age >= 80) return "A long road, walked to its end.";
  if (age >= 60 && attrs.happiness >= 50) return "There was still so much to see, but what they saw was enough.";
  if (age >= 60) return "The years took their toll, but the story was theirs.";
  if (age >= 40) return "So much left unfinished. So much still to give.";
  return "Some stories end before they should.";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTagForEpitaph(tagId: string, earnedAtAge: number): string {
  const label = tagId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${label} (age ${earnedAtAge})`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
