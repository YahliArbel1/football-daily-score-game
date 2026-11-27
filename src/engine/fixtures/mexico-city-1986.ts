// 1986 FIFA World Cup quarter-final: Argentina 2–1 England. Maradona's
// "Hand of God" goal and, four minutes later, his solo "Goal of the Century".
//
// Checked against Wikipedia "Argentina v England (1986 FIFA World Cup)" and
// thesoccerworldcups.com: both agree on every starter and shirt number.
// Uncertain:
// - Minutes: Maradona's second goal is 55' (Wikipedia, ESPN) or 54'
//   (thesoccerworldcups.com); Lineker's is 81' (Wikipedia, ESPN) or 80'
//   (thesoccerworldcups.com). The majority is used.
// - Bench: the five substitutes come from Wikipedia only;
//   thesoccerworldcups.com lists the whole 22-man squad without saying who was
//   on the bench.
// - Assists: Barnes's cross for Lineker is in Wikipedia's prose only. Neither
//   source names a passer for Maradona's goals.

import type { Match } from "../types";

export const mexicoCity1986: Match = {
  id: "1986-06-22-wc-qf-arg-eng",
  pool: "daily",
  competitionId: "wc",
  competition: "FIFA World Cup — Quarter-final",
  date: "1986-06-22",
  venue: "Estadio Azteca, Mexico City",
  homeTeam: {
    id: "arg",
    name: "Argentina",
    colors: { primary: "#75aadb", secondary: "#ffffff" },
    players: [
      { id: "pumpido", name: "Nery Pumpido", number: 18 },
      { id: "brown", name: "José Luis Brown", number: 5 },
      { id: "cuciuffo", name: "José Luis Cuciuffo", number: 9 },
      { id: "ruggeri", name: "Oscar Ruggeri", number: 19 },
      { id: "giusti", name: "Ricardo Giusti", number: 14 },
      { id: "olarticoechea", name: "Julio Olarticoechea", number: 16 },
      { id: "batista", name: "Sergio Batista", number: 2 },
      { id: "enrique", name: "Héctor Enrique", number: 12 },
      { id: "burruchaga", name: "Jorge Burruchaga", number: 7 },
      { id: "maradona", name: "Diego Maradona", number: 10 },
      { id: "valdano", name: "Jorge Valdano", number: 11 },
      { id: "islas", name: "Luis Islas", number: 15, sub: true },
      { id: "clausen", name: "Néstor Clausen", number: 8, sub: true },
      { id: "pasculli", name: "Pedro Pasculli", number: 17, sub: true },
      { id: "tapia", name: "Carlos Daniel Tapia", number: 20, sub: true },
      { id: "trobbiani", name: "Marcelo Trobbiani", number: 21, sub: true },
    ],
  },
  awayTeam: {
    id: "eng",
    name: "England",
    colors: { primary: "#ffffff", secondary: "#ce1124" },
    players: [
      { id: "shilton", name: "Peter Shilton", number: 1 },
      { id: "gary-m-stevens", name: "Gary M. Stevens", number: 2 },
      { id: "fenwick", name: "Terry Fenwick", number: 14 },
      { id: "butcher", name: "Terry Butcher", number: 6 },
      { id: "sansom", name: "Kenny Sansom", number: 3 },
      { id: "steven", name: "Trevor Steven", number: 17 },
      { id: "hoddle", name: "Glenn Hoddle", number: 4 },
      { id: "reid", name: "Peter Reid", number: 16 },
      { id: "hodge", name: "Steve Hodge", number: 18 },
      { id: "beardsley", name: "Peter Beardsley", number: 20 },
      { id: "lineker", name: "Gary Lineker", number: 10 },
      { id: "woods", name: "Chris Woods", number: 13, sub: true },
      { id: "wilkins", name: "Ray Wilkins", number: 8, sub: true },
      { id: "waddle", name: "Chris Waddle", number: 11, sub: true },
      { id: "gary-a-stevens", name: "Gary A. Stevens", number: 15, sub: true },
      { id: "barnes", name: "John Barnes", number: 19, sub: true },
    ],
  },
  finalScore: { home: 2, away: 1 },
  events: [
    // The "Hand of God": Maradona punched the ball over Shilton's head.
    { type: "goal", team: "home", minute: 51, extra: 0, scorer: "maradona", assist: null, ownGoal: false },
    // Run from his own half past Beardsley, Reid, Butcher and Fenwick, then
    // past Shilton into the empty net.
    { type: "goal", team: "home", minute: 55, extra: 0, scorer: "maradona", assist: null, ownGoal: false },
    // From a Barnes cross.
    { type: "goal", team: "away", minute: 81, extra: 0, scorer: "lineker", assist: "barnes", ownGoal: false },
  ],
};
