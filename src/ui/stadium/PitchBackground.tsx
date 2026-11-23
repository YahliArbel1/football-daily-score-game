// Draws the pitch under the stand: an evenly floodlit playing area, mowing
// stripes and smooth pitch markings in perspective, at full screen resolution.
// It doesn't move, so it is only redrawn when the window is resized.
// Geometry lives in pitch.ts; the floodlights themselves are in StadiumBackground.

import { useEffect, useRef } from "react";
import {
  mowingStripes,
  PITCH_LENGTH,
  PITCH_WIDTH,
  pitchMarkings,
  project,
  TOUCHLINE_GAP,
  type PitchView,
  type Point,
} from "./pitch";
import { standHeight } from "./StadiumBackground";

function tracePolygon(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
}

export function PitchBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = () => {
      // Full resolution, including high-density (retina) screens.
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const stand = standHeight(h);
      const view: PitchView = { width: w, height: h, farY: stand + TOUCHLINE_GAP };

      // Unlit grass around the pitch (the run-off area)
      ctx.fillStyle = "#0c1f16";
      ctx.fillRect(0, 0, w, h);

      // The playing area, evenly lit by the floodlights: brighter, more vivid
      // green, with only a gentle falloff towards the viewer.
      const lit = ctx.createLinearGradient(0, view.farY, 0, h);
      lit.addColorStop(0, "#1c4d31");
      lit.addColorStop(1, "#143a25");
      ctx.fillStyle = lit;
      tracePolygon(ctx, [
        project(-PITCH_LENGTH / 2, 0, view),
        project(PITCH_LENGTH / 2, 0, view),
        project(PITCH_LENGTH / 2, PITCH_WIDTH, view),
        project(-PITCH_LENGTH / 2, PITCH_WIDTH, view),
      ]);
      ctx.fill();

      // Mowing stripes (they stand out more under floodlights)
      ctx.fillStyle = "rgba(190, 255, 205, 0.06)";
      for (const stripe of mowingStripes(view)) {
        tracePolygon(ctx, stripe);
        ctx.fill();
      }

      // Markings: smooth 2px lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      for (const line of pitchMarkings(view)) {
        tracePolygon(ctx, line);
        ctx.stroke();
      }

      // Shadow of the ad boards on the grass, and a darker bottom edge
      const shadow = ctx.createLinearGradient(0, stand, 0, stand + 24);
      shadow.addColorStop(0, "rgba(0, 0, 0, 0.35)");
      shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadow;
      ctx.fillRect(0, stand, w, 24);

      const vignette = ctx.createLinearGradient(0, h * 0.7, 0, h);
      vignette.addColorStop(0, "rgba(8, 21, 15, 0)");
      vignette.addColorStop(1, "rgba(8, 21, 15, 0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return <canvas ref={canvasRef} className="pitch" aria-hidden="true" />;
}
