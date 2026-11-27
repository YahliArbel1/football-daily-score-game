import type { Match } from "../engine/types";
import { NextDaily } from "./NextDaily";
import type { FieldResult, GoalCard, ResultsView, TeamResults } from "./results";
import { colorVars, CompetitionBar } from "./shared";

interface ResultsScreenProps {
  match: Match;
  view: ResultsView;
  /** Today's day number, for the countdown to the next match. */
  day: number;
  /** Today's Daily Game label, e.g. "#1 · NOV 27". */
  label: string;
  onHome: () => void;
  /** Plays the match animation again from the start. */
  onReplay: () => void;
}

/** ✓ +3 for a hit, ✗ for a miss, – when there was nothing to guess. */
function Mark({ field }: { field: FieldResult }) {
  if (field.status === "hit") {
    return (
      <span className="mark hit">
        <span aria-label="Correct">✓</span> +{field.points}
      </span>
    );
  }
  if (field.status === "miss") return <span className="mark miss" aria-label="Wrong">✗</span>;
  return <span className="mark none">–</span>;
}

/** One real goal: real against your guess, field by field. */
function GoalResultCard({ card }: { card: GoalCard }) {
  const rows = [
    { label: "Scorer", field: card.scorer },
    { label: "Assist", field: card.assist },
    { label: "Minute", field: card.minuteField },
  ];

  return (
    <li className={`result-card${card.guessed ? "" : " not-guessed"}${card.badge ? ` ${card.badge}` : ""}`}>
      <div className="result-card-header">
        <span className="pixel">
          {card.minute}
          {card.ownGoal && <span className="og-tag">OG</span>}
        </span>
        {card.badge === "full-house" && <span className="badge-full-house pixel">★ Full house!</span>}
        {card.badge === "pair" && <span className="badge-pair pixel">◆ Pair</span>}
        <span className="result-card-points">{card.guessed ? `+${card.points}` : "Not guessed"}</span>
      </div>

      {card.guessed ? (
        <table className="compare">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col" className="pixel">Real</th>
              <th scope="col" className="pixel">You</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, field }) => (
              <tr key={label} className={field.status}>
                <th scope="row" className="pixel">{label}</th>
                <td>{field.real ?? "–"}</td>
                <td>{field.guess ?? "–"}</td>
                <td>
                  <Mark field={field} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="not-guessed-text">
          <strong>{card.scorer.real}</strong>
          {card.assist.real && <> · assist {card.assist.real}</>}
          <br />
          You didn't guess this goal.
        </p>
      )}
    </li>
  );
}

function TeamHalf({ team }: { team: TeamResults }) {
  return (
    <section className="half" style={colorVars(team.colors)}>
      <header className="half-header">
        <span className="half-team">{team.name}</span>
        <span className="half-count pixel">+{team.points}</span>
      </header>
      <p className="half-summary pixel">
        {team.realGoals} {team.realGoals === 1 ? "goal" : "goals"} · you guessed {team.guessedGoals}
      </p>

      {team.cards.length === 0 && team.missed.length === 0 ? (
        <p className="half-empty">No goals</p>
      ) : (
        <ol className="goal-list">
          {team.cards.map((card, i) => (
            <GoalResultCard key={i} card={card} />
          ))}
          {team.missed.map((m, i) => (
            <li key={`missed-${i}`} className="result-card missed">
              <div className="result-card-header">
                <span className="pixel">{m.minute ?? "–"}</span>
                <span className="result-card-points">0</span>
              </div>
              <p className="not-guessed-text">
                Your guess: <strong>{m.scorerName ?? "no scorer chosen"}</strong>
                <br />
                No such goal in the match.
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function ResultsScreen({ match, view, day, label, onHome, onReplay }: ResultsScreenProps) {
  const { summary } = view;

  return (
    <main className="screen results">
      <p className="daily-label pixel">Scordle {label}</p>
      <CompetitionBar match={match} />

      <p className="full-time pixel">Full time</p>
      <div className="final-board">
        <span className="board-team" style={colorVars(match.homeTeam.colors)}>
          {match.homeTeam.name}
        </span>
        <span className="board-score">
          {view.actual.home}–{view.actual.away}
        </span>
        <span className="board-team" style={colorVars(match.awayTeam.colors)}>
          {match.awayTeam.name}
        </span>
      </div>
      {/* The result verdict, right under the score so it can't be missed. */}
      <div className={`verdict ${view.result.kind}`}>
        <span className="verdict-guess pixel">
          Your guess {view.guessed.home}–{view.guessed.away}
        </span>
        <span className="verdict-label">{view.resultLabel}</span>
        <span className="verdict-points">+{view.result.points}</span>
      </div>

      <div className="total-points">
        <span className="total-number">{view.total}</span>
        <span className="total-label pixel">pts</span>
      </div>

      <button type="button" className="arcade-btn secondary replay-btn" onClick={onReplay}>
        <span className="mode-title">Watch again</span>
        <span className="mode-text">Replay the match from kick-off</span>
      </button>

      <NextDaily day={day} />

      <ul className="summary">
        <li>
          <span className="pixel">Result</span> +{summary.result}
        </li>
        <li>
          <span className="pixel">Scorers</span> +{summary.scorers}
        </li>
        <li>
          <span className="pixel">Assists</span> +{summary.assists}
        </li>
        <li>
          <span className="pixel">Minutes</span> +{summary.minutes}
        </li>
      </ul>

      <div className="halves">
        {view.teams.map((team) => (
          <TeamHalf key={team.side} team={team} />
        ))}
      </div>

      <button type="button" className="arcade-btn primary next-btn" onClick={onHome}>
        <span className="mode-title">Back to home</span>
      </button>
    </main>
  );
}
