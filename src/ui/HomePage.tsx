interface HomePageProps {
  onPlayDaily: () => void;
}

export function HomePage({ onPlayDaily }: HomePageProps) {
  return (
    <main className="screen home">
      <header className="home-header">
        <h1>Football Daily Score Game</h1>
        <p className="tagline">
          A real match from football history. Guess the final score, the scorers, the assists and
          the minutes.
        </p>
      </header>

      <div className="modes">
        <button type="button" className="mode-card" onClick={onPlayDaily}>
          <span className="mode-title">Daily Game</span>
          <span className="mode-text">One match a day, the same for everyone.</span>
        </button>

        <button type="button" className="mode-card" disabled>
          <span className="mode-title">
            Quick Play <span className="badge">Coming soon</span>
          </span>
          <span className="mode-text">Random matches, as many as you like.</span>
        </button>
      </div>
    </main>
  );
}
