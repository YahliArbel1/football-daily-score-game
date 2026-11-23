import { describe, expect, it } from "vitest";
import {
  buildCrowd,
  fanLift,
  MAX_LIFT_FACTOR,
  rowSizesFor,
  seededRandom,
  waveLift,
  type CrowdLayout,
  type CrowdPalette,
} from "./crowd";

const layout: CrowdLayout = { width: 400, standTop: 20, rowSizes: [2, 3, 4, 5, 6] };
const mixed: CrowdPalette = { kind: "mixed", colors: ["#ff0000", "#00ff00", "#0000ff"] };
const split: CrowdPalette = {
  kind: "split",
  home: { primary: "#fb090b", secondary: "#000000" },
  away: { primary: "#c8102e", secondary: "#ffffff" },
};

describe("seededRandom", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("returns numbers in [0, 1)", () => {
    const r = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const n = r();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe("rowSizesFor", () => {
  it("grows rows towards the front and fits the height", () => {
    const sizes = rowSizesFor(80);
    expect(sizes.slice(0, 4)).toEqual([2, 2, 3, 3]);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes.reduce((sum, s) => sum + s * 2, 0)).toBeLessThanOrEqual(80);
  });

  it("can start from bigger fans in the back row", () => {
    expect(rowSizesFor(80, 3).slice(0, 4)).toEqual([3, 3, 4, 4]);
  });

  it("returns no rows when there is no room", () => {
    expect(rowSizesFor(3)).toEqual([]);
  });
});

describe("buildCrowd", () => {
  it("builds the same crowd for the same seed, and a different one for another seed", () => {
    expect(buildCrowd(layout, mixed, 1)).toEqual(buildCrowd(layout, mixed, 1));
    expect(buildCrowd(layout, mixed, 1)).not.toEqual(buildCrowd(layout, mixed, 2));
  });

  it("fills every row across the whole width", () => {
    const fans = buildCrowd(layout, mixed, 1);
    layout.rowSizes.forEach((_size, row) => {
      const inRow = fans.filter((f) => f.row === row);
      expect(inRow.length).toBeGreaterThan(10);
      expect(Math.min(...inRow.map((f) => f.x))).toBeLessThanOrEqual(0);
      expect(Math.max(...inRow.map((f) => f.x + f.size))).toBeGreaterThanOrEqual(layout.width - 8);
    });
  });

  it("puts bigger rows lower down (closer to the viewer)", () => {
    const fans = buildCrowd(layout, mixed, 1);
    const rowY = layout.rowSizes.map((_, row) => fans.find((f) => f.row === row)!.y);
    expect(rowY).toEqual([...rowY].sort((a, b) => a - b));
  });

  it("uses only palette colors in a mixed crowd", () => {
    for (const fan of buildCrowd(layout, mixed, 3)) {
      expect(mixed.colors).toContain(fan.shirt);
      expect(mixed.colors).toContain(fan.accent);
    }
  });

  it("dresses the left half in home colors and the right half in away colors", () => {
    const homeColors = ["#fb090b", "#000000"];
    const awayColors = ["#c8102e", "#ffffff"];
    for (const fan of buildCrowd(layout, split, 5)) {
      const center = fan.x + fan.size / 2;
      const expected = center < layout.width / 2 ? homeColors : awayColors;
      expect(expected).toContain(fan.shirt);
      expect(expected).toContain(fan.accent);
    }
  });

  it("mostly uses each team's primary color for shirts", () => {
    const fans = buildCrowd(layout, split, 5).filter((f) => f.x + f.size / 2 < layout.width / 2);
    const primary = fans.filter((f) => f.shirt === "#fb090b").length;
    expect(primary / fans.length).toBeGreaterThan(0.55);
  });
});

describe("waveLift", () => {
  const width = 400;

  it("is 0 between waves", () => {
    // The wave takes 4 s to cross; at 6 s into a 10 s cycle no wave is running.
    for (let x = 0; x <= width; x += 20) expect(waveLift(x, 6, width)).toBe(0);
  });

  it("lifts only fans near the wave, fully at its center", () => {
    // Halfway through the crossing (2 s) the wave is at the middle of the stand.
    expect(waveLift(width / 2, 2, width)).toBeCloseTo(1, 5);
    expect(waveLift(0, 2, width)).toBe(0);
    expect(waveLift(width, 2, width)).toBe(0);
  });

  it("moves left to right", () => {
    // Find where the wave peaks at two moments; the later peak is further right.
    const peakAt = (t: number) => {
      let best = 0;
      for (let x = 0; x <= width; x++) if (waveLift(x, t, width) > waveLift(best, t, width)) best = x;
      return best;
    };
    const early = peakAt(1.5);
    const late = peakAt(2.8);
    expect(waveLift(early, 1.5, width)).toBeGreaterThan(0.9);
    expect(waveLift(late, 2.8, width)).toBeGreaterThan(0.9);
    expect(late).toBeGreaterThan(early);
  });
});

describe("fanLift", () => {
  it("always stays between 0 and the maximum lift", () => {
    const fans = buildCrowd(layout, mixed, 9);
    for (let t = 0; t < 30; t += 0.1) {
      for (const fan of fans) {
        const lift = fanLift(fan, t, layout.width);
        expect(lift).toBeGreaterThanOrEqual(0);
        expect(lift).toBeLessThanOrEqual(fan.size * MAX_LIFT_FACTOR);
      }
    }
  });
});
