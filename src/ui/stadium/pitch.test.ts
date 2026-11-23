import { describe, expect, it } from "vitest";
import {
  depthScale,
  mowingStripes,
  pitchMarkings,
  PITCH_WIDTH,
  project,
  projectCircle,
  type PitchView,
} from "./pitch";

const view: PitchView = { width: 400, height: 300, farY: 80 };

describe("depthScale", () => {
  it("is 1 at the near touchline and smaller further away", () => {
    expect(depthScale(PITCH_WIDTH)).toBe(1);
    expect(depthScale(0)).toBeLessThan(depthScale(34));
    expect(depthScale(34)).toBeLessThan(1);
  });
});

describe("project", () => {
  it("puts the far touchline at farY", () => {
    expect(project(0, 0, view).y).toBeCloseTo(view.farY, 6);
    expect(project(-52.5, 0, view).y).toBeCloseTo(view.farY, 6);
  });

  it("puts the halfway line in the middle of the screen", () => {
    expect(project(0, 0, view).x).toBeCloseTo(view.width / 2, 6);
    expect(project(0, 50, view).x).toBeCloseTo(view.width / 2, 6);
  });

  it("makes the far touchline a little wider than the screen", () => {
    const left = project(-52.5, 0, view).x;
    const right = project(52.5, 0, view).x;
    expect(right - left).toBeCloseTo(view.width * 1.1, 6);
  });

  it("is symmetric left to right", () => {
    const a = project(-30, 20, view);
    const b = project(30, 20, view);
    expect(a.y).toBeCloseTo(b.y, 6);
    expect(view.width / 2 - a.x).toBeCloseTo(b.x - view.width / 2, 6);
  });

  it("draws nearer things lower and bigger (perspective)", () => {
    const far = project(10, 10, view);
    const near = project(10, 40, view);
    expect(near.y).toBeGreaterThan(far.y);
    // 10 m from the halfway line looks wider up close.
    expect(near.x - view.width / 2).toBeGreaterThan(far.x - view.width / 2);
  });

  it("keeps the near touchline below the screen", () => {
    expect(project(0, PITCH_WIDTH, view).y).toBeGreaterThan(view.height);
  });
});

describe("projectCircle", () => {
  it("draws the centre circle as an oval: wider than it is tall", () => {
    const points = projectCircle(0, 34, 9.15, view);
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    expect(w).toBeGreaterThan(h);
  });

  it("closes the full circle", () => {
    const points = projectCircle(0, 34, 9.15, view);
    expect(points[0]!.x).toBeCloseTo(points.at(-1)!.x, 6);
    expect(points[0]!.y).toBeCloseTo(points.at(-1)!.y, 6);
  });
});

describe("pitchMarkings", () => {
  it("only returns real numbers (no NaN from bad math)", () => {
    for (const line of pitchMarkings(view)) {
      expect(line.length).toBeGreaterThanOrEqual(2);
      for (const p of line) {
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
      }
    }
  });

  it("keeps every marking at or below the far touchline", () => {
    for (const line of pitchMarkings(view)) {
      for (const p of line) expect(p.y).toBeGreaterThanOrEqual(view.farY - 1e-6);
    }
  });
});

describe("mowingStripes", () => {
  it("covers the whole screen width at the far touchline", () => {
    const stripes = mowingStripes(view);
    const lefts = stripes.map((s) => s[0]!.x);
    const rights = stripes.map((s) => s[1]!.x);
    expect(Math.min(...lefts)).toBeLessThan(0);
    expect(Math.max(...rights)).toBeGreaterThan(view.width);
  });
});
