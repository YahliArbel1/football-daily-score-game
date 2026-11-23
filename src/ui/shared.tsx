// Small pieces used by more than one screen.

import type { CSSProperties } from "react";
import type { Colors, Match } from "../engine/types";
import { getCompetitionColors, textColorOn } from "./colors";

/** CSS variables that styles.css uses to paint a box in a team's or competition's colors. */
export function colorVars(colors: Colors): CSSProperties {
  return {
    "--c-primary": colors.primary,
    "--c-secondary": colors.secondary,
    "--c-text": textColorOn(colors.primary),
  } as CSSProperties;
}

/** Our own simple trophy icon (not an official competition logo). */
function TrophyIcon() {
  return (
    <svg className="trophy" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1 1.7V7Zm10 0v2.7A2 2 0 0 0 18 8V7h-1ZM6 20h12v2H6v-2Z"
      />
    </svg>
  );
}

/** The competition name in the competition's colors, like a broadcast banner. */
export function CompetitionBar({ match }: { match: Match }) {
  return (
    <p className="competition-bar" style={colorVars(getCompetitionColors(match.competitionId))}>
      <TrophyIcon />
      {match.competition}
    </p>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="back pixel" onClick={onClick}>
      ◂ Back
    </button>
  );
}
