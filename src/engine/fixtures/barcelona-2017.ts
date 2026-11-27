// 2016–17 UEFA Champions League round of 16, second leg ("La Remontada"):
// Barcelona 6–1 Paris Saint-Germain. Barcelona lost the first leg 4–0 and
// scored three goals from the 88th minute on to go through 6–5 on aggregate.
//
// Checked against Wikipedia "FC Barcelona 6–1 Paris Saint-Germain FC"
// (line-ups, goals, minutes) and ESPN's match page (gameId 469090): both
// agree on every player, shirt number, scorer and minute.
// Uncertain: assists. Neither source labels them. Neymar's assist for Sergi
// Roberto comes from Wikipedia's description of the goal (his cross into the
// box). The other goals have no named passer in either source, so they are
// null: two penalties, a free kick, an own goal, and the goals by Suárez and
// Cavani.

import type { Match } from "../types";

export const barcelona2017: Match = {
  id: "2017-03-08-ucl-r16-bar-psg",
  pool: "daily",
  competitionId: "ucl",
  competition: "UEFA Champions League — Round of 16, second leg",
  date: "2017-03-08",
  venue: "Camp Nou, Barcelona",
  homeTeam: {
    id: "bar",
    name: "Barcelona",
    colors: { primary: "#a50044", secondary: "#004d98" },
    players: [
      { id: "ter-stegen", name: "Marc-André ter Stegen", number: 1 },
      { id: "mascherano", name: "Javier Mascherano", number: 14 },
      { id: "pique", name: "Gerard Piqué", number: 3 },
      { id: "umtiti", name: "Samuel Umtiti", number: 23 },
      { id: "busquets", name: "Sergio Busquets", number: 5 },
      { id: "rakitic", name: "Ivan Rakitić", number: 4 },
      { id: "iniesta", name: "Andrés Iniesta", number: 8 },
      { id: "messi", name: "Lionel Messi", number: 10 },
      { id: "rafinha", name: "Rafinha", number: 12 },
      { id: "suarez", name: "Luis Suárez", number: 9 },
      { id: "neymar", name: "Neymar", number: 11 },
      { id: "cillessen", name: "Jasper Cillessen", number: 13, sub: true },
      { id: "alba", name: "Jordi Alba", number: 18, sub: true },
      { id: "digne", name: "Lucas Digne", number: 19, sub: true },
      { id: "sergi-roberto", name: "Sergi Roberto", number: 20, sub: true },
      { id: "arda-turan", name: "Arda Turan", number: 7, sub: true },
      { id: "andre-gomes", name: "André Gomes", number: 21, sub: true },
      { id: "alcacer", name: "Paco Alcácer", number: 17, sub: true },
    ],
  },
  awayTeam: {
    id: "psg",
    name: "Paris Saint-Germain",
    colors: { primary: "#004170", secondary: "#da291c" },
    players: [
      { id: "trapp", name: "Kevin Trapp", number: 1 },
      { id: "meunier", name: "Thomas Meunier", number: 12 },
      { id: "marquinhos", name: "Marquinhos", number: 5 },
      { id: "thiago-silva", name: "Thiago Silva", number: 2 },
      { id: "kurzawa", name: "Layvin Kurzawa", number: 20 },
      { id: "rabiot", name: "Adrien Rabiot", number: 25 },
      { id: "matuidi", name: "Blaise Matuidi", number: 14 },
      { id: "lucas-moura", name: "Lucas Moura", number: 7 },
      { id: "verratti", name: "Marco Verratti", number: 6 },
      { id: "draxler", name: "Julian Draxler", number: 23 },
      { id: "cavani", name: "Edinson Cavani", number: 9 },
      { id: "areola", name: "Alphonse Areola", number: 16, sub: true },
      { id: "kimpembe", name: "Presnel Kimpembe", number: 3, sub: true },
      { id: "aurier", name: "Serge Aurier", number: 19, sub: true },
      { id: "krychowiak", name: "Grzegorz Krychowiak", number: 4, sub: true },
      { id: "pastore", name: "Javier Pastore", number: 10, sub: true },
      { id: "di-maria", name: "Ángel Di María", number: 11, sub: true },
      { id: "ben-arfa", name: "Hatem Ben Arfa", number: 21, sub: true },
    ],
  },
  finalScore: { home: 6, away: 1 },
  events: [
    // Header, over the line before Meunier could clear it.
    { type: "goal", team: "home", minute: 3, extra: 0, scorer: "suarez", assist: null, ownGoal: false },
    // Kurzawa, trying to block a shot from Iniesta, turned it into his own net.
    { type: "goal", team: "home", minute: 40, extra: 0, scorer: "kurzawa", assist: null, ownGoal: true },
    // Penalty after Meunier fouled Neymar.
    { type: "goal", team: "home", minute: 50, extra: 0, scorer: "messi", assist: null, ownGoal: false },
    { type: "goal", team: "away", minute: 62, extra: 0, scorer: "cavani", assist: null, ownGoal: false },
    // Direct free kick.
    { type: "goal", team: "home", minute: 88, extra: 0, scorer: "neymar", assist: null, ownGoal: false },
    // Penalty after Suárez went down in the box.
    { type: "goal", team: "home", minute: 90, extra: 1, scorer: "neymar", assist: null, ownGoal: false },
    // Neymar's cross into the box, Sergi Roberto's finish in the last seconds.
    { type: "goal", team: "home", minute: 90, extra: 5, scorer: "sergi-roberto", assist: "neymar", ownGoal: false },
  ],
};
