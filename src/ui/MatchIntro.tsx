import type { Match } from "../engine/types";

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

export function MatchIntro({ match, onBack }: MatchIntroProps) {
  return (
    <main className="screen intro">
      <button type="button" className="back pixel" onClick={onBack}>
        ◂ Back
      </button>

      <p className="competition-bar">
        <span className="live-dot" aria-hidden="true" />
        {match.competition}
      </p>

      <div className="matchup">
        <div className="team-box">
          <span className="side pixel">Home</span>
          <span className="team-name">{match.homeTeam.name}</span>
        </div>
        <span className="vs">VS</span>
        <div className="team-box">
          <span className="side pixel">Away</span>
          <span className="team-name">{match.awayTeam.name}</span>
        </div>
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
