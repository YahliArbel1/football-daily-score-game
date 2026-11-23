import type { GoalGuess, Match, Score, Side } from "../engine/types";
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
  // Each team gets its own half: home on the left, away on the right
  // (one under the other on narrow screens).
  const halves: { side: Side; team: Match["homeTeam"] }[] = [
    { side: "home", team: match.homeTeam },
    { side: "away", team: match.awayTeam },
  ];

  return (
    <main className="screen goal-details">
      <BackButton onClick={onBack} />
      <CompetitionBar match={match} />

      <h2 className="screen-title">Who scored?</h2>
      <p className="your-guess pixel">
        Your guess: {match.homeTeam.name} {score.home}–{score.away} {match.awayTeam.name}
      </p>

      <div className="halves">
        {halves.map(({ side, team }) => {
          // Keep each goal's position in the full list, so changes go to the right goal.
          const teamGoals = goals
            .map((goal, index) => ({ goal, index }))
            .filter(({ goal }) => goal.team === side);

          return (
            <section key={side} className="half" style={colorVars(team.colors)}>
              <header className="half-header">
                <span className="half-team">{team.name}</span>
                <span className="half-count pixel">
                  {teamGoals.length} {teamGoals.length === 1 ? "goal" : "goals"}
                </span>
              </header>

              {teamGoals.length === 0 ? (
                <p className="half-empty">No goals</p>
              ) : (
                <ol className="goal-list">
                  {teamGoals.map(({ goal, index }) => (
                    <li key={index} className="goal-card">
                      <div className="goal-card-header pixel">Goal {numberWithinTeam(goals, index)}</div>
                      <div className="goal-card-body">
                        <PlayerPicker
                          label="Scorer"
                          placeholder="Choose scorer"
                          players={team.players}
                          value={goal.scorer}
                          onChange={(scorer) => onChange(setScorer(goals, index, scorer))}
                          allowOwnGoal
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      <p className="hint">Not sure? You can leave a scorer empty. It just won't earn points.</p>

      <button type="button" className="arcade-btn primary next-btn" disabled>
        <span className="mode-title">Submit guess ▸</span>
        <span className="mode-text">Results — coming soon</span>
      </button>
    </main>
  );
}
