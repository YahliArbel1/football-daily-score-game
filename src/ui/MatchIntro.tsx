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
      <button type="button" className="back" onClick={onBack}>
        ← Back
      </button>

      <p className="competition">{match.competition}</p>

      <div className="teams">
        <span className="team">{match.homeTeam.name}</span>
        <span className="vs">vs</span>
        <span className="team">{match.awayTeam.name}</span>
      </div>

      <dl className="details">
        <div>
          <dt>Date</dt>
          <dd>{dateFormat.format(new Date(match.date))}</dd>
        </div>
        <div>
          <dt>Stadium</dt>
          <dd>{match.venue}</dd>
        </div>
      </dl>
    </main>
  );
}
