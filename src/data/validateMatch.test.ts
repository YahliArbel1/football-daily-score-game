import { describe, expect, it } from "vitest";
import { istanbul2005 } from "../engine/fixtures/istanbul-2005";
import type { Match } from "../engine/types";
import { validateMatch, validateMatchList } from "./validateMatch";

/** A deep copy of the Istanbul match with some changes applied. */
function broken(change: (m: Match) => void): Match {
  const copy = structuredClone(istanbul2005);
  change(copy);
  return copy;
}

/** Expects exactly one problem, containing `text`. */
function expectProblem(match: Match, text: string) {
  const problems = validateMatch(match);
  expect(problems).toHaveLength(1);
  expect(problems[0]).toContain(text);
}

describe("validateMatch", () => {
  it("accepts the Istanbul 2005 match", () => {
    expect(validateMatch(istanbul2005)).toEqual([]);
  });

  describe("final score", () => {
    it("rejects more than 9 goals for a team", () => {
      // Keep the goal list consistent so only the limit is reported.
      const m = broken((m) => {
        m.finalScore.home = 10;
        const goal = m.events[0]!;
        m.events = [...Array.from({ length: 10 }, () => ({ ...goal })), ...m.events.slice(3)];
      });
      expectProblem(m, "finalScore.home is 10");
    });

    it("rejects negative and non-whole scores", () => {
      expect(validateMatch(broken((m) => (m.finalScore.away = -1))).join()).toContain(
        "finalScore.away is -1",
      );
      expect(validateMatch(broken((m) => (m.finalScore.away = 2.5))).join()).toContain(
        "finalScore.away is 2.5",
      );
    });

    it("rejects a goal list that does not add up to the score", () => {
      expectProblem(
        broken((m) => m.events.pop()),
        "away has 2 goal events but finalScore.away is 3",
      );
    });
  });

  describe("goal minutes", () => {
    it("rejects minutes outside 1-90", () => {
      expectProblem(
        broken((m) => (m.events[0]!.minute = 0)),
        "minute must be from 1 to 90",
      );
      expectProblem(
        broken((m) => (m.events[5]!.minute = 95)),
        "minute must be from 1 to 90",
      );
    });

    it("allows stoppage time only at 45 or 90", () => {
      expect(validateMatch(broken((m) => (m.events[5]!.minute = 90, m.events[5]!.extra = 3)))).toEqual([]);
      expectProblem(
        broken((m) => (m.events[0]!.extra = 2)),
        "stoppage time is only allowed at minute 45 or 90",
      );
    });

    it("rejects goals out of time order", () => {
      expectProblem(
        broken((m) => (m.events[1]!.minute = 50)),
        "events must be in time order",
      );
    });

    it("orders stoppage time after the minute it belongs to", () => {
      // 45+2 then 45+1 is out of order.
      const m = broken((m) => {
        m.events[1]!.minute = 45;
        m.events[1]!.extra = 2;
        m.events[2]!.minute = 45;
        m.events[2]!.extra = 1;
      });
      expectProblem(m, "events must be in time order");
    });
  });

  describe("players", () => {
    it("rejects a scorer who is not in the team's player list", () => {
      expectProblem(
        broken((m) => (m.events[0]!.scorer = "gerrard")),
        'scorer "gerrard" is not in the AC Milan player list',
      );
    });

    it("expects an own goal's scorer to come from the other team", () => {
      // Home goal, own goal by a Liverpool player: valid.
      const valid = broken((m) => {
        m.events[0]!.ownGoal = true;
        m.events[0]!.scorer = "riise";
        m.events[0]!.assist = null;
      });
      expect(validateMatch(valid)).toEqual([]);

      // Home goal, "own goal" by a Milan player: invalid.
      const invalid = broken((m) => {
        m.events[0]!.ownGoal = true;
        m.events[0]!.assist = null;
      });
      expectProblem(invalid, 'scorer "maldini" is not in the Liverpool player list');
    });

    it("rejects an assist on an own goal", () => {
      const m = broken((m) => {
        m.events[0]!.ownGoal = true;
        m.events[0]!.scorer = "riise";
      });
      expectProblem(m, "an own goal cannot have an assist");
    });

    it("rejects an assist from the other team", () => {
      expectProblem(
        broken((m) => (m.events[0]!.assist = "gerrard")),
        'assist "gerrard" is not in the AC Milan player list',
      );
    });

    it("rejects a scorer assisting their own goal", () => {
      expectProblem(
        broken((m) => (m.events[0]!.assist = "maldini")),
        "the scorer cannot assist their own goal",
      );
    });

    it("rejects duplicate player ids", () => {
      expectProblem(
        broken((m) => m.awayTeam.players.push({ id: "kaka", name: "Someone Else", number: 99 })),
        'player id "kaka" appears more than once',
      );
    });
  });

  describe("competition and colors", () => {
    it("rejects an unknown competitionId", () => {
      expectProblem(
        broken((m) => (m.competitionId = "nope")),
        'competitionId "nope" is not in the competitions list',
      );
    });

    it("rejects colors that are not #rrggbb", () => {
      expectProblem(
        broken((m) => (m.homeTeam.colors.primary = "red")),
        'AC Milan colors.primary "red" must look like #rrggbb',
      );
    });
  });
});

describe("validateMatchList", () => {
  it("accepts a list with unique ids", () => {
    expect(validateMatchList([istanbul2005])).toEqual([]);
  });

  it("rejects duplicate match ids", () => {
    expect(validateMatchList([istanbul2005, istanbul2005])).toEqual([
      'match id "2005-05-25-ucl-final-acm-liv" appears more than once',
    ]);
  });
});
