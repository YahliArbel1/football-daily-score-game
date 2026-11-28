import { describe, expect, it } from "vitest";
import { istanbul2005, istanbul2005Guess } from "../engine/fixtures/istanbul-2005";
import { buildResults, cardsByEvent } from "./results";
import { cuesBetween, loadMuted, MUTED_KEY, saveMuted } from "./sound";
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

describe("cuesBetween", () => {
  it("blows the kick-off whistle on the first frame", () => {
    expect(cuesBetween(null, frame(0), cards)).toEqual(["kickoff"]);
  });

  it("plays nothing while the clock just runs", () => {
    expect(cuesBetween(frame(0), frame(0), cards)).toEqual([]);
    expect(cuesBetween(frame(2), frame(2), cards)).toEqual([]);
  });

  it("roars for a goal you missed, with no ding", () => {
    expect(cuesBetween(frame(0), frame(1), cards)).toEqual(["goal"]); // Maldini
  });

  it("adds a ding for a goal you hit", () => {
    expect(cuesBetween(frame(1), frame(2), cards)).toEqual(["goal", "hit"]); // Crespo 39'
  });

  it("plays the full-house tune instead of the ding", () => {
    expect(cuesBetween(frame(2), frame(3), cards)).toEqual(["goal", "full-house"]); // Crespo 44'
  });

  it("gives no ding for a goal you got all wrong", () => {
    expect(cuesBetween(frame(5), frame(6), cards)).toEqual(["goal"]); // Alonso
  });

  it("plays every goal that appeared since the last frame", () => {
    expect(cuesBetween(frame(1), frame(3), cards)).toEqual(["goal", "hit", "goal", "full-house"]);
  });

  it("blows the final whistle once, at full time", () => {
    expect(cuesBetween(frame(6), frame(6, true), cards)).toEqual(["final-whistle"]);
    expect(cuesBetween(frame(6, true), frame(6, true), cards)).toEqual([]);
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
