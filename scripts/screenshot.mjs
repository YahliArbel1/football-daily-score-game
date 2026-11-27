// Plays one Daily Game round in a real (hidden) browser and saves screenshots
// of the match animation, so it can be checked frame by frame. It guesses the
// real score and goals in a pattern that shows full houses, pairs and misses.
//
//   npm run screenshots                      today's match, phone size
//   npm run screenshots -- --day 3           Daily Game #4 (Barcelona-PSG)
//   npm run screenshots -- --every 500 --desktop
//
// Options:
//   --day N      which Daily Game to play (0 = the first, see src/engine/daily.ts)
//   --every MS   time between animation screenshots (default 1000)
//   --desktop    a 1280x800 window instead of a phone (390x844)
//   --show       open a visible browser window instead of a hidden one
//
// Images go to screenshots/ (not committed). The browser's clock is fake
// (Playwright's page.clock), so the animation only moves when the script
// says so: every screenshot is taken at an exact moment.

import { mkdir, rm } from "node:fs/promises";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { createServer } from "vite";

const { values } = parseArgs({
  options: {
    day: { type: "string" },
    every: { type: "string", default: "1000" },
    desktop: { type: "boolean", default: false },
    show: { type: "boolean", default: false },
  },
});

const OUT = "screenshots";
const every = Number(values.every);
// DAILY_START in src/engine/daily.ts; noon so the local date is never off by one.
const start = new Date("2026-11-27T12:00:00");
const today = values.day === undefined ? new Date() : new Date(start.getTime() + Number(values.day) * 86_400_000);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// Start the app (the same server as `npm run dev`) on a free port.
const server = await createServer({ server: { port: 0 }, logLevel: "error" });
await server.listen();
const url = server.resolvedUrls?.local[0];

const browser = await chromium.launch({ headless: !values.show });
const page = await browser.newPage({
  viewport: values.desktop ? { width: 1280, height: 800 } : { width: 390, height: 844 },
});
const shot = async (name, fullPage = false) => {
  // CSS animations (fade-in, pop) run on real time, not the fake clock:
  // let them finish so the picture shows the settled frame.
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log(`  ${OUT}/${name}.png`);
};

try {
  // The same match the page will pick, loaded through Vite so the .ts files work.
  const { matches } = await server.ssrLoadModule("/src/data/matches.ts");
  const { getDailyMatch } = await server.ssrLoadModule("/src/engine/daily.ts");
  const match = getDailyMatch(matches, today);
  console.log(`Match: ${match.homeTeam.name} ${match.finalScore.home}-${match.finalScore.away} ${match.awayTeam.name}`);

  // A fresh browser has no saved guess, so the Daily Game starts from the home page.
  await page.clock.install({ time: today });
  await page.goto(url);

  await page.getByRole("button", { name: /Daily Game/ }).click();
  await page.getByRole("button", { name: /Start guessing/ }).click();

  // Guess the real score, except one goal fewer for the away team when it
  // scored, so its last goal is one you "didn't know about"...
  const guessed = {
    home: match.finalScore.home,
    away: Math.max(0, match.finalScore.away - 1),
  };
  for (const [side, team] of [["home", match.homeTeam], ["away", match.awayTeam]]) {
    for (let i = 0; i < guessed[side]; i++) {
      await page.getByRole("button", { name: `One goal more for ${team.name}` }).click();
    }
  }
  await page.getByRole("button", { name: /Next/ }).click();

  // ...and the real goals in a pattern that shows every kind of hit. For each
  // team: goal 1 = scorer + assist + minute (full house), goal 2 = scorer +
  // minute (pair, or full house without an assist), goal 3 = a wrong scorer
  // and minute (you knew of the goal, but got it all wrong).
  const nameOf = (id) => [...match.homeTeam.players, ...match.awayTeam.players].find((p) => p.id === id)?.name;
  const choose = async (picker, id) => {
    await picker.click();
    if (id === null) return;
    await page.locator(".picker-search").fill(nameOf(id));
    await page.locator(".picker-option:not(.clear)").first().click();
  };
  const goalCards = page.locator(".goal-card");
  let card = 0;
  for (const side of ["home", "away"]) {
    const team = side === "home" ? match.homeTeam : match.awayTeam;
    const goals = match.events.filter((e) => e.team === side).slice(0, guessed[side]);
    for (const [i, goal] of goals.entries()) {
      const el = goalCards.nth(card++);
      const pattern = i % 3;
      const scorer = el.locator(".picker-button").first();
      if (pattern === 2) {
        // A player who didn't score, and a minute far from any goal.
        const scorers = new Set(match.events.map((e) => e.scorer));
        const wrong = team.players.find((p) => !scorers.has(p.id));
        await choose(scorer, wrong.id);
        await el.locator(".minute-input").fill(goal.minute > 45 ? "5" : "85");
        continue;
      }
      if (goal.ownGoal) {
        await scorer.click();
        await page.locator(".picker-option.own-goal").click();
      } else {
        await choose(scorer, goal.scorer);
      }
      if (pattern === 0 && goal.assist) await choose(el.locator(".picker-button").nth(1), goal.assist);
      await el.locator(".minute-input").fill(goal.extra ? `${goal.minute}+${goal.extra}` : String(goal.minute));
    }
  }

  // Stop the clock, then submit: from here time moves only in our steps.
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 1000));
  await page.getByRole("button", { name: /Submit guess/ }).click();

  console.log("Animation:");
  for (let ms = 0; ms <= 60_000; ms += every) {
    if (ms > 0) await page.clock.runFor(every);
    if (await page.locator(".screen.results").count()) break;
    await shot(`anim-${String(ms).padStart(5, "0")}ms`);
  }

  console.log("Results:");
  await shot("results", true);

  // "Watch again" must start the animation over from kick-off.
  await page.getByRole("button", { name: /Watch again/ }).click();
  const clock = await page.locator(".anim-clock").textContent();
  console.log(`Watch again: the clock shows ${clock}`);
  await shot("replay-start");
} finally {
  await browser.close();
  await server.close();
}
