import { describe, expect, it } from "vitest";
import {
  DEFAULT_COMPETITION_COLORS,
  getCompetitionColors,
  luminance,
  textColorOn,
} from "./colors";

describe("luminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#ffffff")).toBe(1);
  });

  it("accepts upper-case hex", () => {
    expect(luminance("#FFFFFF")).toBe(1);
  });

  it("returns null for invalid input", () => {
    expect(luminance("red")).toBeNull();
    expect(luminance("#fff")).toBeNull();
    expect(luminance("#gggggg")).toBeNull();
    expect(luminance("")).toBeNull();
  });
});

describe("textColorOn", () => {
  it("uses white text on dark and mid-tone kits", () => {
    expect(textColorOn("#c8102e")).toBe("#ffffff"); // Liverpool red
    expect(textColorOn("#fb090b")).toBe("#ffffff"); // Milan red
    expect(textColorOn("#0b1f5c")).toBe("#ffffff"); // Champions League navy
    expect(textColorOn("#000000")).toBe("#ffffff");
  });

  it("uses black text on light kits", () => {
    expect(textColorOn("#ffffff")).toBe("#000000"); // white
    expect(textColorOn("#fde100")).toBe("#000000"); // Dortmund yellow
    expect(textColorOn("#6cabdd")).toBe("#000000"); // Man City sky blue
    expect(textColorOn("#ff8800")).toBe("#000000"); // orange
  });

  it("falls back to white for invalid colors", () => {
    expect(textColorOn("not-a-color")).toBe("#ffffff");
  });
});

describe("getCompetitionColors", () => {
  it("returns the colors of a known competition", () => {
    expect(getCompetitionColors("ucl")).toEqual({ primary: "#0b1f5c", secondary: "#ffffff" });
  });

  it("returns default colors for an unknown competition", () => {
    expect(getCompetitionColors("not-a-competition")).toEqual(DEFAULT_COMPETITION_COLORS);
  });

  it("looks the id up in the list it is given", () => {
    const list = {
      epl: { id: "epl", name: "Premier League", colors: { primary: "#3d195b", secondary: "#00ff85" } },
    };
    expect(getCompetitionColors("epl", list)).toEqual({ primary: "#3d195b", secondary: "#00ff85" });
    expect(getCompetitionColors("ucl", list)).toEqual(DEFAULT_COMPETITION_COLORS);
  });
});
