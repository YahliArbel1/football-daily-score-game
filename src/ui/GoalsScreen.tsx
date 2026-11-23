import type { GoalGuess, Match, Score } from "../engine/types";
import { numberWithinTeam, setScorer } from "./goalGuesses";
import { PlayerPicker } from "./PlayerPicker";
import { BackButton, colorVars, CompetitionBar } from "./shared";

interface GoalsScreenProps {
  match: Match;
  score: Score;
  goals: GoalGuess[];
  onChange: (goals: GoalGuess[]) => void;
  onBack: () => void;
}

export function GoalsScreen({ match, score, goals, onChange, onBack }: GoalsScreenProps) {
  const teamOf = (goal: GoalGuess) => (goal.team === "home" ? match.homeTeam : match.awayTeam);

  return (
    <main className="screen goal-details">
      <BackButton onClick={onBack} />
      <CompetitionBar match={match} />

      <h2 className="screen-title">Who scored?</h2>
      <p className="your-guess pixel">
        Your guess: {match.homeTeam.name} {score.home}–{score.away} {match.awayTeam.name}
      </p>

      {goals.length === 0 ? (
        <p className="no-goals">A goalless draw — no goals to fill in.</p>
      ) : (
        <ol className="goal-list">
          {goals.map((goal, i) => {
            const team = teamOf(goal);
            return (
              <li key={i} className="goal-card" style={colorVars(team.colors)}>
                <div className="goal-card-header pixel">
                  {team.name} · Goal {numberWithinTeam(goals, i)}
                </div>
                <div className="goal-card-body">
                  <PlayerPicker
                    label="Scorer"
                    placeholder="Choose scorer"
                    players={team.players}
                    value={goal.scorer}
                    onChange={(scorer) => onChange(setScorer(goals, i, scorer))}
                    allowOwnGoal
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <p className="hint">Not sure? You can leave a scorer empty. It just won't earn points.</p>

      <button type="button" className="arcade-btn primary next-btn" disabled>
        <span className="mode-title">Submit guess ▸</span>
        <span className="mode-text">Results — coming soon</span>
      </button>
    </main>
  );
}
