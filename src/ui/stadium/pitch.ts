// Pitch geometry for the background, seen like the main TV camera: from the
// side stand, looking across the pitch at the opposite stand.
//
// Pitch coordinates are in meters:
//   u = along the pitch, -52.5 (left goal line) to +52.5 (right goal line)
//   v = across the pitch, 0 (far touchline, under the crowd) to 68 (near touchline)
// The near touchline is below the bottom of the screen, so only part of the
// pitch is visible.

export const PITCH_LENGTH = 105;
export const PITCH_WIDTH = 68;
const HALF_LENGTH = PITCH_LENGTH / 2;

/** Gap (CSS pixels) between the bottom of the stand's ad boards and the far touchline. */
export const TOUCHLINE_GAP = 12;

/** How far (in meters) the camera is from the near touchline. Bigger = flatter perspective. */
const CAMERA_DISTANCE = 60;

export interface PitchView {
  /** Screen (canvas) size in pixels. */
  width: number;
  height: number;
  /** Screen y of the far touchline. */
  farY: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Size factor at depth v: 1 at the near touchline, smaller further away. */
export function depthScale(v: number): number {
  return CAMERA_DISTANCE / (CAMERA_DISTANCE + (PITCH_WIDTH - v));
}

/**
 * Converts a pitch position (meters) to a screen position (pixels).
 * The far touchline lands on `farY`, the halfway line on the middle of the
 * screen, and the far touchline is a little wider than the screen.
 */
export function project(u: number, v: number, view: PitchView): Point {
  const farScale = depthScale(0);
  // Near touchline sits well below the screen.
  const nearY = view.height * 1.35;
  // Chosen so that v = 0 lands exactly on farY.
  const horizonY = (view.farY - nearY * farScale) / (1 - farScale);
  // Chosen so that the far touchline is 1.1x the screen width.
  const pixelsPerMeter = (view.width * 1.1) / (PITCH_LENGTH * farScale);

  const scale = depthScale(v);
  return {
    x: view.width / 2 + u * pixelsPerMeter * scale,
    y: horizonY + (nearY - horizonY) * scale,
  };
}

/** Points around a circle on the pitch (it looks like an oval on screen). */
export function projectCircle(
  centerU: number,
  centerV: number,
  radius: number,
  view: PitchView,
  fromAngle = 0,
  toAngle = Math.PI * 2,
  steps = 48,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = fromAngle + ((toAngle - fromAngle) * i) / steps;
    points.push(project(centerU + radius * Math.cos(a), centerV + radius * Math.sin(a), view));
  }
  return points;
}

/** All pitch markings as lines (lists of points), using real pitch measurements. */
export function pitchMarkings(view: PitchView): Point[][] {
  const p = (u: number, v: number) => project(u, v, view);
  const lines: Point[][] = [];

  // Touchlines, goal lines and halfway line
  lines.push([p(-HALF_LENGTH, 0), p(HALF_LENGTH, 0)]);
  lines.push([p(-HALF_LENGTH, 0), p(-HALF_LENGTH, PITCH_WIDTH)]);
  lines.push([p(HALF_LENGTH, 0), p(HALF_LENGTH, PITCH_WIDTH)]);
  lines.push([p(0, 0), p(0, PITCH_WIDTH)]);

  // Centre circle and spot
  const mid = PITCH_WIDTH / 2;
  lines.push(projectCircle(0, mid, 9.15, view));
  lines.push(projectCircle(0, mid, 0.3, view, 0, Math.PI * 2, 8));

  for (const side of [-1, 1]) {
    const goalLine = side * HALF_LENGTH;
    const inward = -side;

    // Penalty area (16.5 m deep, 40.32 m wide) and goal area (5.5 x 18.32)
    for (const [depth, halfWidth] of [
      [16.5, 20.16],
      [5.5, 9.16],
    ] as const) {
      const edge = goalLine + inward * depth;
      lines.push([
        p(goalLine, mid - halfWidth),
        p(edge, mid - halfWidth),
        p(edge, mid + halfWidth),
        p(goalLine, mid + halfWidth),
      ]);
    }

    // Penalty spot (11 m) and the arc outside the box
    const spot = goalLine + inward * 11;
    lines.push(projectCircle(spot, mid, 0.3, view, 0, Math.PI * 2, 8));
    const arcHalf = Math.acos(5.5 / 9.15); // where the arc meets the box edge
    const facing = side === 1 ? Math.PI : 0;
    lines.push(projectCircle(spot, mid, 9.15, view, facing - arcHalf, facing + arcHalf, 24));

    // Far corner arc
    const cornerStart = side === 1 ? Math.PI / 2 : 0;
    lines.push(projectCircle(goalLine, 0, 1, view, cornerStart, cornerStart + Math.PI / 2, 6));
  }

  return lines;
}

/**
 * Mowing stripes as four-cornered shapes running across the pitch,
 * every `stripeWidth` meters, extending past the goal lines to fill the screen.
 */
export function mowingStripes(view: PitchView, stripeWidth = PITCH_LENGTH / 20): Point[][] {
  const stripes: Point[][] = [];
  const reach = HALF_LENGTH + 40;
  for (let u = -reach, i = 0; u < reach; u += stripeWidth, i++) {
    if (i % 2 === 1) continue; // every other stripe; the gaps show the base color
    stripes.push([
      project(u, 0, view),
      project(u + stripeWidth, 0, view),
      project(u + stripeWidth, PITCH_WIDTH, view),
      project(u, PITCH_WIDTH, view),
    ]);
  }
  return stripes;
}
