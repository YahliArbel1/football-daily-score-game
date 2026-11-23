// Draws the night stadium behind every screen: floodlights and a pixel-art
// crowd. The crowd logic (positions, colors, motion) lives in crowd.ts.

import { useEffect, useRef } from "react";
import { buildCrowd, fanLift, hash01, rowSizesFor, type CrowdPalette, type Fan } from "./crowd";

/** Each canvas pixel is drawn as a PIXEL x PIXEL block on screen. */
const PIXEL = 3;
const FRAME_MS = 33; // ~30 fps is plenty for this
const CROWD_SEED = 2005;

const NIGHT = "8, 21, 15"; // --night as r, g, b

function drawFloodlight(ctx: CanvasRenderingContext2D, x: number, h: number, standTop: number, w: number, t: number, side: number) {
  const lampY = Math.round(h * 0.07);
  const flicker = 0.9 + 0.1 * Math.sin(t * 13 + side * 2) * Math.sin(t * 7.3 + side);

  // Glow
  const glow = ctx.createRadialGradient(x, lampY, 0, x, lampY, h * 0.55);
  glow.addColorStop(0, `rgba(255, 250, 215, ${0.35 * flicker})`);
  glow.addColorStop(1, "rgba(255, 250, 215, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Beam towards the middle of the stand
  const inward = side === 0 ? 1 : -1;
  const beam = ctx.createLinearGradient(x, lampY, x + inward * w * 0.3, h);
  beam.addColorStop(0, `rgba(255, 250, 215, ${0.16 * flicker})`);
  beam.addColorStop(1, "rgba(255, 250, 215, 0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(x - 4, lampY);
  ctx.lineTo(x + 4, lampY);
  ctx.lineTo(x + inward * w * 0.45, h);
  ctx.lineTo(x + inward * w * 0.1, h);
  ctx.closePath();
  ctx.fill();

  // Pole
  ctx.fillStyle = "#1f2a25";
  ctx.fillRect(x - 1, lampY, 2, standTop - lampY);

  // Lamp panel: a 4 x 2 grid of bulbs
  ctx.fillStyle = "#2b3530";
  ctx.fillRect(x - 6, lampY - 4, 13, 7);
  ctx.fillStyle = `rgba(255, 252, 230, ${flicker})`;
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 2; row++) {
      ctx.fillRect(x - 5 + col * 3, lampY - 3 + row * 3, 2, 2);
    }
  }
}

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

interface StadiumBackgroundProps {
  palette: CrowdPalette;
}

export function StadiumBackground({ palette }: StadiumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let standTop = 0;
    let rows: Fan[][] = [];
    let allFans: Fan[] = [];

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.ceil(rect.width / PIXEL));
      h = Math.max(1, Math.ceil(rect.height / PIXEL));
      canvas.width = w;
      canvas.height = h;
      standTop = Math.round(h * 0.3);

      const rowSizes = rowSizesFor(h - standTop);
      allFans = buildCrowd({ width: w, standTop, rowSizes }, palette, CROWD_SEED);
      rows = rowSizes.map((_, row) => allFans.filter((f) => f.row === row));
    };

    const draw = (t: number) => {
      // Night sky
      const sky = ctx.createLinearGradient(0, 0, 0, standTop);
      sky.addColorStop(0, "#030a07");
      sky.addColorStop(1, "#0b1c14");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Stand and roof edge
      ctx.fillStyle = "#0b1712";
      ctx.fillRect(0, standTop - 2, w, h - standTop + 2);
      ctx.fillStyle = "#2a4a3a";
      ctx.fillRect(0, standTop - 3, w, 1);

      // Crowd, back to front. A thin dark layer after each row makes the back rows darker.
      rows.forEach((row) => {
        for (const fan of row) drawFan(ctx, fan, reduceMotion ? 0 : fanLift(fan, t, w));
        ctx.fillStyle = `rgba(${NIGHT}, 0.1)`;
        ctx.fillRect(0, standTop - 3, w, h - standTop + 3);
      });

      if (!reduceMotion) drawFlashes(ctx, allFans, t);

      drawFloodlight(ctx, Math.round(w * 0.07), h, standTop, w, t, 0);
      drawFloodlight(ctx, Math.round(w * 0.93), h, standTop, w, t, 1);

      // Dim the lower rows a little; the CSS mask (.stadium in styles.css)
      // then fades the whole canvas into the pitch.
      const dim = ctx.createLinearGradient(0, h * 0.45, 0, h);
      dim.addColorStop(0, `rgba(${NIGHT}, 0)`);
      dim.addColorStop(1, `rgba(${NIGHT}, 0.6)`);
      ctx.fillStyle = dim;
      ctx.fillRect(0, 0, w, h);
    };

    setup();
    draw(0);

    let raf = 0;
    let last = 0;
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
  }, [palette]);

  return <canvas ref={canvasRef} className="stadium" aria-hidden="true" />;
}
