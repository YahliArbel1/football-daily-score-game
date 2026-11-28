import { describe, expect, it } from "vitest";
import { ICON_SIZE, iconPath, PIXEL_ICONS } from "./pixelIcons";

describe("PIXEL_ICONS", () => {
  it("are all 7x7 grids of X and .", () => {
    for (const [name, rows] of Object.entries(PIXEL_ICONS)) {
      expect(rows, name).toHaveLength(ICON_SIZE);
      for (const row of rows) expect(row, name).toMatch(/^[X.]{7}$/);
    }
  });

  it("draws back as the mirror image of play", () => {
    const mirrored = PIXEL_ICONS.play.map((row) => [...row].reverse().join(""));
    expect(PIXEL_ICONS.back).toEqual(mirrored);
  });
});

describe("iconPath", () => {
  it("draws one square per X, at its column and row", () => {
    expect(iconPath(["X.", ".X"])).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
  });

  it("draws nothing for an empty grid", () => {
    expect(iconPath([".."])).toBe("");
  });
});
