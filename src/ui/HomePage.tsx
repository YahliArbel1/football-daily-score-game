import { LegalNote } from "./shared";

interface HomePageProps {
  /** Today's Daily Game label, e.g. "#1 · NOV 27". */
  label: string;
  /** true once today's guess is submitted: the button then opens the results. */
  played: boolean;
  onPlayDaily: () => void;
}

export function HomePage({ label, played, onPlayDaily }: HomePageProps) {
  return (
    <main className="screen home">
      <header className="hero">
        <p className="kicker pixel">▸ Matchday</p>
        <h1 className="logo">
          Scor<span>dle</span>
        </h1>
        <p className="tagline">
          Real matches from football history. Guess the score, the scorers, the assists and the
          minutes.
        </p>
      </header>

      <div className="modes">
        <button type="button" className="arcade-btn primary" onClick={onPlayDaily}>
          <span className="tag live pixel">● Today {label}</span>
          <span className="mode-title">Daily Game</span>
          <span className="mode-text">One match a day. Same for everyone.</span>
          <span className="cta pixel">{played ? "See your results ▸" : "Kick off ▸"}</span>
        </button>

        <button type="button" className="arcade-btn secondary" disabled>
          <span className="tag pixel">Coming soon</span>
          <span className="mode-title">Quick Play</span>
          <span className="mode-text">Random matches, as many as you like.</span>
        </button>
      </div>

      <LegalNote />
    </main>
  );
}
