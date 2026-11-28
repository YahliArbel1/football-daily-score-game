// Draws one moment of the goal scene (sceneFrames.ts has the logic) on a
// small pixel canvas, scaled up with sharp edges like the crowd.

import { useEffect, useRef } from "react";
import type { Colors } from "../engine/types";
import {
  BALL_SPRITES,
  GOAL,
  KEEPER_DIVE_LEFT,
  KEEPER_DIVE_RIGHT,
  KEEPER_STAND,
  kitFor,
  NUMBER_TOP,
  numberSprite,
  ownGoalSceneAt,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  SCORER_FRAMES,
  SCORER_WIDTH,
  sceneAt,
  shade,
  type ShotTarget,
  type Sprite,
} from "./sceneFrames";

interface GoalSceneProps {
  /** Colors of the team the scorer plays for. */
  scorerColors: Colors;
  number: number;
  target: ShotTarget;
  /** Both teams' colors, for the crowd behind the goal. */
  crowd: [Colors, Colors];
  /** Milliseconds into the scene. */
  t: number;
  /** An own goal plays its own scene: a cross deflected in off the defender. */
  ownGoal: boolean;
}

/** On-screen size of one scene pixel. */
const SCALE = 3;

const SKIN = "#c68642";
const HAIR = "#3b2414";
const BOOTS = "#111111";
const KEEPER = { kit: "#c6ff00", shorts: "#222222", gloves: "#ffffff" };
const LINES = "#e8f5e9";
/** Where the stand ends and the pitch begins. */
const PITCH_TOP = 12;

function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, palette: Record<string, string>) {
  sprite.forEach((row, dy) => {
    [...row].forEach((cell, dx) => {
      const color = palette[cell];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x + dx, y + dy, 1, 1);
    });
  });
}

/** A small repeatable random generator, so the crowd is the same every frame. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function GoalScene({ scorerColors, number, target, crowd, t, ownGoal }: GoalSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const frame = ownGoal ? ownGoalSceneAt(t) : sceneAt(t, target);

    // Night sky and the crowd behind the goal, in both teams' colors:
    // fans as 2x2 heads-and-shirts, so they read as people, not noise.
    ctx.fillStyle = "#0b1410";
    ctx.fillRect(0, 0, SCENE_WIDTH, PITCH_TOP);
    const random = seeded(7);
    const fans = [crowd[0].primary, crowd[0].secondary, crowd[1].primary, crowd[1].secondary];
    for (let y = 1; y < PITCH_TOP - 3; y += 3) {
      for (let x = (y % 2) * 1; x < SCENE_WIDTH; x += 3) {
        if (random() < 0.15) continue;
        ctx.fillStyle = "#d9a066";
        ctx.fillRect(x, y, 2, 1);
        ctx.fillStyle = fans[Math.floor(random() * fans.length)]!;
        ctx.fillRect(x, y + 1, 2, 1);
      }
    }
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, PITCH_TOP - 2, SCENE_WIDTH, 2);

    // Pitch with mowing stripes.
    for (let y = PITCH_TOP; y < SCENE_HEIGHT; y++) {
      ctx.fillStyle = Math.floor((y - PITCH_TOP) / 7) % 2 === 0 ? "#2f8a3a" : "#2a7d34";
      ctx.fillRect(0, y, SCENE_WIDTH, 1);
    }

    // Goal line, six-yard box (in perspective) and penalty spot.
    const boxBottom = GOAL.line + 9;
    ctx.fillStyle = LINES;
    ctx.fillRect(6, GOAL.line, SCENE_WIDTH - 12, 1);
    for (let y = GOAL.line; y <= boxBottom; y++) {
      const spread = Math.round(((y - GOAL.line) / 9) * 6);
      ctx.fillRect(26 - spread, y, 1, 1);
      ctx.fillRect(90 + spread, y, 1, 1);
    }
    ctx.fillRect(20, boxBottom, 77, 1);
    ctx.fillRect(57, 58, 2, 1);

    // Net: a fine mesh behind the goal mouth, shifted by a pixel while it ripples.
    ctx.fillStyle = "rgba(220, 232, 238, 0.45)";
    for (let y = GOAL.top + 1; y < GOAL.line; y++) {
      for (let x = GOAL.left + 1; x < GOAL.right; x++) {
        if ((x + frame.netShift) % 3 === 0 || (y + frame.netShift) % 3 === 0) ctx.fillRect(x, y, 1, 1);
      }
    }

    // Shadows on the grass, under everything that stands or flies.
    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    for (const s of frame.shadows) ctx.fillRect(s.x, s.y, s.w, 1);

    // Goalkeeper.
    const keeperSprite =
      frame.keeper.sprite === "stand" ? KEEPER_STAND : frame.keeper.sprite === "dive-left" ? KEEPER_DIVE_LEFT : KEEPER_DIVE_RIGHT;
    drawSprite(ctx, keeperSprite, frame.keeper.x, frame.keeper.y, {
      G: KEEPER.kit,
      g: shade(KEEPER.kit, 0.25),
      D: KEEPER.shorts,
      L: KEEPER.gloves,
      K: SKIN,
      k: shade(SKIN, 0.2),
      H: HAIR,
      B: BOOTS,
    });

    // Posts and crossbar, two pixels thick.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(GOAL.left - 1, GOAL.top, 2, GOAL.line - GOAL.top + 1);
    ctx.fillRect(GOAL.right, GOAL.top, 2, GOAL.line - GOAL.top + 1);
    ctx.fillRect(GOAL.left - 1, GOAL.top - 1, GOAL.right - GOAL.left + 3, 2);

    // Ball.
    drawSprite(ctx, BALL_SPRITES[frame.ball.size][frame.ball.spin], frame.ball.x, frame.ball.y, {
      W: "#ffffff",
      B: "#333333",
    });

    // The scorer, from behind, with his number on his back.
    const kit = kitFor(scorerColors);
    drawSprite(ctx, SCORER_FRAMES[frame.scorer.frame], frame.scorer.x, frame.scorer.y, {
      P: kit.shirt,
      p: kit.shirtShadow,
      S: kit.trim,
      K: SKIN,
      k: shade(SKIN, 0.2),
      H: HAIR,
      O: kit.trim,
      B: BOOTS,
    });
    const digits = numberSprite(number);
    const numberX = frame.scorer.x + Math.floor((SCORER_WIDTH - digits[0]!.length) / 2);
    drawSprite(ctx, digits, numberX, frame.scorer.y + NUMBER_TOP, { "#": kit.number });
  }, [scorerColors, number, target, crowd, t, ownGoal]);

  return (
    <canvas
      ref={canvasRef}
      className="goal-scene"
      width={SCENE_WIDTH}
      height={SCENE_HEIGHT}
      style={{ width: SCENE_WIDTH * SCALE, height: SCENE_HEIGHT * SCALE }}
      aria-hidden="true"
    />
  );
}
