// Draws the night stadium behind every screen, in two layers:
//  1. The crowd: pixel art on a small canvas scaled up (crowd.ts has the logic).
//  2. Floodlights and LED ad boards: a full-resolution canvas on top, so
//     glows, beams and text are smooth and sharp (adBoards.ts has the logic).

import { useEffect, useLayoutEffect, useRef } from "react";
import { PANEL_WIDTH, scrollOffset, visiblePanels, type BoardPanel } from "./adBoards";
import { buildCrowd, fanLift, hash01, rowSizesFor, type CrowdPalette, type Fan } from "./crowd";
import type { Point } from "./pitch";

/** Each crowd-canvas pixel is drawn as a PIXEL x PIXEL block on screen. */
const PIXEL = 3;
/** Height of the LED board strip, in CSS pixels. */
const BOARD_HEIGHT = 26;
const BOARD_SPEED = 28; // CSS pixels per second
const FRAME_MS = 33; // ~30 fps is plenty for this
const CROWD_SEED = 2005;

/**
 * Height of the whole stand, boards included (CSS pixels), for a window height.
 * The pitch starts right under it, and so does the page content.
 */
export function standHeight(windowHeight: number): number {
  return Math.round(Math.min(240, Math.max(150, windowHeight * 0.24)));
}

// ---------- Crowd layer (pixel art) ----------

function drawFan(ctx: CanvasRenderingContext2D, fan: Fan, lift: number) {
  const s = fan.size;
  const bodyH = Math.max(2, Math.round(s * 1.1));
  const headS = Math.max(1, Math.round(s * 0.6));
  const y = fan.y - Math.round(lift);
  const headX = fan.x + Math.floor((s - headS) / 2);
  const headY = y - bodyH - headS;

  ctx.fillStyle = fan.shirt;
  ctx.fillRect(fan.x, y - bodyH, s, bodyH);

  if (s >= 4) {
    // Scarf stripe across the chest
    ctx.fillStyle = fan.accent;
    ctx.fillRect(fan.x, y - bodyH + 1, s, 1);
  }

  ctx.fillStyle = fan.skin;
  ctx.fillRect(headX, headY, headS, headS);

  if (lift > s * 0.5) {
    // Arms up (in scarf color) while jumping or doing the wave
    ctx.fillStyle = fan.accent;
    ctx.fillRect(fan.x - 1, headY - 1, 1, headS + 2);
    ctx.fillRect(fan.x + s, headY - 1, 1, headS + 2);
  }
}

function drawFlashes(ctx: CanvasRenderingContext2D, fans: Fan[], t: number) {
  const slot = Math.floor(t * 8);
  for (let k = 0; k < 3; k++) {
    if (hash01(slot * 17 + k * 3) >= 0.4) continue;
    const fan = fans[Math.floor(hash01(slot * 31 + k) * fans.length)];
    if (!fan) continue;
    const x = fan.x + Math.floor(fan.size / 2);
    const y = fan.y - fan.size * 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(x - 1, y - 1, 3, 3);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, 1, 1);
  }
}

// ---------- Lights and boards layer (full resolution) ----------

const LIGHT = "255, 250, 215"; // warm white, as r, g, b

/** Gentle flicker between ~0.92 and 1, different for each floodlight. */
function flickerAt(t: number, side: number): number {
  return 0.92 + 0.08 * Math.sin(t * 13 + side * 2) * Math.sin(t * 7.3 + side);
}

/**
 * The floodlight tower: faint haze in the air below the lamp (where it
 * shines), a pole down to the roof, and a lamp panel whose bulbs glow tightly. The light it throws on the pitch is
 * the evenly lit grass in PitchBackground.
 */
function drawFloodlight(ctx: CanvasRenderingContext2D, lamp: Point, roofY: number, flicker: number) {
  const { x, y } = lamp;

  ctx.save();
  ctx.globalCompositeOperation = "screen"; // light only brightens, like real light

  // Haze: an oval of faint light in the air under the lamp, towards the pitch.
  ctx.save();
  ctx.translate(x, y + 50);
  ctx.scale(1.4, 1);
  const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
  haze.addColorStop(0, `rgba(${LIGHT}, ${0.07 * flicker})`);
  haze.addColorStop(1, `rgba(${LIGHT}, 0)`);
  ctx.fillStyle = haze;
  ctx.fillRect(-90, -90, 180, 180);
  ctx.restore();

  ctx.restore();

  ctx.fillStyle = "#26332d";
  ctx.fillRect(x - 1.5, y, 3, roofY - y);

  ctx.fillStyle = "#2d3833";
  ctx.beginPath();
  ctx.roundRect(x - 18, y - 10, 36, 18, 3);
  ctx.fill();
  // Bulbs: drawn twice, a wide soft glow then a tight bright one, so the
  // glare follows the shape of the lamp panel instead of a big circle.
  ctx.fillStyle = `rgba(255, 252, 232, ${flicker})`;
  ctx.shadowColor = `rgba(${LIGHT}, ${0.8 * flicker})`;
  for (const blur of [22, 6]) {
    ctx.shadowBlur = blur;
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 2; row++) {
        ctx.fillRect(x - 15 + col * 8, y - 7 + row * 7, 6, 5);
      }
    }
  }
  ctx.shadowBlur = 0;
}

function drawBoards(ctx: CanvasRenderingContext2D, panels: BoardPanel[], w: number, top: number, offset: number) {
  const h = BOARD_HEIGHT;

  for (const panel of visiblePanels(panels, w, offset)) {
    ctx.fillStyle = panel.background;
    ctx.fillRect(panel.x, top, PANEL_WIDTH, h);

    // Shrink the text if a long name doesn't fit the panel.
    let size = 11;
    ctx.font = `${size}px "Press Start 2P", monospace`;
    const maxText = PANEL_WIDTH - 24;
    const measured = ctx.measureText(panel.text).width;
    if (measured > maxText) {
      size = Math.max(6, Math.floor((size * maxText) / measured));
      ctx.font = `${size}px "Press Start 2P", monospace`;
    }
    ctx.fillStyle = panel.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(panel.text, panel.x + PANEL_WIDTH / 2, top + h / 2 + 1);

    // Dark gap between panels
    ctx.fillStyle = "#050a07";
    ctx.fillRect(panel.x, top, 2, h);
  }

  // LED scanlines, a highlight on top and a shadow underneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  for (let y = top + 1; y < top + h; y += 3) ctx.fillRect(0, y, w, 1);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fillRect(0, top, w, 1);
  ctx.fillStyle = "#050a07";
  ctx.fillRect(0, top + h - 2, w, 2);
}

// ---------- Component ----------

interface StadiumBackgroundProps {
  palette: CrowdPalette;
  boards: BoardPanel[];
}

export function StadiumBackground({ palette, boards }: StadiumBackgroundProps) {
  const crowdRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);

  // Tell the CSS how tall the stand is, before the first paint, so the
  // content starts right under the boards.
  useLayoutEffect(() => {
    const setVar = () =>
      document.documentElement.style.setProperty(
        "--stand-height",
        `${standHeight(window.innerHeight)}px`,
      );
    setVar();
    window.addEventListener("resize", setVar);
    return () => window.removeEventListener("resize", setVar);
  }, []);

  useEffect(() => {
    const crowdCanvas = crowdRef.current;
    const fxCanvas = fxRef.current;
    const crowd = crowdCanvas?.getContext("2d");
    const fx = fxCanvas?.getContext("2d");
    if (!crowdCanvas || !fxCanvas || !crowd || !fx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sizes in CSS pixels
    let cssW = 0;
    let stand = 0;
    let crowdCssH = 0;
    let roofY = 0;
    let cssH = 0;
    let lamps: Point[] = [];
    // Crowd canvas sizes in its own (big) pixels
    let cw = 0;
    let ch = 0;
    let standTop = 0;
    let rows: Fan[][] = [];
    let allFans: Fan[] = [];

    const setup = () => {
      cssW = window.innerWidth;
      stand = standHeight(window.innerHeight);
      crowdCssH = stand - BOARD_HEIGHT;

      // Crowd layer: low resolution, scaled up with sharp pixels.
      crowdCanvas.style.height = `${crowdCssH}px`;
      cw = Math.max(1, Math.ceil(cssW / PIXEL));
      ch = Math.max(1, Math.ceil(crowdCssH / PIXEL));
      crowdCanvas.width = cw;
      crowdCanvas.height = ch;
      // Rows fill about 80% of the height, starting from size-3 fans; any
      // leftover goes to the sky, so the front row sits right on the ad boards.
      const rowSizes = rowSizesFor(Math.round(ch * 0.8), 3);
      const rowsHeight = rowSizes.reduce((sum, size) => sum + size * 2, 0);
      standTop = ch - rowsHeight;
      roofY = (standTop - 3) * PIXEL;

      allFans = buildCrowd({ width: cw, standTop, rowSizes }, palette, CROWD_SEED);
      rows = rowSizes.map((_, row) => allFans.filter((f) => f.row === row));

      // Lights layer: the whole screen (beams reach the pitch), at full
      // resolution including high-density (retina) screens.
      cssH = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      fxCanvas.style.height = `${cssH}px`;
      fxCanvas.width = Math.round(cssW * dpr);
      fxCanvas.height = Math.round(cssH * dpr);
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const lampY = Math.max(16, roofY * 0.3);
      lamps = [
        { x: cssW * 0.07, y: lampY },
        { x: cssW * 0.93, y: lampY },
      ];
    };

    const drawCrowd = (t: number) => {
      const sky = crowd.createLinearGradient(0, 0, 0, standTop);
      sky.addColorStop(0, "#030a07");
      sky.addColorStop(1, "#0b1c14");
      crowd.fillStyle = sky;
      crowd.fillRect(0, 0, cw, ch);

      crowd.fillStyle = "#0b1712";
      crowd.fillRect(0, standTop - 2, cw, ch - standTop + 2);
      crowd.fillStyle = "#2a4a3a";
      crowd.fillRect(0, standTop - 3, cw, 1);

      // Back to front; a thin dark layer after each row makes the back rows darker.
      rows.forEach((row) => {
        for (const fan of row) drawFan(crowd, fan, reduceMotion ? 0 : fanLift(fan, t, cw));
        crowd.fillStyle = "rgba(8, 21, 15, 0.1)";
        crowd.fillRect(0, standTop - 3, cw, ch - standTop + 3);
      });

      if (!reduceMotion) drawFlashes(crowd, allFans, t);
    };

    const drawFx = (t: number) => {
      fx.clearRect(0, 0, cssW, cssH);
      const offset = reduceMotion ? 0 : scrollOffset(t, BOARD_SPEED, boards.length * PANEL_WIDTH);
      drawBoards(fx, boards, cssW, crowdCssH, offset);

      lamps.forEach((lamp, side) =>
        drawFloodlight(fx, lamp, roofY, reduceMotion ? 1 : flickerAt(t, side)),
      );
    };

    const draw = (t: number) => {
      drawCrowd(t);
      drawFx(t);
    };

    let raf = 0;
    let last = 0;

    setup();
    draw(0);
    // The board font may still be loading on the first draw.
    document.fonts?.ready.then(() => draw(last / 1000));

    const frame = (ms: number) => {
      if (ms - last >= FRAME_MS) {
        draw(ms / 1000);
        last = ms;
      }
      raf = requestAnimationFrame(frame);
    };
    if (!reduceMotion) raf = requestAnimationFrame(frame);

    const onResize = () => {
      setup();
      draw(last / 1000);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [palette, boards]);

  return (
    <>
      <canvas ref={crowdRef} className="stadium-crowd" aria-hidden="true" />
      <canvas ref={fxRef} className="stadium-fx" aria-hidden="true" />
    </>
  );
}
