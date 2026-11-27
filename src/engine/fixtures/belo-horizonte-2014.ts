// 2014 FIFA World Cup semi-final: Brazil 1–7 Germany.
// Germany scored four goals in about six minutes of the first half.
//
// Checked against Wikipedia "Brazil v Germany (2014 FIFA World Cup)" (line-ups,
// goals, minutes). Wikipedia doesn't label assists; they come from its
// description of each goal. Oscar's goal is 90' (Wikipedia's prose; one list
// says 89'). Not confirmed: Marcelo as the passer for that goal.
// Thiago Silva (suspended) and Neymar (injured) were not in Brazil's matchday
// squad; Mustafi (injured) was not in Germany's.

import type { Match } from "../types";

export const beloHorizonte2014: Match = {
  id: "2014-07-08-wc-sf-bra-ger",
  pool: "daily",
  competitionId: "wc",
  competition: "FIFA World Cup — Semi-final",
  date: "2014-07-08",
  venue: "Estádio Mineirão, Belo Horizonte",
  homeTeam: {
    id: "bra",
    name: "Brazil",
    colors: { primary: "#ffdc02", secondary: "#009c3b" },
    players: [
      { id: "julio-cesar", name: "Júlio César", number: 12 },
      { id: "maicon", name: "Maicon", number: 23 },
      { id: "david-luiz", name: "David Luiz", number: 4 },
      { id: "dante", name: "Dante", number: 13 },
      { id: "marcelo", name: "Marcelo", number: 6 },
      { id: "fernandinho", name: "Fernandinho", number: 5 },
      { id: "luiz-gustavo", name: "Luiz Gustavo", number: 17 },
      { id: "hulk", name: "Hulk", number: 7 },
      { id: "oscar", name: "Oscar", number: 11 },
      { id: "bernard", name: "Bernard", number: 20 },
      { id: "fred", name: "Fred", number: 9 },
      { id: "jefferson", name: "Jefferson", number: 1, sub: true },
      { id: "victor", name: "Victor", number: 22, sub: true },
      { id: "dani-alves", name: "Dani Alves", number: 2, sub: true },
      { id: "maxwell", name: "Maxwell", number: 14, sub: true },
      { id: "henrique", name: "Henrique", number: 15, sub: true },
      { id: "paulinho", name: "Paulinho", number: 8, sub: true },
      { id: "ramires", name: "Ramires", number: 16, sub: true },
      { id: "hernanes", name: "Hernanes", number: 18, sub: true },
      { id: "willian", name: "Willian", number: 19, sub: true },
      { id: "jo", name: "Jô", number: 21, sub: true },
    ],
  },
  awayTeam: {
    id: "ger",
    name: "Germany",
    colors: { primary: "#ffffff", secondary: "#000000" },
    players: [
      { id: "neuer", name: "Manuel Neuer", number: 1 },
      { id: "lahm", name: "Philipp Lahm", number: 16 },
      { id: "boateng", name: "Jérôme Boateng", number: 20 },
      { id: "hummels", name: "Mats Hummels", number: 5 },
      { id: "howedes", name: "Benedikt Höwedes", number: 4 },
      { id: "schweinsteiger", name: "Bastian Schweinsteiger", number: 7 },
      { id: "khedira", name: "Sami Khedira", number: 6 },
      { id: "muller", name: "Thomas Müller", number: 13 },
      { id: "kroos", name: "Toni Kroos", number: 18 },
      { id: "ozil", name: "Mesut Özil", number: 8 },
      { id: "klose", name: "Miroslav Klose", number: 11 },
      { id: "zieler", name: "Ron-Robert Zieler", number: 12, sub: true },
      { id: "weidenfeller", name: "Roman Weidenfeller", number: 22, sub: true },
      { id: "grosskreutz", name: "Kevin Großkreutz", number: 2, sub: true },
      { id: "ginter", name: "Matthias Ginter", number: 3, sub: true },
      { id: "durm", name: "Erik Durm", number: 15, sub: true },
      { id: "mertesacker", name: "Per Mertesacker", number: 17, sub: true },
      { id: "kramer", name: "Christoph Kramer", number: 23, sub: true },
      { id: "draxler", name: "Julian Draxler", number: 14, sub: true },
      { id: "gotze", name: "Mario Götze", number: 19, sub: true },
      { id: "schurrle", name: "André Schürrle", number: 9, sub: true },
      { id: "podolski", name: "Lukas Podolski", number: 10, sub: true },
    ],
  },
  finalScore: { home: 1, away: 7 },
  events: [
    { type: "goal", team: "away", minute: 11, extra: 0, scorer: "muller", assist: "kroos", ownGoal: false },
    { type: "goal", team: "away", minute: 23, extra: 0, scorer: "klose", assist: "muller", ownGoal: false },
    { type: "goal", team: "away", minute: 24, extra: 0, scorer: "kroos", assist: "lahm", ownGoal: false },
    { type: "goal", team: "away", minute: 26, extra: 0, scorer: "kroos", assist: "khedira", ownGoal: false },
    { type: "goal", team: "away", minute: 29, extra: 0, scorer: "khedira", assist: "ozil", ownGoal: false },
    { type: "goal", team: "away", minute: 69, extra: 0, scorer: "schurrle", assist: "lahm", ownGoal: false },
    { type: "goal", team: "away", minute: 79, extra: 0, scorer: "schurrle", assist: "muller", ownGoal: false },
    { type: "goal", team: "home", minute: 90, extra: 0, scorer: "oscar", assist: "marcelo", ownGoal: false },
  ],
};
