import { useState } from "react";
import { istanbul2005 } from "./engine/fixtures/istanbul-2005";
import { HomePage } from "./ui/HomePage";
import { MatchIntro } from "./ui/MatchIntro";

type Screen = "home" | "match";

export function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "match") {
    // Until daily selection exists, the Daily Game is always Istanbul 2005.
    return <MatchIntro match={istanbul2005} onBack={() => setScreen("home")} />;
  }

  return <HomePage onPlayDaily={() => setScreen("match")} />;
}
