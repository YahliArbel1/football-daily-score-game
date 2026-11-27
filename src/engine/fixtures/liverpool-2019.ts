// 2018–19 UEFA Champions League semi-final, second leg: Liverpool 4–0
// Barcelona. Liverpool lost the first leg 3–0 and went through 4–3 on
// aggregate.
//
// Wikipedia has no article on this match: its "2018–19 UEFA Champions League
// knockout phase" page gives only the scorers and minutes. Line-ups come from
// ESPN (gameId 538699) and FotMob (match 3010098), which agree on every
// player and shirt number. Both name players by surname or initial, so first
// names are the players' usual full names.
// Uncertain: all four assists come from FotMob only (ESPN and Wikipedia name
// none).

import type { Match } from "../types";

export const liverpool2019: Match = {
  id: "2019-05-07-ucl-sf-liv-bar",
  pool: "daily",
  competitionId: "ucl",
  competition: "UEFA Champions League — Semi-final, second leg",
  date: "2019-05-07",
  venue: "Anfield, Liverpool",
  homeTeam: {
    id: "liv",
    name: "Liverpool",
    colors: { primary: "#c8102e", secondary: "#ffffff" },
    players: [
      { id: "alisson", name: "Alisson", number: 13 },
      { id: "alexander-arnold", name: "Trent Alexander-Arnold", number: 66 },
      { id: "matip", name: "Joël Matip", number: 32 },
      { id: "van-dijk", name: "Virgil van Dijk", number: 4 },
      { id: "robertson", name: "Andrew Robertson", number: 26 },
      { id: "henderson", name: "Jordan Henderson", number: 14 },
      { id: "fabinho", name: "Fabinho", number: 3 },
      { id: "milner", name: "James Milner", number: 7 },
      { id: "shaqiri", name: "Xherdan Shaqiri", number: 23 },
      { id: "origi", name: "Divock Origi", number: 27 },
      { id: "mane", name: "Sadio Mané", number: 10 },
      { id: "mignolet", name: "Simon Mignolet", number: 22, sub: true },
      { id: "lovren", name: "Dejan Lovren", number: 6, sub: true },
      { id: "gomez", name: "Joe Gomez", number: 12, sub: true },
      { id: "wijnaldum", name: "Georginio Wijnaldum", number: 5, sub: true },
      { id: "sturridge", name: "Daniel Sturridge", number: 15, sub: true },
      { id: "brewster", name: "Rhian Brewster", number: 24, sub: true },
      { id: "woodburn", name: "Ben Woodburn", number: 58, sub: true },
    ],
  },
  awayTeam: {
    id: "bar",
    name: "Barcelona",
    colors: { primary: "#a50044", secondary: "#004d98" },
    players: [
      { id: "ter-stegen", name: "Marc-André ter Stegen", number: 1 },
      { id: "sergi-roberto", name: "Sergi Roberto", number: 20 },
      { id: "pique", name: "Gerard Piqué", number: 3 },
      { id: "lenglet", name: "Clément Lenglet", number: 15 },
      { id: "alba", name: "Jordi Alba", number: 18 },
      { id: "vidal", name: "Arturo Vidal", number: 22 },
      { id: "busquets", name: "Sergio Busquets", number: 5 },
      { id: "rakitic", name: "Ivan Rakitić", number: 4 },
      { id: "messi", name: "Lionel Messi", number: 10 },
      { id: "suarez", name: "Luis Suárez", number: 9 },
      { id: "coutinho", name: "Philippe Coutinho", number: 7 },
      { id: "cillessen", name: "Jasper Cillessen", number: 13, sub: true },
      { id: "semedo", name: "Nélson Semedo", number: 2, sub: true },
      { id: "umtiti", name: "Samuel Umtiti", number: 23, sub: true },
      { id: "vermaelen", name: "Thomas Vermaelen", number: 24, sub: true },
      { id: "arthur", name: "Arthur", number: 8, sub: true },
      { id: "malcom", name: "Malcom", number: 14, sub: true },
      { id: "alena", name: "Carles Aleñá", number: 26, sub: true },
    ],
  },
  finalScore: { home: 4, away: 0 },
  events: [
    { type: "goal", team: "home", minute: 7, extra: 0, scorer: "origi", assist: "henderson", ownGoal: false },
    { type: "goal", team: "home", minute: 54, extra: 0, scorer: "wijnaldum", assist: "alexander-arnold", ownGoal: false },
    { type: "goal", team: "home", minute: 56, extra: 0, scorer: "wijnaldum", assist: "shaqiri", ownGoal: false },
    { type: "goal", team: "home", minute: 79, extra: 0, scorer: "origi", assist: "alexander-arnold", ownGoal: false },
  ],
};
