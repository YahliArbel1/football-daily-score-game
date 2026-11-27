// 1999 UEFA Champions League final: Manchester United 2–1 Bayern Munich.
// Both United goals came in stoppage time.
//
// Checked against Wikipedia "1999 UEFA Champions League final" (line-ups,
// goals, minutes). Wikipedia doesn't label assists; they come from its
// description of each goal. Keane and Scholes were suspended, so they are
// not in the matchday squad.

import type { Match } from "../types";

export const barcelona1999: Match = {
  id: "1999-05-26-ucl-final-mun-bay",
  pool: "daily",
  competitionId: "ucl",
  competition: "UEFA Champions League — Final",
  date: "1999-05-26",
  venue: "Camp Nou, Barcelona",
  homeTeam: {
    id: "mun",
    name: "Manchester United",
    colors: { primary: "#da291c", secondary: "#000000" },
    players: [
      { id: "schmeichel", name: "Peter Schmeichel", number: 1 },
      { id: "g-neville", name: "Gary Neville", number: 2 },
      { id: "stam", name: "Jaap Stam", number: 6 },
      { id: "johnsen", name: "Ronny Johnsen", number: 5 },
      { id: "irwin", name: "Denis Irwin", number: 3 },
      { id: "beckham", name: "David Beckham", number: 7 },
      { id: "butt", name: "Nicky Butt", number: 8 },
      { id: "giggs", name: "Ryan Giggs", number: 11 },
      { id: "blomqvist", name: "Jesper Blomqvist", number: 15 },
      { id: "yorke", name: "Dwight Yorke", number: 19 },
      { id: "cole", name: "Andy Cole", number: 9 },
      { id: "van-der-gouw", name: "Raimond van der Gouw", number: 17, sub: true },
      { id: "may", name: "David May", number: 4, sub: true },
      { id: "p-neville", name: "Phil Neville", number: 12, sub: true },
      { id: "brown", name: "Wes Brown", number: 30, sub: true },
      { id: "greening", name: "Jonathan Greening", number: 34, sub: true },
      { id: "sheringham", name: "Teddy Sheringham", number: 10, sub: true },
      { id: "solskjaer", name: "Ole Gunnar Solskjær", number: 20, sub: true },
    ],
  },
  awayTeam: {
    id: "bay",
    name: "Bayern Munich",
    colors: { primary: "#dc052d", secondary: "#ffffff" },
    players: [
      { id: "kahn", name: "Oliver Kahn", number: 1 },
      { id: "babbel", name: "Markus Babbel", number: 2 },
      { id: "matthaus", name: "Lothar Matthäus", number: 10 },
      { id: "kuffour", name: "Samuel Kuffour", number: 4 },
      { id: "linke", name: "Thomas Linke", number: 25 },
      { id: "tarnat", name: "Michael Tarnat", number: 18 },
      { id: "jeremies", name: "Jens Jeremies", number: 16 },
      { id: "effenberg", name: "Stefan Effenberg", number: 11 },
      { id: "basler", name: "Mario Basler", number: 14 },
      { id: "jancker", name: "Carsten Jancker", number: 19 },
      { id: "zickler", name: "Alexander Zickler", number: 21 },
      { id: "dreher", name: "Bernd Dreher", number: 22, sub: true },
      { id: "helmer", name: "Thomas Helmer", number: 5, sub: true },
      { id: "scholl", name: "Mehmet Scholl", number: 7, sub: true },
      { id: "strunz", name: "Thomas Strunz", number: 8, sub: true },
      { id: "fink", name: "Thorsten Fink", number: 17, sub: true },
      { id: "salihamidzic", name: "Hasan Salihamidžić", number: 20, sub: true },
      { id: "daei", name: "Ali Daei", number: 24, sub: true },
    ],
  },
  finalScore: { home: 2, away: 1 },
  events: [
    // Direct free kick.
    { type: "goal", team: "away", minute: 6, extra: 0, scorer: "basler", assist: null, ownGoal: false },
    // Giggs's mishit shot, turned in by Sheringham.
    { type: "goal", team: "home", minute: 90, extra: 1, scorer: "sheringham", assist: "giggs", ownGoal: false },
    // Beckham corner, Sheringham flick-on, Solskjær finish.
    { type: "goal", team: "home", minute: 90, extra: 3, scorer: "solskjaer", assist: "sheringham", ownGoal: false },
  ],
};
