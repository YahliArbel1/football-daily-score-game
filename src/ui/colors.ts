import { competitions, type Competition } from "../data/competitions";
import type { Colors } from "../engine/types";

const WHITE = "#ffffff";
const BLACK = "#000000";

/** Colors for a competition we have no entry for yet: broadcast red and white. */
export const DEFAULT_COMPETITION_COLORS: Colors = { primary: "#ff2d5f", secondary: "#ffffff" };

/**
 * Relative luminance of a "#rrggbb" color, from 0 (black) to 1 (white),
 * using the WCAG formula. Returns null for anything that isn't "#rrggbb".
 */
export function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return null;

  const [r, g, b] = match.slice(1).map((part) => {
    const c = parseInt(part, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Text color to put on top of `background`: white, unless the background is
 * clearly light (white, yellow, light blue...), then black.
 * White is preferred on mid tones like football reds, which is how kits and
 * broadcast graphics usually look. Invalid colors get white, which suits the
 * game's dark theme.
 */
export function textColorOn(background: string): string {
  const l = luminance(background);
  if (l === null) return WHITE;
  // 0.3 sits between bright reds (~0.2, white text) and sky blue / orange
  // (~0.38, black text). Plain WCAG contrast would pick black on Milan red.
  return l > 0.3 ? BLACK : WHITE;
}

/** Colors for a competition id, or default colors if it isn't in the list. */
export function getCompetitionColors(
  id: string,
  list: Record<string, Competition> = competitions,
): Colors {
  return list[id]?.colors ?? DEFAULT_COMPETITION_COLORS;
}
