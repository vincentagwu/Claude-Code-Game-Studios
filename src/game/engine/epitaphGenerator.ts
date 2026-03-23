/**
 * Epitaph Generator — creates a narrative life summary at death.
 *
 * Reads the final character state and produces a structured epitaph
 * with key stats, defining traits, and notable life moments.
 *
 * @see design/gdd/character-state-model.md — Epitaph
 */

import type { CharacterState, AttributeName, SpectrumName } from "../state/types";
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
    finalWords: generateFinalWords(attributes, identity.currentAge),
  };
}

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

function formatTagForEpitaph(tagId: string, earnedAtAge: number): string {
  const label = tagId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${label} (age ${earnedAtAge})`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
