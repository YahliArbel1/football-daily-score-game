import { describe, expect, it } from "vitest";
import { barcelona1999 } from "../engine/fixtures/barcelona-1999";
import { istanbul2005, istanbul2005Guess } from "../engine/fixtures/istanbul-2005";
import { loadGuess, saveGuess, storageKey, type StorageLike } from "./savedGuess";

/** A fake localStorage that keeps values in a Map. */
function fakeStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** A storage that throws on every call, like a browser with storage blocked. */
const brokenStorage: StorageLike = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

describe("saveGuess / loadGuess", () => {
  it("loads back exactly the guess that was saved", () => {
    const storage = fakeStorage();
    expect(saveGuess(storage, 0, istanbul2005Guess)).toBe(true);
    expect(loadGuess(storage, 0, istanbul2005)).toEqual(istanbul2005Guess);
  });

  it("saves under the day number", () => {
    const storage = fakeStorage();
    saveGuess(storage, 3, istanbul2005Guess);
    expect([...storage.data.keys()]).toEqual([storageKey(3)]);
    expect(storageKey(3)).toBe("scordle:daily:3");
  });

  it("returns null when nothing was saved for that day", () => {
    expect(loadGuess(fakeStorage(), 0, istanbul2005)).toBeNull();
  });

  it("lets the same match be played again on a later day", () => {
    // Istanbul on day 0, then again on day 3 after the list starts over.
    const storage = fakeStorage();
    saveGuess(storage, 0, istanbul2005Guess);
    expect(loadGuess(storage, 3, istanbul2005)).toBeNull();
  });

  it("ignores a saved guess for a different match", () => {
    const storage = fakeStorage();
    saveGuess(storage, 0, istanbul2005Guess);
    expect(loadGuess(storage, 0, barcelona1999)).toBeNull();
  });

  it("ignores broken JSON", () => {
    const storage = fakeStorage();
    storage.setItem(storageKey(0), "{not json");
    expect(loadGuess(storage, 0, istanbul2005)).toBeNull();
  });

  it.each([
    ["not an object", 42],
    ["no score", { matchId: istanbul2005.id, goals: [] }],
    ["score out of range", { ...istanbul2005Guess, score: { home: 10, away: 0 } }],
    ["score not a whole number", { ...istanbul2005Guess, score: { home: 1.5, away: 2 } }],
    ["goals not a list", { ...istanbul2005Guess, goals: "none" }],
    [
      "a goal with an unknown team",
      { ...istanbul2005Guess, goals: [{ team: "middle", scorer: null, assist: null, minute: null }] },
    ],
    [
      "a goal with a number as scorer",
      {
        ...istanbul2005Guess,
        score: { home: 1, away: 0 },
        goals: [{ team: "home", scorer: 7, assist: null, minute: null }],
      },
    ],
    ["goal count not matching the score", { ...istanbul2005Guess, score: { home: 3, away: 2 } }],
  ])("ignores a saved guess with %s", (_name, data) => {
    const storage = fakeStorage();
    storage.setItem(storageKey(0), JSON.stringify(data));
    expect(loadGuess(storage, 0, istanbul2005)).toBeNull();
  });

  it("does not crash when the browser blocks storage", () => {
    expect(saveGuess(brokenStorage, 0, istanbul2005Guess)).toBe(false);
    expect(loadGuess(brokenStorage, 0, istanbul2005)).toBeNull();
  });

  it("does not crash when there is no storage at all", () => {
    expect(saveGuess(null, 0, istanbul2005Guess)).toBe(false);
    expect(loadGuess(null, 0, istanbul2005)).toBeNull();
  });
});
