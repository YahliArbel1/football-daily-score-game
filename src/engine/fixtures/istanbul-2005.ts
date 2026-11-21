// The example match and guess from SPEC.md sections 6.1 and 6.2.

import type { Guess, Match } from "../types";

export const istanbul2005: Match = {
  id: "2005-05-25-ucl-final-acm-liv",
  pool: "daily",
  competition: "UEFA Champions League — Final",
  date: "2005-05-25",
  venue: "Atatürk Olympic Stadium, Istanbul",
  homeTeam: {
    id: "acm",
    name: "AC Milan",
    players: [
      { id: "maldini", name: "Paolo Maldini", number: 3 },
      { id: "crespo", name: "Hernán Crespo", number: 11 },
      { id: "kaka", name: "Kaká", number: 22 },
      { id: "pirlo", name: "Andrea Pirlo", number: 21 },
      { id: "shevchenko", name: "Andriy Shevchenko", number: 7 },
    ],
  },
  awayTeam: {
    id: "liv",
    name: "Liverpool",
    players: [
      { id: "gerrard", name: "Steven Gerrard", number: 8 },
      { id: "smicer", name: "Vladimír Šmicer", number: 7 },
      { id: "alonso", name: "Xabi Alonso", number: 14 },
      { id: "riise", name: "John Arne Riise", number: 6 },
      { id: "hamann", name: "Dietmar Hamann", number: 16 },
      { id: "baros", name: "Milan Baroš", number: 5 },
    ],
  },
  finalScore: { home: 3, away: 3 },
  events: [
    { type: "goal", team: "home", minute: 1, extra: 0, scorer: "maldini", assist: "pirlo", ownGoal: false },
    { type: "goal", team: "home", minute: 39, extra: 0, scorer: "crespo", assist: "shevchenko", ownGoal: false },
    { type: "goal", team: "home", minute: 44, extra: 0, scorer: "crespo", assist: "kaka", ownGoal: false },
    { type: "goal", team: "away", minute: 54, extra: 0, scorer: "gerrard", assist: "riise", ownGoal: false },
    { type: "goal", team: "away", minute: 56, extra: 0, scorer: "smicer", assist: "hamann", ownGoal: false },
    { type: "goal", team: "away", minute: 60, extra: 0, scorer: "alonso", assist: null, ownGoal: false },
  ],
};

export const istanbul2005Guess: Guess = {
  matchId: "2005-05-25-ucl-final-acm-liv",
  score: { home: 2, away: 2 },
  goals: [
    { team: "home", scorer: "crespo", assist: "kaka", minute: "43" },
    { team: "home", scorer: "crespo", assist: null, minute: null },
    { team: "away", scorer: "gerrard", assist: "riise", minute: "55" },
    { team: "away", scorer: "baros", assist: null, minute: "60" },
  ],
};
