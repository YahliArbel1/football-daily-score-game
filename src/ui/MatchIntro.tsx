import type { Match, Team } from "../engine/types";
import { BackButton, colorVars, CompetitionBar } from "./shared";

interface MatchIntroProps {
  match: Match;
  onBack: () => void;
  onStart: () => void;
}

// Match dates are "YYYY-MM-DD". Format them in UTC so the day never shifts
// because of the viewer's time zone.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function TeamBox({ team, side }: { team: Team; side: string }) {
  return (
    <div className="team-box" style={colorVars(team.colors)}>
      <span className="side pixel">{side}</span>
      <span className="team-name">{team.name}</span>
    </div>
  );
}

export function MatchIntro({ match, onBack, onStart }: MatchIntroProps) {
  return (
    <main className="screen intro">
      <BackButton onClick={onBack} />
      <CompetitionBar match={match} />

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

      <button type="button" className="arcade-btn primary start-btn" onClick={onStart}>
        <span className="mode-title">Start guessing ▸</span>
      </button>
    </main>
  );
}
