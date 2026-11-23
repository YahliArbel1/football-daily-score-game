import type { CSSProperties } from "react";
import type { Colors, Match, Team } from "../engine/types";
import { getCompetitionColors, textColorOn } from "./colors";

interface MatchIntroProps {
  match: Match;
  onBack: () => void;
}

// Match dates are "YYYY-MM-DD". Format them in UTC so the day never shifts
// because of the viewer's time zone.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** CSS variables that styles.css uses to paint a box in a team's or competition's colors. */
function colorVars(colors: Colors): CSSProperties {
  return {
    "--c-primary": colors.primary,
    "--c-secondary": colors.secondary,
    "--c-text": textColorOn(colors.primary),
  } as CSSProperties;
}

function TeamBox({ team, side }: { team: Team; side: string }) {
  return (
    <div className="team-box" style={colorVars(team.colors)}>
      <span className="side pixel">{side}</span>
      <span className="team-name">{team.name}</span>
    </div>
  );
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

export function MatchIntro({ match, onBack }: MatchIntroProps) {
  return (
    <main className="screen intro">
      <button type="button" className="back pixel" onClick={onBack}>
        ◂ Back
      </button>

      <p className="competition-bar" style={colorVars(getCompetitionColors(match.competitionId))}>
        <TrophyIcon />
        {match.competition}
      </p>

      <div className="matchup">
        <TeamBox team={match.homeTeam} side="Home" />
        <span className="vs">VS</span>
        <TeamBox team={match.awayTeam} side="Away" />
      </div>

      <dl className="lower-third">
        <div>
          <dt className="pixel">Date</dt>
          <dd>{dateFormat.format(new Date(match.date))}</dd>
        </div>
        <div>
          <dt className="pixel">Stadium</dt>
          <dd>{match.venue}</dd>
        </div>
      </dl>
    </main>
  );
}
