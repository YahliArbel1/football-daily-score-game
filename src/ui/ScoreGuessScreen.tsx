import { MAX_GOALS_PER_TEAM, type Match, type Score, type Side } from "../engine/types";
import { changeGoals, describeScore } from "./scoreGuess";
import { BackButton, colorVars, CompetitionBar } from "./shared";

/** A bold plus or minus drawn as SVG, so it looks the same in every font. */
function StepIcon({ plus }: { plus: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 12h16" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      {plus && <path d="M12 4v16" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />}
    </svg>
  );
}

interface ScoreGuessScreenProps {
  match: Match;
  score: Score;
  onChange: (score: Score) => void;
  onBack: () => void;
}

export function ScoreGuessScreen({ match, score, onChange, onBack }: ScoreGuessScreenProps) {
  const change = (side: Side, delta: number) =>
    onChange({ ...score, [side]: changeGoals(score[side], delta) });

  const rows = [
    { side: "home" as const, team: match.homeTeam },
    { side: "away" as const, team: match.awayTeam },
  ];

  return (
    <main className="screen guess-score">
      <BackButton onClick={onBack} />
      <CompetitionBar match={match} />

      <h2 className="screen-title">What was the final score?</h2>

      <div className="scoreboard">
        {rows.map(({ side, team }) => (
          <div key={side} className="score-row">
            <div className="team-box compact" style={colorVars(team.colors)}>
              <span className="side pixel">{side === "home" ? "Home" : "Away"}</span>
              <span className="team-name">{team.name}</span>
            </div>

            <div className="stepper">
              <button
                type="button"
                className="step-btn"
                onClick={() => change(side, -1)}
                disabled={score[side] <= 0}
                aria-label={`One goal less for ${team.name}`}
              >
                <StepIcon plus={false} />
              </button>
              <output className="goals" aria-live="polite" aria-label={`${team.name} goals`}>
                {score[side]}
              </output>
              <button
                type="button"
                className="step-btn"
                onClick={() => change(side, 1)}
                disabled={score[side] >= MAX_GOALS_PER_TEAM}
                aria-label={`One goal more for ${team.name}`}
              >
                <StepIcon plus />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="verdict pixel" aria-live="polite">
        ▸ {describeScore(score, match.homeTeam.name, match.awayTeam.name)}
      </p>

      <button type="button" className="arcade-btn primary next-btn" disabled>
        <span className="mode-title">Next ▸</span>
        <span className="mode-text">Scorers — coming soon</span>
      </button>
    </main>
  );
}
