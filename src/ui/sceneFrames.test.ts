import { describe, expect, it } from "vitest";
import {
  BALL_SPRITES,
  ballLandsAt,
  GOAL,
  KEEPER_DIVE_LEFT,
  KEEPER_DIVE_RIGHT,
  KEEPER_STAND,
  kitFor,
  numberSprite,
  ownGoalSceneAt,
  SCENE_HEIGHT,
  SCENE_MS,
  SCENE_WIDTH,
  SCORER_FRAMES,
  SCORER_WIDTH,
  sceneAt,
  shade,
  shotTarget,
  type SceneFrame,
  type ShotTarget,
  type Sprite,
} from "./sceneFrames";

/** Every row of a sprite has the same width. */
function expectRectangle(sprite: Sprite, name: string) {
  const width = sprite[0]!.length;
  for (const row of sprite) expect(row.length, `${name}: "${row}"`).toBe(width);
}

/** The scene's frames from start to end, every 50 ms. */
function frames(sceneAt: (t: number) => SceneFrame): { t: number; f: SceneFrame }[] {
  const out = [];
  for (let t = 0; t <= SCENE_MS; t += 50) out.push({ t, f: sceneAt(t) });
  return out;
}

const insideGoal = (x: number, y: number) =>
  x >= GOAL.left && x <= GOAL.right && y >= GOAL.top && y <= GOAL.line;

describe("sprites", () => {
  it("are all rectangles", () => {
    for (const [name, sprite] of Object.entries(SCORER_FRAMES)) expectRectangle(sprite, name);
    for (const sprite of [KEEPER_STAND, KEEPER_DIVE_LEFT, KEEPER_DIVE_RIGHT]) expectRectangle(sprite, "keeper");
    for (const [size, spins] of Object.entries(BALL_SPRITES)) {
      for (const sprite of spins) {
        expectRectangle(sprite, `ball ${size}`);
        expect(sprite).toHaveLength(Number(size));
      }
    }
  });

  it("gives every scorer pose the same size, so he doesn't jump between frames", () => {
    for (const sprite of Object.values(SCORER_FRAMES)) {
      expect(sprite).toHaveLength(SCORER_FRAMES.runA.length);
      expect(sprite[0]).toHaveLength(SCORER_WIDTH);
    }
  });

  it("dives to the right as the mirror image of diving to the left", () => {
    expect(KEEPER_DIVE_RIGHT).toEqual(KEEPER_DIVE_LEFT.map((row) => [...row].reverse().join("")));
  });
});

describe("numberSprite", () => {
  it("draws one or two digits, 6 rows high, narrower than his back", () => {
    expect(numberSprite(3)).toHaveLength(6);
    expect(numberSprite(3)[0]).toHaveLength(4);
    expect(numberSprite(27)[0]).toHaveLength(9); // 4 + gap + 4
    expect(numberSprite(27)[0]!.length).toBeLessThan(SCORER_WIDTH);
  });
});

describe("kitFor", () => {
  it("uses the primary for the shirt and the secondary for trim and number", () => {
    // Milan: red and black, easy to read.
    expect(kitFor({ primary: "#fb090b", secondary: "#000000" })).toMatchObject({
      shirt: "#fb090b",
      trim: "#000000",
      number: "#000000",
    });
  });

  it("switches the number to white or black when the secondary is hard to read", () => {
    // Barcelona: blue on maroon.
    const kit = kitFor({ primary: "#a50044", secondary: "#004d98" });
    expect(kit.trim).toBe("#004d98");
    expect(["#ffffff", "#111111", "#000000"]).toContain(kit.number.toLowerCase());
  });

  it("shades the shirt darker for its shadow side", () => {
    expect(shade("#ff0000", 0.25)).toBe("#bf0000");
    expect(kitFor({ primary: "#ff0000", secondary: "#ffffff" }).shirtShadow).toBe("#bf0000");
  });
});

describe("shotTarget", () => {
  it("rotates through three places, the same for the same goal every time", () => {
    expect([0, 1, 2, 3].map(shotTarget)).toEqual(["top-left", "top-right", "low-middle", "top-left"]);
  });
});

describe("sceneAt (a normal goal)", () => {
  for (const target of ["top-left", "top-right", "low-middle"] as ShotTarget[]) {
    const all = frames((t) => sceneAt(t, target));
    const first = all[0]!.f;
    const last = all.at(-1)!.f;

    it(`${target}: runs up, winds up, strikes, follows through, then celebrates, in that order`, () => {
      const order = ["run", "windup", "strike", "follow", "celebrate"];
      const stages = all.map(({ f }) => (["runA", "passA", "runB", "passB"].includes(f.scorer.frame) ? "run" : f.scorer.frame));
      const seen = stages.filter((s, i) => s !== stages[i - 1]);
      expect(seen).toEqual(order);
    });

    it(`${target}: the ball starts at his feet and ends in the goal, getting smaller`, () => {
      expect(first.ball.size).toBe(5);
      expect(insideGoal(last.ball.x, last.ball.y)).toBe(true);
      const sizes = all.map(({ f }) => f.ball.size);
      expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    });

    it(`${target}: the keeper ends up diving the other way`, () => {
      expect(last.keeper.sprite).not.toBe("stand");
      const keeperCenter = last.keeper.x + KEEPER_DIVE_LEFT[0]!.length / 2;
      const goalCenter = (GOAL.left + GOAL.right) / 2;
      if (target === "top-left") expect(keeperCenter).toBeGreaterThan(goalCenter);
      if (target === "top-right") expect(keeperCenter).toBeLessThan(goalCenter);
    });
  }

  it("ripples the net only after the ball lands", () => {
    for (const { t, f } of frames((t) => sceneAt(t, "top-left"))) {
      if (t < ballLandsAt(false)) expect(f.netShift).toBe(0);
    }
    expect(frames((t) => sceneAt(t, "top-left")).some(({ f }) => f.netShift === 1)).toBe(true);
  });

  it("keeps the scorer's shadow on the grass while he jumps", () => {
    // He jumps for 150 ms, lands for 150 ms, and so on, from 1700 ms.
    const jumping = sceneAt(1750, "top-left");
    const grounded = sceneAt(1900, "top-left");
    expect(jumping.scorer.y).toBeLessThan(grounded.scorer.y);
    expect(jumping.shadows.at(-1)).toEqual(grounded.shadows.at(-1));
  });
});

describe("ownGoalSceneAt", () => {
  const all = frames(ownGoalSceneAt);
  const last = all.at(-1)!.f;

  it("runs back, stretches for the cross, then holds his head", () => {
    const stages = all.map(({ f }) => (["runA", "passA", "runB", "passB"].includes(f.scorer.frame) ? "run" : f.scorer.frame));
    expect(stages.filter((s, i) => s !== stages[i - 1])).toEqual(["run", "stretch", "despair"]);
  });

  it("brings the cross in from the right and ends in his own net, left of centre", () => {
    expect(all[0]!.f.ball.x).toBeGreaterThan(SCENE_WIDTH - 10);
    expect(insideGoal(last.ball.x, last.ball.y)).toBe(true);
    expect(last.ball.x).toBeLessThan((GOAL.left + GOAL.right) / 2);
  });

  it("has the keeper dive late, to the left", () => {
    expect(last.keeper.sprite).toBe("dive-left");
    expect(ownGoalSceneAt(900).keeper.sprite).toBe("stand");
  });

  it("lands sooner than a normal goal", () => {
    expect(ballLandsAt(true)).toBeLessThan(ballLandsAt(false));
  });
});

describe("both scenes", () => {
  it("keep the ball on the canvas the whole time", () => {
    const scenes = [...frames(ownGoalSceneAt), ...frames((t) => sceneAt(t, "top-right"))];
    for (const { f } of scenes) {
      expect(f.ball.x).toBeGreaterThanOrEqual(0);
      expect(f.ball.x + f.ball.size).toBeLessThanOrEqual(SCENE_WIDTH);
      expect(f.ball.y).toBeGreaterThanOrEqual(0);
      expect(f.ball.y + f.ball.size).toBeLessThanOrEqual(SCENE_HEIGHT);
    }
  });
});
