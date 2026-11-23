// Checks the real game data. If you add a match with a mistake, this fails
// and lists what's wrong.

import { describe, expect, it } from "vitest";
import { matches } from "./matches";
import { validateMatch, validateMatchList } from "./validateMatch";

describe("game data", () => {
  it("has no duplicate match ids", () => {
    expect(validateMatchList(matches)).toEqual([]);
  });

  it.each(matches.map((m) => [m.id, m] as const))("match %s is valid", (_id, match) => {
    expect(validateMatch(match)).toEqual([]);
  });
});
