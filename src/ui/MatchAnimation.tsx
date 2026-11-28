// The short replay of the match after Submit (SPEC 4): a running clock, the
// score updating on every goal, and a card for each goal as it happens.
// All timing comes from timeline.ts; this file only draws it.

import { useEffect, useMemo, useRef, useState } from "react";
import type { Match } from "../engine/types";
import { cardsByEvent, minuteLabel, playerName, type FieldResult, type ResultsView } from "./results";
import { browserStorage } from "./savedGuess";
import { colorVars, CompetitionBar, PixelIcon } from "./shared";
import { GoalScene } from "./GoalScene";
import { ballLandsAt, SCENE_MS, shotTarget } from "./sceneFrames";
import { cuesBetween, goalCues, loadMuted, pointsCues, saveMuted } from "./sound";
import { playCue, stopAll } from "./synth";
import { advance, buildTimeline, SPEEDS, timelineAt, type Speed, type TimelineFrame } from "./timeline";

interface MatchAnimationProps {
  match: Match;
  /** Your guess against the real match: which goals and fields you hit. */
  view: ResultsView;
  /** Called when the animation ends or is skipped. */
  onDone: () => void;
}

/** A green "✓ +3" next to a field you got right; nothing otherwise. */
function Hit({ field }: { field: FieldResult }) {
  if (field.status !== "hit") return null;
  return (
    <span className="hit-mark">
      <span aria-label="Correct">✓</span> +{field.points}
    </span>
  );
}

/** How long "Full time" stays on screen before the results open. */
const FULL_TIME_HOLD_MS = 1200;
/** Longest step between two frames, so a tab left in the background doesn't jump ahead. */
const MAX_FRAME_MS = 100;

export function MatchAnimation({ match, view, onDone }: MatchAnimationProps) {
  const timeline = useMemo(() => buildTimeline(match), [match]);
  const cards = useMemo(() => cardsByEvent(match, view), [match, view]);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  // Sounds are on unless the player muted them before (remembered in the browser).
  const [muted, setMuted] = useState(() => loadMuted(browserStorage()));

  // The frame loop reads these through refs, so it never has to restart.
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // requestAnimationFrame calls `tick` before every screen refresh (about 60
  // times a second) with the current time; we move the animation forward by
  // the time since the last call.
  useEffect(() => {
    let raf = 0;
    let last: number | null = null;
    let current = 0;
    const tick = (now: number) => {
      if (last !== null) {
        current = advance(current, Math.min(now - last, MAX_FRAME_MS), speedRef.current);
        setElapsed(current);
      }
      last = now;
      if (current < timeline.durationMs) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [timeline]);

  const frame = timelineAt(timeline, elapsed);

  // Whistles: kick-off on the first frame, the final whistle at full time.
  // Only runs when the match ends, not on every tick.
  const lastSoundFrame = useRef<TimelineFrame | null>(null);
  useEffect(() => {
    const cues = cuesBetween(lastSoundFrame.current, frame);
    lastSoundFrame.current = frame;
    if (!mutedRef.current) cues.forEach(playCue);
    // Deliberately only this one: it is the only change that makes a whistle.
  }, [frame.finished]);

  // A goal's two sounds, once each per goal: the goal itself when the ball
  // hits the net in the scene, and your points when the goal card shows them.
  const goalT = frame.current ? elapsed - frame.current.atMs : null;
  const landed =
    frame.current && goalT! >= ballLandsAt(match.events[frame.current.eventIndex]!.ownGoal)
      ? frame.current.eventIndex
      : null;
  const cardShown = frame.current && goalT! >= SCENE_MS ? frame.current.eventIndex : null;
  const soundedNets = useRef(new Set<number>());
  const soundedPoints = useRef(new Set<number>());
  useEffect(() => {
    if (landed === null || soundedNets.current.has(landed)) return;
    soundedNets.current.add(landed);
    if (!mutedRef.current) goalCues().forEach(playCue);
  }, [landed]);
  useEffect(() => {
    if (cardShown === null || soundedPoints.current.has(cardShown)) return;
    soundedPoints.current.add(cardShown);
    if (!mutedRef.current) pointsCues(cards[cardShown]!).forEach(playCue);
  }, [cardShown, cards]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    saveMuted(browserStorage(), next);
    if (next) stopAll();
  };

  const skip = () => {
    stopAll();
    onDone();
  };

  // At full time, hold the final score for a moment, then open the results.
  useEffect(() => {
    if (!frame.finished) return;
    const id = window.setTimeout(() => onDoneRef.current(), FULL_TIME_HOLD_MS / speedRef.current);
    return () => window.clearTimeout(id);
  }, [frame.finished]);

  const shownGoals = timeline.goals.slice(0, frame.shown);
  const current = frame.current ? match.events[frame.current.eventIndex] : null;
  const currentTeam = current && (current.team === "home" ? match.homeTeam : match.awayTeam);
  const currentCard = frame.current ? cards[frame.current.eventIndex]! : null;
  // Each goal opens with its scene (sceneFrames.ts), then the goal card.
  const sceneT = frame.current ? elapsed - frame.current.atMs : SCENE_MS;
  const showScene = current !== null && sceneT < SCENE_MS;
  // The scorer plays for the other team on an own goal.
  const scorerTeam =
    current && (current.team === "home") !== current.ownGoal ? match.homeTeam : match.awayTeam;
  const scorerNumber = current ? scorerTeam.players.find((p) => p.id === current.scorer)?.number ?? 0 : 0;
  // Your points so far: each goal's points as it happens, and the result's at full time.
  const points =
    shownGoals.reduce((sum, g) => sum + cards[g.eventIndex]!.points, 0) +
    (frame.finished ? view.result.points : 0);

  return (
    <main className="screen animation">
      <CompetitionBar match={match} />

      <div className="anim-status">
        {frame.finished ? (
          <span className="full-time pixel">Full time</span>
        ) : (
          // A still dot, the same as "● Today" on the home page (no blinking: it tires the eyes).
          <span className="live-tag pixel">
            <PixelIcon name="dot" /> Live
          </span>
        )}
        {/* key: a new total re-mounts the number, which replays its pop. */}
        <span className="anim-points pixel" key={points}>
          {points} pts
        </span>
        <span className="anim-clock pixel" aria-live="off">
          {frame.clock}
        </span>
        <button
          type="button"
          className="mute-btn"
          aria-pressed={muted}
          aria-label={muted ? "Turn sounds on" : "Turn sounds off"}
          onClick={toggleMute}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="final-board anim-board">
        <span className="board-team" style={colorVars(match.homeTeam.colors)}>
          {match.homeTeam.name}
        </span>
        {/* key: a new score re-mounts the number, which replays its pop. */}
        <span className="board-score" key={`${frame.score.home}-${frame.score.away}`}>
          {frame.score.home}–{frame.score.away}
        </span>
        <span className="board-team" style={colorVars(match.awayTeam.colors)}>
          {match.awayTeam.name}
        </span>
      </div>

      {/* 0' to full time, with a mark for each goal so far in its team's colors. */}
      <div className="anim-track" aria-hidden="true">
        <div className="anim-track-fill" style={{ width: `${frame.progress * 100}%` }} />
        <span className="anim-track-half" style={{ left: `${(45 + timeline.stoppage.first) / timeline.totalUnits * 100}%` }} />
        {shownGoals.map((g) => (
          <span
            key={g.eventIndex}
            className="anim-track-goal"
            style={{
              left: `${(g.unit / timeline.totalUnits) * 100}%`,
              ...colorVars(g.side === "home" ? match.homeTeam.colors : match.awayTeam.colors),
            }}
          />
        ))}
      </div>

      {/* The goal being shown right now. aria-live reads it out to screen readers. */}
      <div className="anim-goal-slot" aria-live="polite">
        {showScene && current && (
          <GoalScene
            scorerColors={scorerTeam.colors}
            number={scorerNumber}
            target={shotTarget(frame.current!.eventIndex)}
            crowd={[match.homeTeam.colors, match.awayTeam.colors]}
            t={sceneT}
            ownGoal={current.ownGoal}
          />
        )}
        {!showScene && current && currentTeam && currentCard && (
          <div
            className={`anim-goal${currentCard.badge ? ` ${currentCard.badge}` : ""}`}
            key={frame.current!.eventIndex}
            style={colorVars(currentTeam.colors)}
          >
            {/* Two fonts, three sizes: pixel for the title line and badge,
                Anton for the scorer (large) and the details (medium). */}
            {currentCard.points > 0 && <span className="anim-goal-points">+{currentCard.points}</span>}
            <span className="anim-goal-title pixel">
              {currentTeam.name} · Goal! · {minuteLabel(current)}
            </span>
            <span className="anim-goal-scorer">
              {playerName(match, current.scorer)}
              {current.ownGoal && <span className="og-tag">OG</span>}
              <Hit field={currentCard.scorer} />
            </span>
            {current.assist && (
              <span className="anim-goal-detail">
                Assist: {playerName(match, current.assist)}
                <Hit field={currentCard.assist} />
              </span>
            )}
            {/* The minute is already in the title; this line only shows that you got it. */}
            {currentCard.minuteField.status === "hit" && (
              <span className="anim-goal-detail">
                Minute
                <Hit field={currentCard.minuteField} />
              </span>
            )}
            {currentCard.badge === "full-house" && (
              <span className="badge-full-house pixel">
                <PixelIcon name="star" /> Full house!
              </span>
            )}
            {currentCard.badge === "pair" && (
              <span className="badge-pair pixel">
                <PixelIcon name="diamond" /> Pair
              </span>
            )}
            {currentCard.outcome === "wrong" && (
              <span className="anim-goal-note wrong">
                <PixelIcon name="cross" /> Your guess: {currentCard.scorer.guess ?? "no scorer"}
                {currentCard.minuteField.guess && ` ${currentCard.minuteField.guess}`}
              </span>
            )}
            {currentCard.outcome === "missed" && (
              <span className="anim-goal-note missed">
                <PixelIcon name="cross" /> You missed this goal
              </span>
            )}
          </div>
        )}
      </div>

      {/* Above the goal list, so a long list never pushes them off the screen. */}
      <div className="anim-controls">
        {/* Segmented control: every speed visible, one tap to choose, the current one lit. */}
        <div className="speed-group" role="group" aria-label="Playback speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className="speed-btn"
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
            >
              {/* A plain "x": the pixel font draws "×" too small. */}
              {s}x
            </button>
          ))}
        </div>
        <button type="button" className="arcade-btn primary anim-btn pixel" onClick={skip}>
          Skip &gt;&gt;
        </button>
      </div>

      {/* Every goal so far, newest last. */}
      <ol className="anim-feed">
        {shownGoals.map((g) => {
          const e = match.events[g.eventIndex]!;
          const card = cards[g.eventIndex]!;
          return (
            <li key={g.eventIndex} className={`anim-feed-item ${g.side}`}>
              <span className="pixel">{minuteLabel(e)}</span> {playerName(match, e.scorer)}
              {e.ownGoal && <span className="og-tag">OG</span>}
              {card.points > 0 && <span className="feed-points">+{card.points}</span>}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
