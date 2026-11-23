import { useId } from "react";
import { OWN_GOAL, type GoalGuess, type Match, type Score, type Side } from "../engine/types";
import {
  assistOptions,
  minuteStatus,
  numberWithinTeam,
  setAssist,
  setMinute,
  setScorer,
} from "./goalGuesses";
import { PlayerPicker } from "./PlayerPicker";
import { BackButton, colorVars, CompetitionBar } from "./shared";

/**
 * The minute of a goal, typed like "43" or "45+2". A green border when valid,
 * red with a short explanation when not. Never blocks submitting (SPEC 5.4).
 */
function MinuteField({ value, onChange }: { value: string | null; onChange: (text: string) => void }) {
  const id = useId();
  const status = minuteStatus(value);
  return (
    <div className="minute-field">
      <label className="picker-label pixel" htmlFor={id}>
        Minute
      </label>
      <input
        id={id}
        className={`minute-input ${status}`}
        type="text"
        placeholder="e.g. 43 or 45+2"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={status === "invalid"}
        aria-describedby={status === "invalid" ? `${id}-error` : undefined}
        maxLength={6}
        autoComplete="off"
      />
      {status === "invalid" && (
        <span id={`${id}-error`} className="minute-error">
          Use 1–90, or 45+X / 90+X
        </span>
      )}
    </div>
  );
}

interface GoalsScreenProps {
  match: Match;
  score: Score;
  goals: GoalGuess[];
  onChange: (goals: GoalGuess[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function GoalsScreen({ match, score, goals, onChange, onBack, onSubmit }: GoalsScreenProps) {
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
                        <div className="goal-extras">
                          <PlayerPicker
                            label="Assist"
                            placeholder="No assist"
                            players={assistOptions(team.players, goal.scorer)}
                            value={goal.assist}
                            onChange={(assist) => onChange(setAssist(goals, index, assist))}
                            disabledText={goal.scorer === OWN_GOAL ? "No assist on an own goal" : undefined}
                          />
                          <MinuteField
                            value={goal.minute}
                            onChange={(text) => onChange(setMinute(goals, index, text))}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      <p className="hint">Not sure? Leave any field empty. It just won't earn points.</p>

      <button type="button" className="arcade-btn primary next-btn" onClick={onSubmit}>
        <span className="mode-title">Submit guess ▸</span>
        <span className="mode-text">Locks your guess. No changes after this.</span>
      </button>
    </main>
  );
}
