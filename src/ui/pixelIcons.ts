// Small pixel-art symbols (▸ ◂ ● ★ ◆ ✗) drawn by us. The pixel font (Press
// Start 2P) has no such characters, so the browser used to fill them in from
// another font, as a tiny dot or a mismatched shape. Each icon is a 7x7 grid:
// "X" is a filled square, "." is empty. PixelIcon.tsx draws them as SVG.

export type PixelIconName = "play" | "back" | "dot" | "star" | "diamond" | "cross";

export const ICON_SIZE = 7;

export const PIXEL_ICONS: Record<PixelIconName, string[]> = {
  play: [
    ".X.....",
    ".XX....",
    ".XXX...",
    ".XXXX..",
    ".XXX...",
    ".XX....",
    ".X.....",
  ],
  back: [
    ".....X.",
    "....XX.",
    "...XXX.",
    "..XXXX.",
    "...XXX.",
    "....XX.",
    ".....X.",
  ],
  dot: [
    ".......",
    "..XXX..",
    ".XXXXX.",
    ".XXXXX.",
    ".XXXXX.",
    "..XXX..",
    ".......",
  ],
  star: [
    "...X...",
    "...X...",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    ".XX.XX.",
    ".X...X.",
  ],
  diamond: [
    "...X...",
    "..XXX..",
    ".XXXXX.",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    "...X...",
  ],
  cross: [
    "X.....X",
    "XX...XX",
    ".XX.XX.",
    "..XXX..",
    ".XX.XX.",
    "XX...XX",
    "X.....X",
  ],
};

/** An SVG path with one 1x1 square per "X" in the grid. */
export function iconPath(rows: string[]): string {
  const squares: string[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "X") squares.push(`M${x} ${y}h1v1h-1z`);
    });
  });
  return squares.join("");
}
