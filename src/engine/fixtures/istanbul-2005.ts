// The example match and guess from SPEC.md sections 6.1 and 6.2.

import type { Guess, Match } from "../types";

export const istanbul2005: Match = {
  id: "2005-05-25-ucl-final-acm-liv",
  pool: "daily",
  competitionId: "ucl",
  competition: "UEFA Champions League — Final",
  date: "2005-05-25",
  venue: "Atatürk Olympic Stadium, Istanbul",
  homeTeam: {
    id: "acm",
    name: "AC Milan",
    colors: { primary: "#fb090b", secondary: "#000000" },
    // Matchday squad. Sources: Wikipedia "2005 UEFA Champions League final",
    // LFChistory and ESPN match pages.
    players: [
      { id: "dida", name: "Dida", number: 1 },
      { id: "cafu", name: "Cafu", number: 2 },
      { id: "stam", name: "Jaap Stam", number: 31 },
      { id: "nesta", name: "Alessandro Nesta", number: 13 },
      { id: "maldini", name: "Paolo Maldini", number: 3 },
      { id: "gattuso", name: "Gennaro Gattuso", number: 8 },
      { id: "pirlo", name: "Andrea Pirlo", number: 21 },
      { id: "seedorf", name: "Clarence Seedorf", number: 20 },
      { id: "kaka", name: "Kaká", number: 22 },
      { id: "shevchenko", name: "Andriy Shevchenko", number: 7 },
      { id: "crespo", name: "Hernán Crespo", number: 11 },
      { id: "abbiati", name: "Christian Abbiati", number: 46, sub: true },
      { id: "kaladze", name: "Kakha Kaladze", number: 4, sub: true },
      { id: "costacurta", name: "Alessandro Costacurta", number: 5, sub: true },
      { id: "rui-costa", name: "Rui Costa", number: 10, sub: true },
      { id: "dhorasoo", name: "Vikash Dhorasoo", number: 24, sub: true },
      { id: "serginho", name: "Serginho", number: 27, sub: true },
      { id: "tomasson", name: "Jon Dahl Tomasson", number: 15, sub: true },
    ],
  },
  awayTeam: {
    id: "liv",
    name: "Liverpool",
    colors: { primary: "#c8102e", secondary: "#ffffff" },
    players: [
      { id: "dudek", name: "Jerzy Dudek", number: 1 },
      { id: "finnan", name: "Steve Finnan", number: 3 },
      { id: "carragher", name: "Jamie Carragher", number: 23 },
      { id: "hyypia", name: "Sami Hyypiä", number: 4 },
      { id: "traore", name: "Djimi Traoré", number: 21 },
      { id: "luis-garcia", name: "Luis García", number: 10 },
      { id: "gerrard", name: "Steven Gerrard", number: 8 },
      { id: "alonso", name: "Xabi Alonso", number: 14 },
      { id: "riise", name: "John Arne Riise", number: 6 },
      { id: "kewell", name: "Harry Kewell", number: 7 },
      { id: "baros", name: "Milan Baroš", number: 5 },
      { id: "carson", name: "Scott Carson", number: 20, sub: true },
      { id: "josemi", name: "Josemi", number: 17, sub: true },
      { id: "hamann", name: "Dietmar Hamann", number: 16, sub: true },
      { id: "nunez", name: "Antonio Núñez", number: 18, sub: true },
      { id: "biscan", name: "Igor Bišćan", number: 25, sub: true },
      { id: "cisse", name: "Djibril Cissé", number: 9, sub: true },
      { id: "smicer", name: "Vladimír Šmicer", number: 11, sub: true },
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
