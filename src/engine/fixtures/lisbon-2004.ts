// UEFA Euro 2004 final: Portugal 0–1 Greece. Greece, huge outsiders, beat
// the hosts in Lisbon.
//
// Checked against Wikipedia "UEFA Euro 2004 final" and ESPN (gameId 151740):
// both agree on both starting XIs, the used substitutes, shirt numbers and
// the goal. The unused substitutes (9 Portugal, 8 Greece) are the same in
// ESPN and UEFA.com's final report ("Greece crowned kings of Europe...").
// Uncertain:
// - Shirt numbers of the unused substitutes: ESPN only (UEFA gives none).
// - Greek bench first names: both sources give surnames or initials only,
//   so first names are the players' usual names.
// - Portugal #4: Wikipedia says Jorge Andrade, ESPN prints "J. Paulo".
// - Basinas's assist (his corner) is in Wikipedia's prose only.

import type { Match } from "../types";

export const lisbon2004: Match = {
  id: "2004-07-04-euro-final-por-gre",
  pool: "daily",
  competitionId: "euro",
  competition: "UEFA European Championship — Final",
  date: "2004-07-04",
  venue: "Estádio da Luz, Lisbon",
  homeTeam: {
    id: "por",
    name: "Portugal",
    colors: { primary: "#da291c", secondary: "#046a38" },
    players: [
      { id: "ricardo", name: "Ricardo", number: 1 },
      { id: "miguel", name: "Miguel", number: 13 },
      { id: "jorge-andrade", name: "Jorge Andrade", number: 4 },
      { id: "ricardo-carvalho", name: "Ricardo Carvalho", number: 16 },
      { id: "nuno-valente", name: "Nuno Valente", number: 14 },
      { id: "maniche", name: "Maniche", number: 18 },
      { id: "costinha", name: "Costinha", number: 6 },
      { id: "ronaldo", name: "Cristiano Ronaldo", number: 17 },
      { id: "deco", name: "Deco", number: 20 },
      { id: "figo", name: "Luís Figo", number: 7 },
      { id: "pauleta", name: "Pauleta", number: 9 },
      { id: "quim", name: "Quim", number: 12, sub: true },
      { id: "moreira", name: "José Moreira", number: 22, sub: true },
      { id: "paulo-ferreira", name: "Paulo Ferreira", number: 2, sub: true },
      { id: "rui-jorge", name: "Rui Jorge", number: 3, sub: true },
      { id: "couto", name: "Fernando Couto", number: 5, sub: true },
      { id: "beto", name: "Beto", number: 15, sub: true },
      { id: "petit", name: "Petit", number: 8, sub: true },
      { id: "rui-costa", name: "Rui Costa", number: 10, sub: true },
      { id: "simao", name: "Simão", number: 11, sub: true },
      { id: "tiago", name: "Tiago", number: 19, sub: true },
      { id: "nuno-gomes", name: "Nuno Gomes", number: 21, sub: true },
      { id: "postiga", name: "Hélder Postiga", number: 23, sub: true },
    ],
  },
  awayTeam: {
    id: "gre",
    name: "Greece",
    colors: { primary: "#0d5eaf", secondary: "#ffffff" },
    players: [
      { id: "nikopolidis", name: "Antonios Nikopolidis", number: 1 },
      { id: "seitaridis", name: "Giourkas Seitaridis", number: 2 },
      { id: "kapsis", name: "Michalis Kapsis", number: 19 },
      { id: "dellas", name: "Traianos Dellas", number: 5 },
      { id: "fyssas", name: "Takis Fyssas", number: 14 },
      { id: "katsouranis", name: "Kostas Katsouranis", number: 21 },
      { id: "zagorakis", name: "Theodoros Zagorakis", number: 7 },
      { id: "basinas", name: "Angelos Basinas", number: 6 },
      { id: "charisteas", name: "Angelos Charisteas", number: 9 },
      { id: "giannakopoulos", name: "Stelios Giannakopoulos", number: 8 },
      { id: "vryzas", name: "Zisis Vryzas", number: 15 },
      { id: "chalkias", name: "Kostas Chalkias", number: 12, sub: true },
      { id: "katergiannakis", name: "Fanis Katergiannakis", number: 13, sub: true },
      { id: "venetidis", name: "Stylianos Venetidis", number: 3, sub: true },
      { id: "dabizas", name: "Nikos Dabizas", number: 4, sub: true },
      { id: "goumas", name: "Giannis Goumas", number: 18, sub: true },
      { id: "georgiadis", name: "Georgios Georgiadis", number: 17, sub: true },
      { id: "kafes", name: "Pantelis Kafes", number: 16, sub: true },
      { id: "tsiartas", name: "Vasilios Tsiartas", number: 10, sub: true },
      { id: "lakis", name: "Vassilis Lakis", number: 23, sub: true },
      { id: "papadopoulos", name: "Dimitrios Papadopoulos", number: 22, sub: true },
    ],
  },
  finalScore: { home: 0, away: 1 },
  events: [
    // Basinas's corner, Charisteas's header past Ricardo.
    { type: "goal", team: "away", minute: 57, extra: 0, scorer: "charisteas", assist: "basinas", ownGoal: false },
  ],
};
