// The goal scene in the match animation ("level C"): pixel-art
// footage from behind the scorer: he runs up and shoots, the goalkeeper
// dives the other way, the ball hits the net. Generic figures, not real
// players: only the team's two colors and the scorer's shirt number.
//
// Pure logic: the sprites (grids of letters, one letter per color) and where
// everything is at a given moment. GoalScene.tsx draws it.

import type { Colors } from "../engine/types";
import { luminance, textColorOn } from "./colors";

/** The scene is drawn on a WIDTH x HEIGHT pixel canvas, scaled up on screen. */
export const SCENE_WIDTH = 116;
export const SCENE_HEIGHT = 80;
/** How long one goal's scene lasts, in animation milliseconds. */
export const SCENE_MS = 2800;

// Moments in the scene (ms from its start).
const RUN_ENDS = 1000; // run-up, then the wind-up
const KICK_AT = 1150; // the strike: the ball leaves his foot
const BALL_LANDS = 1650;
const CELEBRATE_AT = 1700;
/** One step of the running cycle. */
const STEP_MS = 125;

/**
 * Sprites: one letter per pixel, "." is see-through.
 * P shirt (team primary)   p shirt in shadow   S sleeves, collar, shorts (secondary)
 * K skin   k skin in shadow   H hair   O socks (secondary)   B boots
 * G keeper kit   g keeper kit in shadow   D keeper shorts   L gloves
 */
export type Sprite = string[];

/** The scorer from behind, down to the knees. Rows 8-12 leave room for his number. */
const SCORER_TOP: Sprite = [
  ".....HHHHH.....",
  "....HHHHHHH....",
  "....HHHHHHH....",
  ".....HHHHH.....",
  "......kKk......",
  "...SSSSSSSSS...",
  "..SSPPPPPPPSS..",
  ".SSPPPPPPPPPSS.",
  ".SSPPPPPPPPPSS.",
  ".KpPPPPPPPPPpK.",
  ".KpPPPPPPPPPpK.",
  ".KpPPPPPPPPPpK.",
  ".kpPPPPPPPPPpk.",
  "..pPPPPPPPPPp..",
  "..pPPPPPPPPPp..",
  "..SSSSSSSSSSS..",
  "..SSSSSSSSSSS..",
  "..SSSSS.SSSSS..",
  "..SSSS...SSSS..",
];

/** The same, with his arms out for balance (wind-up and strike). */
const SCORER_TOP_ARMS_OUT: Sprite = SCORER_TOP.map((row, i) =>
  i >= 9 && i <= 11 ? `K${row.slice(1, 14).replace(/K/g, ".")}K` : row,
);

/** Celebrating: arms up in the air, the number still on his back. */
const SCORER_TOP_ARMS_UP: Sprite = [
  ".K...HHHHH...K.",
  ".K..HHHHHHH..K.",
  ".KK.HHHHHHH.KK.",
  "..K..HHHHH..K..",
  "..SS..kKk..SS..",
  "...SSSSSSSSS...",
  ...SCORER_TOP.slice(6).map((row) => row.replace(/K/g, ".").replace(/k/g, ".")),
];

/** Own goal: hands on his head ("what have I done"), the number still on his back. */
const SCORER_TOP_HANDS_ON_HEAD: Sprite = [
  ".....HHHHH.....",
  "..K.HHHHHHH.K..",
  "..KKHHHHHHHKK..",
  "...K.HHHHH.K...",
  "...S..kKk..S...",
  "...SSSSSSSSS...",
  ...SCORER_TOP.slice(6).map((row) => row.replace(/K/g, ".").replace(/k/g, ".")),
];

// Legs, six rows each, from behind.
const LEGS = {
  // Left foot on the ground, right leg lifted behind him.
  leftDown: ["...KK.....KK...", "...KK.....OO...", "...OO.....OO...", "...OO.....BB...", "...OO..........", "..BBB.........."],
  // Right foot on the ground, left leg lifted.
  rightDown: ["...KK.....KK...", "...OO.....KK...", "...OO.....OO...", "...BB.....OO...", "..........OO...", "..........BBB.."],
  // Legs passing each other, mid-stride.
  passing: ["...KK.....KK...", "....KK...KK....", "....OO...OO....", "....OO...OO....", "....OO...BB....", "....BB.........."].map((r) => r.slice(0, 15)),
  // Both feet planted.
  planted: ["...KK.....KK...", "...KK.....KK...", "...OO.....OO...", "...OO.....OO...", "...OO.....OO...", "..BBB.....BBB.."],
  // After the shot: the kicking leg swung through, out of sight in front of him.
  followThrough: ["...KK.....KK...", "...KK.....KK...", "...OO..........", "...OO..........", "...OO..........", "..BBB.........."],
  // Own goal: right leg stretched out to the side to block the cross.
  stretch: ["...KK.....KK...", "...KK......KK..", "...OO.......OO.", "...OO.......OO.", "...OO........BB", "..BBB.........."],
};

export type ScorerFrame =
  | "runA"
  | "passA"
  | "runB"
  | "passB"
  | "windup"
  | "strike"
  | "follow"
  | "celebrate"
  | "stretch"
  | "despair";

export const SCORER_FRAMES: Record<ScorerFrame, Sprite> = {
  // The running cycle: left foot down, legs passing, right foot down, passing.
  runA: [...SCORER_TOP, ...LEGS.leftDown],
  passA: [...SCORER_TOP, ...LEGS.passing],
  runB: [...SCORER_TOP, ...LEGS.rightDown],
  passB: [...SCORER_TOP, ...LEGS.passing],
  // Planting his left foot, kicking leg drawn back, arms out.
  windup: [...SCORER_TOP_ARMS_OUT, ...LEGS.leftDown],
  // The moment he strikes the ball.
  strike: [...SCORER_TOP_ARMS_OUT, ...LEGS.planted],
  follow: [...SCORER_TOP_ARMS_OUT, ...LEGS.followThrough],
  celebrate: [...SCORER_TOP_ARMS_UP, ...LEGS.planted],
  // Own goal: lunging at the cross, then hands on his head.
  stretch: [...SCORER_TOP_ARMS_OUT, ...LEGS.stretch],
  despair: [...SCORER_TOP_HANDS_ON_HEAD, ...LEGS.planted],
};

const RUN_CYCLE: ScorerFrame[] = ["runA", "passA", "runB", "passB"];

/** Where the number goes on the scorer's back (sprite rows). */
export const NUMBER_TOP = 8;
export const SCORER_WIDTH = 15;

/** The goalkeeper facing us, crouched and ready, arms out. */
export const KEEPER_STAND: Sprite = [
  "....HHHHH....",
  "...HHHHHHH...",
  "...HkKKKkH...",
  "...KKKKKKK...",
  "....KKKKK....",
  "..GGGGGGGGG..",
  ".GGGGGGGGGGG.",
  "LGGgGGGGGgGGL",
  "LLGgGGGGGgGLL",
  "..GGGGGGGGG..",
  "..gGGGGGGGg..",
  "..DDDDDDDDD..",
  "..DDDD.DDDD..",
  "..KKK...KKK..",
  "..GGG...GGG..",
  "..GGG...GGG..",
  ".BBBB...BBBB.",
];

/** The goalkeeper diving to our left, flat out, gloves first. */
export const KEEPER_DIVE_LEFT: Sprite = [
  "LL....HHHH..........",
  "LLGG.HHHHHH.........",
  "..GGGGGKKKGGGGGDDDKB",
  "...GGGGGGGGGGGGDDDKB",
  ".....gGGGGGGGGgDDDGB",
  "...............DDD..",
];

export const KEEPER_DIVE_RIGHT: Sprite = KEEPER_DIVE_LEFT.map((row) => [...row].reverse().join(""));

/**
 * The ball, from close (5x5) to far away (3x3), in two turns of its spin.
 * W white, B black patches.
 */
export const BALL_SPRITES: Record<3 | 4 | 5, [Sprite, Sprite]> = {
  5: [
    [".WWW.", "WWBWW", "WBBBW", "WWBWW", ".WWW."],
    [".WBW.", "WWWWB", "BWWWW", "WWWBW", ".BWW."],
  ],
  4: [
    [".WW.", "WWBW", "WBWW", ".WW."],
    [".BW.", "WWWB", "BWWW", ".WB."],
  ],
  3: [
    [".W.", "WBW", ".W."],
    [".B.", "WWW", ".W."],
  ],
};

/** Digits for the shirt number, 4 x 6 pixels each ("#" = filled): two fill the back. */
const DIGITS: Record<string, Sprite> = {
  "0": [".##.", "#..#", "#..#", "#..#", "#..#", ".##."],
  "1": ["..#.", ".##.", "..#.", "..#.", "..#.", ".###"],
  "2": [".##.", "#..#", "...#", "..#.", ".#..", "####"],
  "3": ["###.", "...#", ".##.", "...#", "...#", "###."],
  "4": ["#..#", "#..#", "####", "...#", "...#", "...#"],
  "5": ["####", "#...", "###.", "...#", "...#", "###."],
  "6": [".##.", "#...", "###.", "#..#", "#..#", ".##."],
  "7": ["####", "...#", "..#.", ".#..", ".#..", ".#.."],
  "8": [".##.", "#..#", ".##.", "#..#", "#..#", ".##."],
  "9": [".##.", "#..#", "#..#", ".###", "...#", ".##."],
};

/** A shirt number as a 6-row pixel grid: digits 4 wide with a 1-pixel gap. */
export function numberSprite(number: number): Sprite {
  const digits = String(number).split("").map((d) => DIGITS[d]!);
  return [0, 1, 2, 3, 4, 5].map((row) => digits.map((d) => d[row]).join("."));
}

/** How different two colors are in brightness (WCAG contrast ratio, 1 to 21). */
function contrast(a: string, b: string): number {
  const la = luminance(a) ?? 0;
  const lb = luminance(b) ?? 0;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** A color made darker by `amount` (0 to 1), for shading. */
export function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

/** The colors of the scorer's kit, from his team's two colors. */
export interface Kit {
  shirt: string;
  shirtShadow: string;
  trim: string;
  number: string;
}

/**
 * The team's kit: shirt in the primary color; sleeves, collar, shorts, socks
 * and number in the secondary. If the secondary is too close to the shirt to
 * read (e.g. Barcelona's blue on maroon), the number is white or black instead.
 */
export function kitFor(colors: Colors): Kit {
  const readable = contrast(colors.primary, colors.secondary) >= 2.5;
  return {
    shirt: colors.primary,
    shirtShadow: shade(colors.primary, 0.25),
    trim: colors.secondary,
    number: readable ? colors.secondary : textColorOn(colors.primary),
  };
}

/** Where the shot goes. Rotates with the goal's order, so a match always looks the same. */
export type ShotTarget = "top-left" | "top-right" | "low-middle";
const TARGETS: ShotTarget[] = ["top-left", "top-right", "low-middle"];
export const shotTarget = (goalIndex: number): ShotTarget => TARGETS[goalIndex % TARGETS.length]!;

// The goal mouth on the canvas.
export const GOAL = { left: 36, right: 80, top: 15, line: 38 };
const TARGET_POINT: Record<ShotTarget, { x: number; y: number }> = {
  "top-left": { x: 39, y: 18 },
  "top-right": { x: 75, y: 18 },
  "low-middle": { x: 57, y: 32 },
};

/** Positions are the top-left pixel of each sprite on the canvas. */
export interface SceneFrame {
  scorer: { frame: ScorerFrame; x: number; y: number };
  /** The ball shrinks as it flies away from us, and spins (two patterns). */
  ball: { x: number; y: number; size: 3 | 4 | 5; spin: 0 | 1 };
  keeper: { sprite: "stand" | "dive-left" | "dive-right"; x: number; y: number };
  /** How far the net pattern is shifted: 0 at rest, 1 while it ripples. */
  netShift: 0 | 1;
  /**
   * Shadows on the grass, drawn under the figures: one flat strip (`w` wide,
   * 1 pixel high) each. The ball's stays on the ground as the ball rises,
   * which shows how high it is.
   */
  shadows: Shadow[];
}

export interface Shadow {
  x: number;
  y: number;
  w: number;
}

/** A soft oval: a wide strip with a narrower one under it. */
function oval(centerX: number, y: number, w: number): Shadow[] {
  return [
    { x: Math.round(centerX - w / 2), y, w },
    { x: Math.round(centerX - (w - 4) / 2), y: y + 1, w: w - 4 },
  ];
}

/** The shadows of the scorer (at his feet, even mid-jump), the keeper and the ball. */
function shadowsFor(
  scorerX: number,
  groundY: number,
  keeper: SceneFrame["keeper"],
  ball: { x: number; groundY: number; size: number },
): Shadow[] {
  const scorerHeight = SCORER_FRAMES.runA.length;
  const keeperShadow =
    keeper.sprite === "stand"
      ? oval(keeper.x + KEEPER_STAND[0]!.length / 2, GOAL.line, 12)
      : oval(keeper.x + KEEPER_DIVE_LEFT[0]!.length / 2, GOAL.line - 2, 18);
  return [
    ...keeperShadow,
    { x: ball.x, y: ball.groundY, w: ball.size },
    ...oval(scorerX + SCORER_WIDTH / 2, groundY + scorerHeight - 1, 13),
  ];
}

/** When the ball hits the net, in ms from the scene's start (for the sound). */
export function ballLandsAt(ownGoal: boolean): number {
  return ownGoal ? OG_BALL_LANDS : BALL_LANDS;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

/** Where the ball sits before the shot: just ahead of the scorer, by his left foot. */
const BALL_SPOT = { x: 46, y: 64 };
/** The keeper dives the other way from the shot (a low shot down the middle beats him to his right). */
const DIVE: Record<ShotTarget, "dive-left" | "dive-right"> = {
  "top-left": "dive-right",
  "top-right": "dive-left",
  "low-middle": "dive-left",
};

/** Which pose the scorer is in at `time` ms. */
function scorerFrame(time: number): ScorerFrame {
  if (time < RUN_ENDS) return RUN_CYCLE[Math.floor(time / STEP_MS) % RUN_CYCLE.length]!;
  if (time < KICK_AT) return "windup";
  if (time < KICK_AT + 150) return "strike";
  if (time < CELEBRATE_AT) return "follow";
  return "celebrate";
}

/** Everything's position `t` ms into the scene (clamped to the scene). */
export function sceneAt(t: number, target: ShotTarget): SceneFrame {
  const time = Math.max(0, Math.min(t, SCENE_MS));

  // Run-up from the bottom of the frame to just behind the ball; after the
  // goal he jumps for joy (up and down every 150 ms).
  const run = time / RUN_ENDS;
  const jumping = time >= CELEBRATE_AT && Math.floor((time - CELEBRATE_AT) / 150) % 2 === 0;
  const groundY = Math.round(lerp(56, 50, run));
  const scorer = {
    frame: scorerFrame(time),
    x: Math.round(lerp(48, 51, run)),
    y: groundY - (jumping ? 2 : 0),
  };

  // The shot: from the spot to the target, shrinking and spinning as it goes.
  const flight = (time - KICK_AT) / (BALL_LANDS - KICK_AT);
  const end = TARGET_POINT[target];
  const ball =
    time >= KICK_AT
      ? {
          x: Math.round(lerp(BALL_SPOT.x, end.x, flight)),
          y: Math.round(lerp(BALL_SPOT.y, end.y, flight)),
          size: (flight < 0.3 ? 5 : flight < 0.65 ? 4 : 3) as 3 | 4 | 5,
          spin: (flight < 1 && Math.floor(time / 60) % 2 === 1 ? 1 : 0) as 0 | 1,
        }
      : { ...BALL_SPOT, size: 5 as const, spin: 0 as const };

  // The keeper bounces on his toes during the run-up, pushes off just after
  // the kick, flies the wrong way and lands on the grass.
  const standY = GOAL.line - KEEPER_STAND.length + 1;
  const takeoff = KICK_AT + 50;
  const dive = (time - takeoff - 80) / 300;
  const side = DIVE[target] === "dive-left" ? -1 : 1;
  let keeper: SceneFrame["keeper"];
  if (time < takeoff) {
    keeper = { sprite: "stand", x: 52, y: standY + (Math.floor(time / 250) % 2) };
  } else if (dive <= 0) {
    keeper = { sprite: "stand", x: 52 + side * 3, y: standY - 2 }; // pushing off
  } else {
    keeper = {
      sprite: DIVE[target],
      x: Math.round(lerp(48 + side * 2, side < 0 ? 37 : 59, dive)),
      // Up a little, then down onto the grass.
      y: Math.round(lerp(24, 32, dive) - Math.sin(Math.min(1, dive) * Math.PI) * 3),
    };
  }

  // The ball's shadow runs along the ground from the spot to the goal line
  // while the ball itself rises towards the top corner.
  const ballGroundY = time >= KICK_AT ? Math.round(lerp(BALL_SPOT.y + 5, GOAL.line - 1, flight)) : BALL_SPOT.y + 5;
  const shadows = shadowsFor(scorer.x, groundY, keeper, { x: ball.x, groundY: ballGroundY, size: ball.size });

  return { scorer, ball, keeper, netShift: netShiftAt(time, BALL_LANDS), shadows };
}

/** The net ripples for a moment after the ball hits it. */
function netShiftAt(time: number, landsAt: number): 0 | 1 {
  const rippling = time >= landsAt && time < landsAt + 450;
  return rippling && Math.floor(time / 80) % 2 === 0 ? 1 : 0;
}

// Own goal moments (ms from the scene's start).
const OG_RUN_ENDS = 900; // the defender tracks back towards his own goal
const OG_CROSS_FROM = 350; // the cross comes in from the right
const OG_CONTACT = 1000; // the ball hits his outstretched leg
const OG_BALL_LANDS = 1400;
const OG_DESPAIR_AT = 1450;
/** Where the cross starts (at the right edge) and where it ends: in the bottom-left corner. */
const OG_CROSS_START = { x: SCENE_WIDTH - 5, y: 52 };
const OG_TARGET = { x: 40, y: 32 };

/**
 * An own goal, `t` ms into the scene: the scorer is a defender running back
 * towards his own goal (we see his back); a cross from the right hits his
 * stretched leg and goes in at the far post; the keeper, who had moved
 * towards the cross, dives back too late. Then: hands on his head.
 */
export function ownGoalSceneAt(t: number): SceneFrame {
  const time = Math.max(0, Math.min(t, SCENE_MS));

  // The defender tracks back, then lunges at the cross, then stands still in despair.
  const run = time / OG_RUN_ENDS;
  const frame: ScorerFrame =
    time < OG_RUN_ENDS
      ? RUN_CYCLE[Math.floor(time / STEP_MS) % RUN_CYCLE.length]!
      : time < OG_DESPAIR_AT
        ? "stretch"
        : "despair";
  const groundY = Math.round(lerp(56, 46, run));
  const scorer = {
    frame,
    x: Math.round(lerp(58, 54, run)),
    y: groundY + (frame === "despair" ? 1 : 0), // slumping
  };

  // The ball: across from the right to his stretched right foot, then
  // deflected into his own net.
  const foot = { x: scorer.x + 12, y: scorer.y + 21 };
  let ball: SceneFrame["ball"];
  let ballGroundY: number; // the ball's shadow on the grass
  if (time < OG_CROSS_FROM) {
    ball = { ...OG_CROSS_START, size: 4, spin: 0 }; // just entering the frame
    ballGroundY = OG_CROSS_START.y + 4;
  } else if (time < OG_CONTACT) {
    const p = (time - OG_CROSS_FROM) / (OG_CONTACT - OG_CROSS_FROM);
    const groundPath = lerp(OG_CROSS_START.y, foot.y, p);
    ball = {
      x: Math.round(lerp(OG_CROSS_START.x, foot.x, p)),
      // A cross dips: up first, then down to his foot. The shadow stays on the ground.
      y: Math.round(groundPath - Math.sin(p * Math.PI) * 10),
      size: 4,
      spin: (Math.floor(time / 60) % 2) as 0 | 1,
    };
    ballGroundY = Math.round(groundPath) + 4;
  } else {
    const p = (time - OG_CONTACT) / (OG_BALL_LANDS - OG_CONTACT);
    ball = {
      x: Math.round(lerp(foot.x, OG_TARGET.x, p)),
      y: Math.round(lerp(foot.y, OG_TARGET.y, p)),
      size: p < 0.5 ? 4 : 3,
      spin: (p < 1 && Math.floor(time / 60) % 2 === 1 ? 1 : 0) as 0 | 1,
    };
    ballGroundY = Math.round(lerp(foot.y + 4, GOAL.line - 1, p));
  }

  // The keeper shifts towards the cross, then dives back to his right, too late.
  const standY = GOAL.line - KEEPER_STAND.length + 1;
  const dive = (time - OG_CONTACT - 80) / 300;
  const keeper: SceneFrame["keeper"] =
    dive <= 0
      ? { sprite: "stand", x: Math.round(lerp(52, 62, time / OG_CONTACT)), y: standY + (Math.floor(time / 250) % 2) }
      : {
          sprite: "dive-left",
          x: Math.round(lerp(58, 45, dive)),
          y: Math.round(lerp(24, 32, dive) - Math.sin(Math.min(1, dive) * Math.PI) * 3),
        };

  const shadows = shadowsFor(scorer.x, groundY, keeper, { x: ball.x, groundY: ballGroundY, size: ball.size });
  return { scorer, ball, keeper, netShift: netShiftAt(time, OG_BALL_LANDS), shadows };
}
