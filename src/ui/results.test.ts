import { describe, expect, it } from "vitest";
import { istanbul2005, istanbul2005Guess } from "../engine/fixtures/istanbul-2005";
import { OWN_GOAL, type Guess, type Match } from "../engine/types";
import { buildResults, cardsByEvent, minuteLabel, pairLeftovers, playerName } from "./results";

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

describe("pairLeftovers", () => {
  it("pairs a guess with the goal closest to its minute", () => {
    // Goals at 56' and 60'; a guess at 60' takes the 60' goal (position 1).
    expect(pairLeftovers([56, 60], [60])).toEqual([[0, 1]]);
  });

  it("gives a guess without a minute the earliest goal left", () => {
    expect(pairLeftovers([10, 50, 80], [null, null])).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("takes the earlier goal on a tie", () => {
    expect(pairLeftovers([40, 60], [50])).toEqual([[0, 0]]);
  });

  it("never gives two guesses the same goal", () => {
    expect(pairLeftovers([30, 70], [70, 72])).toEqual([
      [0, 1],
      [1, 0],
    ]);
  });

  it("leaves extra guesses or goals unpaired", () => {
    expect(pairLeftovers([30], [10, 20])).toEqual([[0, 0]]);
    expect(pairLeftovers([10, 20], [])).toEqual([]);
  });
});

describe("cardsByEvent", () => {
  const view = buildResults(istanbul2005, istanbul2005Guess);
  const cards = cardsByEvent(istanbul2005, view);

  it("gives one card per real goal, in time order across both teams", () => {
    expect(cards).toHaveLength(istanbul2005.events.length);
    expect(cards.map((c) => c.minute)).toEqual(istanbul2005.events.map((e) => minuteLabel(e)));
  });

  it("keeps each goal's hits: Crespo 44' is the full house", () => {
    const crespo44 = cards[istanbul2005.events.findIndex((e) => e.minute === 44)]!;
    expect(crespo44.scorer.real).toBe("Hernán Crespo");
    expect(crespo44.badge).toBe("full-house");
    expect(crespo44.points).toBeGreaterThan(0);
  });

  it("is the same card object the results screen shows", () => {
    const [milan] = view.teams;
    expect(cards[0]).toBe(milan.cards[0]);
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
      outcome: "hit",
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

  it("marks real goals you didn't know about as missed", () => {
    // Milan: 2 goals guessed, both matched to Crespo, so nothing is left for Maldini.
    expect(milan.cards[0]).toMatchObject({ outcome: "missed", guessed: false, points: 0 });
    expect(milan.cards[0]!.scorer).toEqual({ real: "Paolo Maldini", guess: null, points: 0, status: "miss" });
    // Liverpool: Šmicer 56' is left without a guess.
    expect(liverpool.cards[1]).toMatchObject({ outcome: "missed", guessed: false });
  });

  it("shows Baroš 60' on Alonso's 60' goal: you knew of a goal there, but got it wrong", () => {
    const alonso = liverpool.cards[2]!;
    expect(alonso).toMatchObject({ outcome: "wrong", guessed: true, points: 0, badge: null });
    expect(alonso.scorer).toEqual({ real: "Xabi Alonso", guess: "Milan Baroš", points: 0, status: "miss" });
    // The minute alone earns nothing without the right scorer (SPEC 5.2).
    expect(alonso.minuteField).toEqual({ real: "60'", guess: "60'", points: 0, status: "miss" });
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

  it("has no guesses left over: Baroš is shown on Alonso's goal", () => {
    expect(liverpool.missed).toEqual([]);
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

  it("shows an empty guess on the team's earliest goal left", () => {
    const view = buildResults(
      istanbul2005,
      guess({ home: 1, away: 0 }, [{ team: "home", scorer: null, assist: null, minute: null }]),
    );
    expect(view.teams[0].cards[0]).toMatchObject({ outcome: "wrong", guessed: true, points: 0 });
    expect(view.teams[0].cards[0]!.scorer.guess).toBeNull();
    expect(view.teams[0].missed).toEqual([]);
  });

  it("lists guesses beyond the real goals as goals that didn't happen", () => {
    // Liverpool scored 3; you guessed 4, all wrong: 3 shown on goals, 1 left over.
    const wrong = { team: "away" as const, scorer: "carragher", assist: null, minute: null };
    const view = buildResults(istanbul2005, guess({ home: 0, away: 4 }, [wrong, wrong, wrong, wrong]));
    expect(view.teams[1].cards.map((c) => c.outcome)).toEqual(["wrong", "wrong", "wrong"]);
    expect(view.teams[1].missed).toEqual([{ scorerName: "Jamie Carragher", minute: null }]);
  });

  it("never changes the points: a wrong goal earns 0", () => {
    const base = buildResults(istanbul2005, istanbul2005Guess);
    expect(base.total).toBe(19);
    expect(base.teams.flatMap((t) => t.cards).filter((c) => c.outcome !== "hit").every((c) => c.points === 0)).toBe(true);
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
