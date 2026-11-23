import { useMemo, useState } from "react";
import { istanbul2005 } from "./engine/fixtures/istanbul-2005";
import type { GoalGuess, Score } from "./engine/types";
import { resizeGoalGuesses } from "./ui/goalGuesses";
import { GoalsScreen } from "./ui/GoalsScreen";
import { HomePage } from "./ui/HomePage";
import { MatchIntro } from "./ui/MatchIntro";
import { ScoreGuessScreen } from "./ui/ScoreGuessScreen";
import { homeBoards, matchBoards, type BoardPanel } from "./ui/stadium/adBoards";
import type { CrowdPalette } from "./ui/stadium/crowd";
import { PitchBackground } from "./ui/stadium/PitchBackground";
import { StadiumBackground } from "./ui/stadium/StadiumBackground";

type Screen = "home" | "intro" | "guess-score" | "guess-goals";

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

  // One goal card per guessed goal; changing the score keeps scorers already chosen.
  const changeScore = (next: Score) => {
    setScore(next);
    setGoals((current) => resizeGoalGuesses(current, next));
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
  if (screen === "intro") {
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
      />
    );
  } else {
    content = <HomePage onPlayDaily={() => setScreen("intro")} />;
  }

  return (
    <>
      <PitchBackground />
      <StadiumBackground palette={crowd} boards={boards} />
      {content}
    </>
  );
}
