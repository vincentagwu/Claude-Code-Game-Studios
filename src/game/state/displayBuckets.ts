/**
 * Display bucket helpers — map numeric values to player-facing labels.
 *
 * The player never sees raw numbers. These functions convert internal
 * attribute/spectrum values into qualitative labels for the dashboard.
 *
 * @see design/gdd/character-state-model.md — Layer 3 & Layer 2
 */

import type { AttributeName, SpectrumName } from "./types";

// ---------------------------------------------------------------------------
// Attribute display buckets (0-100 scale)
// ---------------------------------------------------------------------------

const ATTRIBUTE_BUCKETS: Record<
  AttributeName,
  readonly [label: string, minValue: number][]
> = {
  health: [
    ["Thriving", 80],
    ["Healthy", 60],
    ["Fair", 40],
    ["Struggling", 20],
    ["Critical", 0],
  ],
  wealth: [
    ["Wealthy", 80],
    ["Comfortable", 60],
    ["Getting By", 40],
    ["Tight", 20],
    ["Poverty", 0],
  ],
  education: [
    ["Scholar", 80],
    ["Educated", 60],
    ["Average", 40],
    ["Undereducated", 20],
    ["Uneducated", 0],
  ],
  career: [
    ["Accomplished", 80],
    ["Established", 60],
    ["Developing", 40],
    ["Entry-level", 20],
    ["Unemployed", 0],
  ],
  relationships: [
    ["Beloved", 80],
    ["Connected", 60],
    ["Some Friends", 40],
    ["Lonely", 20],
    ["Isolated", 0],
  ],
  happiness: [
    ["Joyful", 80],
    ["Content", 60],
    ["Okay", 40],
    ["Unhappy", 20],
    ["Miserable", 0],
  ],
  stress: [
    ["Breaking Point", 80],
    ["Overwhelmed", 60],
    ["Manageable", 40],
    ["Calm", 20],
    ["Serene", 0],
  ],
};

/** Returns the qualitative label for an attribute value (e.g., Health 75 → "Healthy"). */
export function getDisplayBucket(attribute: AttributeName, value: number): string {
  const buckets = ATTRIBUTE_BUCKETS[attribute];
  for (const [label, minValue] of buckets) {
    if (value >= minValue) {
      return label;
    }
  }
  return buckets[buckets.length - 1][0];
}

// ---------------------------------------------------------------------------
// Personality spectrum labels (-100 to +100 scale)
// ---------------------------------------------------------------------------

const SPECTRUM_LABELS: Record<
  SpectrumName,
  { negativePole: string; positivePole: string }
> = {
  courage: { negativePole: "Cautious", positivePole: "Brave" },
  generosity: { negativePole: "Selfish", positivePole: "Generous" },
  sociability: { negativePole: "Introverted", positivePole: "Social" },
  ambition: { negativePole: "Content", positivePole: "Ambitious" },
  empathy: { negativePole: "Detached", positivePole: "Empathetic" },
  conformity: { negativePole: "Rebellious", positivePole: "Conformist" },
};

/** Returns a qualitative personality label (e.g., courage 75 → "Brave"). */
export function getPersonalityLabel(spectrum: SpectrumName, value: number): string {
  const { negativePole, positivePole } = SPECTRUM_LABELS[spectrum];

  if (value >= 60) return positivePole;
  if (value >= 30) return `Somewhat ${positivePole.toLowerCase()}`;
  if (value > -30) return "Neutral";
  if (value > -60) return `Somewhat ${negativePole.toLowerCase()}`;
  return negativePole;
}
