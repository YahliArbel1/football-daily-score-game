import { describe, expect, it } from "vitest";
import { istanbul2005, istanbul2005Guess } from "../engine/fixtures/istanbul-2005";
import { buildResults, cardsByEvent } from "./results";
import { cuesBetween, goalCues, loadMuted, MUTED_KEY, pointsCues, saveMuted } from "./sound";
import type { StorageLike } from "./savedGuess";
import type { TimelineFrame } from "./timeline";

// Istanbul with the SPEC 6.3 guess, in time order:
// 1' Maldini (missed), 39' Crespo (hit, scorer only), 44' Crespo (full house),
// 54' Gerrard (full house), 56' Šmicer (missed), 60' Alonso (all wrong).
const cards = cardsByEvent(istanbul2005, buildResults(istanbul2005, istanbul2005Guess));

const frame = (shown: number, finished = false): TimelineFrame => ({
  clock: "0'",
  progress: 0,
  score: { home: 0, away: 0 },
  shown,
  current: null,
  finished,
});

describe("cuesBetween (whistles)", () => {
  it("blows the kick-off whistle on the first frame", () => {
    expect(cuesBetween(null, frame(0))).toEqual(["kickoff"]);
  });

  it("plays nothing while the clock runs, goals included (they sound in the scene)", () => {
    expect(cuesBetween(frame(0), frame(0))).toEqual([]);
    expect(cuesBetween(frame(1), frame(3))).toEqual([]);
  });

  it("blows the final whistle once, at full time", () => {
    expect(cuesBetween(frame(6), frame(6, true))).toEqual(["final-whistle"]);
    expect(cuesBetween(frame(6, true), frame(6, true))).toEqual([]);
  });
});

describe("goalCues (when the ball hits the net)", () => {
  it("is the goal sound only: your points come later, with the card", () => {
    expect(goalCues()).toEqual(["goal"]);
  });
});

describe("pointsCues (when the goal card shows your points)", () => {
  it("is silent for a goal you missed", () => {
    expect(pointsCues(cards[0]!)).toEqual([]); // Maldini
  });

  it("dings for a goal you hit", () => {
    expect(pointsCues(cards[1]!)).toEqual(["hit"]); // Crespo 39'
  });

  it("plays the full-house tune instead of the ding", () => {
    expect(pointsCues(cards[2]!)).toEqual(["full-house"]); // Crespo 44'
  });

  it("is silent for a goal you got all wrong", () => {
    expect(pointsCues(cards[5]!)).toEqual([]); // Alonso
  });
});

describe("loadMuted / saveMuted", () => {
  const fakeStorage = (): StorageLike & { data: Map<string, string> } => {
    const data = new Map<string, string>();
    return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
  };

  it("has sounds on by default", () => {
    expect(loadMuted(fakeStorage())).toBe(false);
    expect(loadMuted(null)).toBe(false);
  });

  it("remembers muting and unmuting", () => {
    const storage = fakeStorage();
    saveMuted(storage, true);
    expect(storage.data.get(MUTED_KEY)).toBe("1");
    expect(loadMuted(storage)).toBe(true);
    saveMuted(storage, false);
    expect(loadMuted(storage)).toBe(false);
  });

  it("keeps working when the browser blocks storage", () => {
    const blocked: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadMuted(blocked)).toBe(false);
    expect(() => saveMuted(blocked, true)).not.toThrow();
  });
});
