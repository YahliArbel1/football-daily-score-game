import { describe, expect, it } from "vitest";
import { istanbul2005 } from "../../engine/fixtures/istanbul-2005";
import {
  homeBoards,
  matchBoards,
  PANEL_WIDTH,
  scrollOffset,
  visiblePanels,
  type BoardPanel,
} from "./adBoards";

const panels: BoardPanel[] = [
  { text: "A", background: "#000000", color: "#ffffff" },
  { text: "B", background: "#ffffff", color: "#000000" },
  { text: "C", background: "#ff0000", color: "#ffffff" },
];
const loop = panels.length * PANEL_WIDTH;

describe("visiblePanels", () => {
  it("covers the whole width with no gaps", () => {
    for (const offset of [0, 50, 219, 220, 400, 659]) {
      const placed = visiblePanels(panels, 1000, offset);
      expect(placed[0]!.x).toBeLessThanOrEqual(0);
      expect(placed.at(-1)!.x + PANEL_WIDTH).toBeGreaterThanOrEqual(1000);
      for (let i = 1; i < placed.length; i++) {
        expect(placed[i]!.x - placed[i - 1]!.x).toBe(PANEL_WIDTH);
      }
    }
  });

  it("skips panels that are fully off screen", () => {
    for (const p of visiblePanels(panels, 1000, 300)) {
      expect(p.x + PANEL_WIDTH).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(1000);
    }
  });

  it("keeps the panel order and repeats it", () => {
    const texts = visiblePanels(panels, 1500, 0).map((p) => p.text);
    expect(texts.slice(0, 6)).toEqual(["A", "B", "C", "A", "B", "C"]);
  });

  it("looks the same after one full loop", () => {
    expect(visiblePanels(panels, 1000, 123)).toEqual(visiblePanels(panels, 1000, 123 + loop));
  });

  it("moves left as the offset grows", () => {
    const before = visiblePanels(panels, 1000, 10).find((p) => p.text === "B")!;
    const after = visiblePanels(panels, 1000, 30).find((p) => p.text === "B")!;
    expect(after.x).toBe(before.x - 20);
  });

  it("returns nothing for an empty panel list", () => {
    expect(visiblePanels([], 1000, 0)).toEqual([]);
  });
});

describe("scrollOffset", () => {
  it("grows with time and wraps around", () => {
    expect(scrollOffset(0, 40, loop)).toBe(0);
    expect(scrollOffset(2, 40, loop)).toBe(80);
    expect(scrollOffset(loop / 40, 40, loop)).toBe(0);
  });

  it("is 0 when there is nothing to scroll", () => {
    expect(scrollOffset(5, 40, 0)).toBe(0);
  });
});

describe("boards content", () => {
  it("uses only our own text on the home page", () => {
    expect(homeBoards().map((p) => p.text)).toContain("SCORDLE");
  });

  it("shows both teams in their own colors with readable text", () => {
    const boards = matchBoards(istanbul2005);
    const milan = boards.find((p) => p.text === "AC MILAN")!;
    const liverpool = boards.find((p) => p.text === "LIVERPOOL")!;
    expect(milan.background).toBe("#fb090b");
    expect(milan.color).toBe("#ffffff");
    expect(liverpool.background).toBe("#c8102e");
    expect(liverpool.color).toBe("#ffffff");
  });
});
