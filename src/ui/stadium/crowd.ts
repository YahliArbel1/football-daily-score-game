// Pure crowd logic: where fans sit, what they wear, and how high they are
// lifted at a given moment. No drawing here (see StadiumBackground.tsx).
// All sizes are in canvas pixels (the canvas is low-res and scaled up).

import type { Colors } from "../../engine/types";

export type CrowdPalette =
  | { kind: "mixed"; colors: string[] }
  | { kind: "split"; home: Colors; away: Colors };

export interface Fan {
  x: number;
  /** Bottom of the fan's body when not lifted. */
  y: number;
  size: number;
  row: number;
  shirt: string;
  /** Scarf / raised-arms color. */
  accent: string;
  skin: string;
  /** Offset so fans don't all sway together. */
  phase: number;
}

export interface CrowdLayout {
  width: number;
  /** y of the back row. */
  standTop: number;
  /** Fan size per row, back to front. */
  rowSizes: number[];
}

const SKIN_TONES = ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"];

/** Highest a fan is ever lifted, as a multiple of their size. */
export const MAX_LIFT_FACTOR = 1.1;

/** Seeded random numbers (mulberry32): the same seed always gives the same sequence. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A repeatable number in [0, 1) for an integer key. */
export function hash01(key: number): number {
  return seededRandom(key)();
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!;
}

/** Shirt and accent colors for a fan at `x`. */
function fanColors(palette: CrowdPalette, x: number, width: number, random: () => number) {
  if (palette.kind === "mixed") {
    return { shirt: pick(palette.colors, random), accent: pick(palette.colors, random) };
  }
  // Left half supports the home team, right half the away team.
  const team = x < width / 2 ? palette.home : palette.away;
  const mainIsPrimary = random() < 0.7;
  return {
    shirt: mainIsPrimary ? team.primary : team.secondary,
    accent: mainIsPrimary ? team.secondary : team.primary,
  };
}

/**
 * Fan sizes for each row, back to front, that fit in `height` pixels.
 * Rows grow by 1 every two rows (2, 2, 3, 3, 4, ...) for a sense of depth.
 */
export function rowSizesFor(height: number): number[] {
  const sizes: number[] = [];
  let used = 0;
  for (let i = 0; ; i++) {
    const size = 2 + Math.floor(i / 2);
    if (used + size * 2 > height) return sizes;
    sizes.push(size);
    used += size * 2;
  }
}

/** Places every fan, row by row from the back. Same inputs + seed = same crowd. */
export function buildCrowd(layout: CrowdLayout, palette: CrowdPalette, seed: number): Fan[] {
  const random = seededRandom(seed);
  const fans: Fan[] = [];
  let y = layout.standTop;

  layout.rowSizes.forEach((size, row) => {
    y += size * 2; // body + head height
    const spacing = size + 1;
    let x = -random() * spacing; // stagger rows so heads don't line up

    while (x < layout.width) {
      const fanX = Math.round(x);
      const { shirt, accent } = fanColors(palette, fanX + size / 2, layout.width, random);
      fans.push({
        x: fanX,
        y,
        size,
        row,
        shirt,
        accent,
        skin: pick(SKIN_TONES, random),
        phase: random() * Math.PI * 2,
      });
      x += spacing + Math.floor(random() * 2);
    }
  });

  return fans;
}

// ---------- Motion ----------

const WAVE_PERIOD = 10; // seconds between waves
const WAVE_TRAVEL = 4; // seconds a wave takes to cross the stand

/**
 * Lift caused by the Mexican wave at position `x`, from 0 to 1.
 * The wave sweeps left to right once every WAVE_PERIOD seconds.
 */
export function waveLift(x: number, time: number, width: number): number {
  const band = Math.max(12, width * 0.08);
  const progress = (time % WAVE_PERIOD) / WAVE_TRAVEL;
  if (progress > 1) return 0; // between waves
  const center = -band + progress * (width + 2 * band);
  const distance = Math.abs(x - center);
  if (distance >= band) return 0;
  return (1 + Math.cos((Math.PI * distance) / band)) / 2;
}

const JUMP_SLOT = 1.5; // seconds
const JUMP_TIME = 0.6;
const JUMP_GROUP_WIDTH = 30;

/** Lift from a small group jumping together, from 0 to 1. */
export function jumpLift(x: number, time: number): number {
  const group = Math.floor(x / JUMP_GROUP_WIDTH);
  const slot = Math.floor(time / JUMP_SLOT);
  if (hash01(group * 7919 + slot * 104729) >= 0.08) return 0;
  const inSlot = time - slot * JUMP_SLOT;
  if (inSlot >= JUMP_TIME) return 0;
  return Math.sin((Math.PI * inSlot) / JUMP_TIME);
}

/** How many pixels a fan is lifted at `time` (seconds): sway + wave or jump. */
export function fanLift(fan: Fan, time: number, width: number): number {
  const sway = 0.15 * ((1 + Math.sin(time * 2.2 + fan.phase)) / 2);
  const big = Math.max(0.9 * waveLift(fan.x, time, width), 0.8 * jumpLift(fan.x, time));
  return fan.size * (sway + big);
}
