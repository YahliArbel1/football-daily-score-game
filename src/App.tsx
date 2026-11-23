import { useEffect, useMemo, useState } from "react";
import { istanbul2005 } from "./engine/fixtures/istanbul-2005";
import type { GoalGuess, Score } from "./engine/types";
import { resizeGoalGuesses } from "./ui/goalGuesses";
import { GoalsScreen } from "./ui/GoalsScreen";
import { HomePage } from "./ui/HomePage";
import { MatchIntro } from "./ui/MatchIntro";
import { buildResults, type ResultsView } from "./ui/results";
import { ResultsScreen } from "./ui/ResultsScreen";
import { ScoreGuessScreen } from "./ui/ScoreGuessScreen";
import { homeBoards, matchBoards, type BoardPanel } from "./ui/stadium/adBoards";
import type { CrowdPalette } from "./ui/stadium/crowd";
import { PitchBackground } from "./ui/stadium/PitchBackground";
import { StadiumBackground } from "./ui/stadium/StadiumBackground";

type Screen = "home" | "intro" | "guess-score" | "guess-goals" | "results";

// Until daily selection exists, the Daily Game is always Istanbul 2005.
const match = istanbul2005;

/** A colorful mixed crowd for the home page. */
const HOME_CROWD: CrowdPalette = {
  kind: "mixed",
  colors: ["#e63946", "#ffd60a", "#1d4ed8", "#ffffff", "#16a34a", "#f97316", "#7c3aed", "#0ea5e9", "#111111"],
};

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [score, setScore] = useState<Score>({ home: 0, away: 0 });
  const [goals, setGoals] = useState<GoalGuess[]>([]);
  // Set once the guess is submitted; after that the guess can't change (SPEC 3, step 6).
  // For now this lasts until the page is reloaded; saving it comes with daily selection.
  const [results, setResults] = useState<ResultsView | null>(null);

  // Every new screen starts at the top. (Braces matter: an effect may only
  // return a cleanup function, so it must not return scrollTo's result.)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // One goal card per guessed goal; changing the score keeps scorers already chosen.
  const changeScore = (next: Score) => {
    setScore(next);
    setGoals((current) => resizeGoalGuesses(current, next));
  };

  const submit = () => {
    setResults(buildResults(match, { matchId: match.id, score, goals }));
    setScreen("results");
  };

  // Home page: mixed crowd. Match screens: each half of the stand in one team's colors.
  // useMemo keeps the same object between renders, so the crowd isn't rebuilt on every click.
  const isHome = screen === "home";
  const crowd = useMemo<CrowdPalette>(
    () =>
      isHome
        ? HOME_CROWD
        : { kind: "split", home: match.homeTeam.colors, away: match.awayTeam.colors },
    [isHome],
  );
  const boards = useMemo<BoardPanel[]>(() => (isHome ? homeBoards() : matchBoards(match)), [isHome]);

  let content;
  if (screen === "results" && results) {
    content = <ResultsScreen match={match} view={results} onHome={() => setScreen("home")} />;
  } else if (screen === "intro") {
    content = (
      <MatchIntro
        match={match}
        onBack={() => setScreen("home")}
        onStart={() => setScreen("guess-score")}
      />
    );
  } else if (screen === "guess-score") {
    content = (
      <ScoreGuessScreen
        match={match}
        score={score}
        onChange={changeScore}
        onBack={() => setScreen("intro")}
        onNext={() => setScreen("guess-goals")}
      />
    );
  } else if (screen === "guess-goals") {
    content = (
      <GoalsScreen
        match={match}
        score={score}
        goals={goals}
        onChange={setGoals}
        onBack={() => setScreen("guess-score")}
        onSubmit={submit}
      />
    );
  } else {
    // Once submitted, the Daily Game opens the results instead of a new guess.
    content = <HomePage onPlayDaily={() => setScreen(results ? "results" : "intro")} />;
  }

  return (
    <>
      <PitchBackground />
      <StadiumBackground palette={crowd} boards={boards} />
      {content}
    </>
  );
}
