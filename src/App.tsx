import { useState } from "react";
import { istanbul2005 } from "./engine/fixtures/istanbul-2005";
import type { Score } from "./engine/types";
import { HomePage } from "./ui/HomePage";
import { MatchIntro } from "./ui/MatchIntro";
import { ScoreGuessScreen } from "./ui/ScoreGuessScreen";

type Screen = "home" | "intro" | "guess-score";

// Until daily selection exists, the Daily Game is always Istanbul 2005.
const match = istanbul2005;

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [score, setScore] = useState<Score>({ home: 0, away: 0 });

  if (screen === "intro") {
    return (
      <MatchIntro
        match={match}
        onBack={() => setScreen("home")}
        onStart={() => setScreen("guess-score")}
      />
    );
  }

  if (screen === "guess-score") {
    return (
      <ScoreGuessScreen
        match={match}
        score={score}
        onChange={setScore}
        onBack={() => setScreen("intro")}
      />
    );
  }

  return <HomePage onPlayDaily={() => setScreen("intro")} />;
}
