// LED advertising boards between the stand and the pitch: what each panel
// says, and where the panels are as they scroll. Drawing is in StadiumBackground.

import type { Match } from "../../engine/types";
import { textColorOn } from "../colors";

export interface BoardPanel {
  text: string;
  background: string;
  color: string;
}

export interface PlacedPanel extends BoardPanel {
  /** Left edge in CSS pixels; may be negative (partly off screen). */
  x: number;
}

/** Width of one panel in CSS pixels. */
export const PANEL_WIDTH = 220;

const SCOREBOARD = { background: "#0a120e", color: "#d4ff3a" };
const ACCENT = { background: "#d4ff3a", color: "#08150f" };
const BROADCAST = { background: "#ff2d5f", color: "#ffffff" };

/** Boards for the home page: our own name and slogans, no real brands. */
export function homeBoards(): BoardPanel[] {
  return [
    { text: "SCORDLE", ...SCOREBOARD },
    { text: "MATCHDAY", ...ACCENT },
    { text: "GUESS THE SCORE", ...SCOREBOARD },
    { text: "ONE MATCH A DAY", ...BROADCAST },
  ];
}

/** Boards for a match: our name plus each team's name in its own colors. */
export function matchBoards(match: Match): BoardPanel[] {
  const team = (name: string, background: string) => ({
    text: name.toUpperCase(),
    background,
    color: textColorOn(background),
  });
  return [
    { text: "SCORDLE", ...SCOREBOARD },
    team(match.homeTeam.name, match.homeTeam.colors.primary),
    { text: "MATCHDAY", ...ACCENT },
    team(match.awayTeam.name, match.awayTeam.colors.primary),
  ];
}

/** How far the boards have scrolled at `time` seconds, looping every `loopWidth` pixels. */
export function scrollOffset(time: number, speed: number, loopWidth: number): number {
  if (loopWidth <= 0) return 0;
  return (time * speed) % loopWidth;
}

/**
 * The panels that are (at least partly) on screen, left to right, after
 * scrolling `offset` pixels to the left. The panel list repeats forever.
 */
export function visiblePanels(
  panels: BoardPanel[],
  width: number,
  offset: number,
  panelWidth = PANEL_WIDTH,
): PlacedPanel[] {
  if (panels.length === 0 || panelWidth <= 0) return [];
  const loop = panels.length * panelWidth;
  const shift = ((offset % loop) + loop) % loop; // 0 <= shift < loop

  const placed: PlacedPanel[] = [];
  for (let i = 0, x = -shift; x < width; i++, x += panelWidth) {
    if (x + panelWidth > 0) placed.push({ ...panels[i % panels.length]!, x });
  }
  return placed;
}
