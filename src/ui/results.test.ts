import { describe, expect, it } from "vitest";
import { istanbul2005, istanbul2005Guess } from "../engine/fixtures/istanbul-2005";
import { OWN_GOAL, type Guess, type Match } from "../engine/types";
import { buildResults, minuteLabel, playerName } from "./results";

describe("minuteLabel", () => {
  it("formats normal minutes and stoppage time", () => {
    expect(minuteLabel({ minute: 44, extra: 0 })).toBe("44'");
    expect(minuteLabel({ minute: 45, extra: 2 })).toBe("45+2'");
    expect(minuteLabel({ minute: 90, extra: 3 })).toBe("90+3'");
  });
});

describe("playerName", () => {
  it("finds players from both teams", () => {
    expect(playerName(istanbul2005, "kaka")).toBe("Kaká");
    expect(playerName(istanbul2005, "smicer")).toBe("Vladimír Šmicer");
  });

  it("handles own goals, empty and unknown ids", () => {
    expect(playerName(istanbul2005, OWN_GOAL)).toBe("Own goal");
    expect(playerName(istanbul2005, null)).toBeNull();
    expect(playerName(istanbul2005, "nobody")).toBe("nobody");
  });
});

describe("buildResults: the SPEC 6.3 example", () => {
  const view = buildResults(istanbul2005, istanbul2005Guess);
  const [milan, liverpool] = view.teams;

  it("totals 19 points, split by category", () => {
    expect(view.total).toBe(19);
    expect(view.summary).toEqual({ result: 2, scorers: 9, assists: 4, minutes: 4 });
  });

  it("gives +2 for the right outcome (draw), not the exact score", () => {
    expect(view.result).toEqual({ kind: "outcome", points: 2 });
    expect(view.resultLabel).toBe("Right outcome · draw");
  });

  it("splits the goals by team, with counts and points per team", () => {
    expect(milan).toMatchObject({ side: "home", name: "AC Milan", realGoals: 3, guessedGoals: 2, points: 10 });
    expect(liverpool).toMatchObject({ side: "away", name: "Liverpool", realGoals: 3, guessedGoals: 2, points: 7 });
    expect(milan.cards.map((c) => c.minute)).toEqual(["1'", "39'", "44'"]);
    expect(liverpool.cards.map((c) => c.minute)).toEqual(["54'", "56'", "60'"]);
  });

  it("shows Crespo 44' field by field: all three right", () => {
    expect(milan.cards[2]).toEqual({
      minute: "44'",
      ownGoal: false,
      guessed: true,
      points: 7,
      badge: "full-house",
      scorer: { real: "Hernán Crespo", guess: "Hernán Crespo", points: 3, status: "hit" },
      assist: { real: "Kaká", guess: "Kaká", points: 2, status: "hit" },
      minuteField: { real: "44'", guess: "43'", points: 2, status: "hit" },
    });
  });

  it("shows Crespo 39': scorer right, assist and minute left empty", () => {
    const card = milan.cards[1]!;
    expect(card.points).toBe(3);
    expect(card.assist).toEqual({ real: "Andriy Shevchenko", guess: null, points: 0, status: "miss" });
    expect(card.minuteField).toEqual({ real: "39'", guess: null, points: 0, status: "miss" });
  });

  it("marks real goals you didn't guess", () => {
    expect(milan.cards[0]).toMatchObject({ guessed: false, points: 0 });
    expect(milan.cards[0]!.scorer).toEqual({ real: "Paolo Maldini", guess: null, points: 0, status: "miss" });
  });

  it("treats a missing real assist as nothing to guess", () => {
    const alonso = liverpool.cards[2]!;
    expect(alonso.assist).toEqual({ real: null, guess: null, points: 0, status: "none" });
  });

  it("marks a full house only where scorer, assist and minute were all right", () => {
    // Maldini (not guessed), Crespo 39' (scorer only), Crespo 44' (all three)
    expect(milan.cards.map((c) => c.badge)).toEqual([null, null, "full-house"]);
    // Gerrard (all three), Smicer and Alonso (not guessed)
    expect(liverpool.cards.map((c) => c.badge)).toEqual(["full-house", null, null]);
  });

  it("lists Baroš under Liverpool as the guess that didn't match", () => {
    expect(liverpool.missed).toEqual([{ scorerName: "Milan Baroš", minute: "60'" }]);
    expect(milan.missed).toEqual([]);
  });
});

describe("buildResults: other cases", () => {
  const guess = (score: Guess["score"], goals: Guess["goals"] = []): Guess => ({
    matchId: istanbul2005.id,
    score,
    goals,
  });

  it("labels an exact score and a wrong result", () => {
    expect(buildResults(istanbul2005, guess({ home: 3, away: 3 })).resultLabel).toBe("Exact score!");
    expect(buildResults(istanbul2005, guess({ home: 1, away: 0 })).resultLabel).toBe("Wrong result");
  });

  it("names the winning team in the outcome label", () => {
    const match: Match = { ...istanbul2005, finalScore: { home: 1, away: 0 }, events: [istanbul2005.events[0]!] };
    expect(buildResults(match, guess({ home: 2, away: 0 })).resultLabel).toBe("Right outcome · AC Milan win");
  });

  it("lists an empty scorer guess as unmatched with no name", () => {
    const view = buildResults(
      istanbul2005,
      guess({ home: 1, away: 0 }, [{ team: "home", scorer: null, assist: null, minute: null }]),
    );
    expect(view.teams[0].missed).toEqual([{ scorerName: null, minute: null }]);
  });

  it("counts a goal with no real assist as a full house on scorer + minute", () => {
    // Alonso 60', no assist.
    const view = buildResults(
      istanbul2005,
      guess({ home: 0, away: 1 }, [{ team: "away", scorer: "alonso", assist: null, minute: "61" }]),
    );
    expect(view.teams[1].cards[2]).toMatchObject({ points: 5, badge: "full-house" });
  });

  it("is only a pair if you guessed an assist on a goal that had none", () => {
    // Scorer and minute right, assist wrong: two of three.
    const view = buildResults(
      istanbul2005,
      guess({ home: 0, away: 1 }, [{ team: "away", scorer: "alonso", assist: "gerrard", minute: "60" }]),
    );
    expect(view.teams[1].cards[2]).toMatchObject({ points: 5, badge: "pair" });
  });

  it("gives a pair for scorer + assist with a wrong minute", () => {
    // Maldini 1', assist Pirlo; guessed minute 30.
    const view = buildResults(
      istanbul2005,
      guess({ home: 1, away: 0 }, [{ team: "home", scorer: "maldini", assist: "pirlo", minute: "30" }]),
    );
    expect(view.teams[0].cards[0]).toMatchObject({ points: 5, badge: "pair" });
  });

  it("gives a pair for scorer + minute with no assist guessed", () => {
    // Smicer 56', assist Hamann; guessed no assist, minute 57.
    const view = buildResults(
      istanbul2005,
      guess({ home: 0, away: 1 }, [{ team: "away", scorer: "smicer", assist: null, minute: "57" }]),
    );
    expect(view.teams[1].cards[1]).toMatchObject({ points: 5, badge: "pair" });
  });

  it("gives no badge for the scorer alone", () => {
    const view = buildResults(
      istanbul2005,
      guess({ home: 0, away: 1 }, [{ team: "away", scorer: "smicer", assist: null, minute: null }]),
    );
    expect(view.teams[1].cards[1]).toMatchObject({ points: 3, badge: null });
  });

  it("marks a wrong assist as a miss and shows what you guessed", () => {
    const view = buildResults(
      istanbul2005,
      guess({ home: 1, away: 0 }, [{ team: "home", scorer: "maldini", assist: "kaka", minute: "1" }]),
    );
    const card = view.teams[0].cards[0]!;
    expect(card.assist).toEqual({ real: "Andrea Pirlo", guess: "Kaká", points: 0, status: "miss" });
    expect(card.minuteField).toEqual({ real: "1'", guess: "1'", points: 2, status: "hit" });
  });

  it("shows a real own goal with the scorer's name and no assist to guess", () => {
    const match: Match = {
      ...istanbul2005,
      finalScore: { home: 1, away: 0 },
      events: [{ type: "goal", team: "home", minute: 45, extra: 2, scorer: "riise", assist: null, ownGoal: true }],
    };
    const view = buildResults(
      match,
      guess({ home: 1, away: 0 }, [{ team: "home", scorer: OWN_GOAL, assist: null, minute: "45 + 1" }]),
    );
    const card = view.teams[0].cards[0]!;
    // Own goal: no assist to guess, so scorer + minute is a full house.
    expect(card).toMatchObject({ minute: "45+2'", ownGoal: true, guessed: true, points: 5, badge: "full-house" });
    expect(card.scorer).toEqual({ real: "John Arne Riise", guess: "Own goal", points: 3, status: "hit" });
    expect(card.assist.status).toBe("none");
    expect(card.minuteField.guess).toBe("45+1'");
  });
});
