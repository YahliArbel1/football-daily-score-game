// Plays one Daily Game round in a real (hidden) browser and saves screenshots
// of the match animation, so it can be checked frame by frame.
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
const shot = async (name) => {
  // CSS animations (fade-in, pop) run on real time, not the fake clock:
  // let them finish so the picture shows the settled frame.
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  ${OUT}/${name}.png`);
};

try {
  // A fresh browser has no saved guess, so the Daily Game starts from the home page.
  await page.clock.install({ time: today });
  await page.goto(url);

  await page.getByRole("button", { name: /Daily Game/ }).click();
  await page.getByRole("button", { name: /Start guessing/ }).click();
  // Guess 1-1, so the results have something to compare.
  await page.getByRole("button", { name: /One goal more for/ }).first().click();
  await page.getByRole("button", { name: /One goal more for/ }).last().click();
  await page.getByRole("button", { name: /Next/ }).click();

  // Stop the clock, then submit: from here time moves only in our steps.
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 1000));
  await page.getByRole("button", { name: /Submit guess/ }).click();

  console.log("Animation:");
  for (let ms = 0; ms <= 30_000; ms += every) {
    if (ms > 0) await page.clock.runFor(every);
    if (await page.locator(".screen.results").count()) break;
    await shot(`anim-${String(ms).padStart(5, "0")}ms`);
  }

  console.log("Results:");
  await shot("results");
} finally {
  await browser.close();
  await server.close();
}
