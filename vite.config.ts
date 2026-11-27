import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from https://yahliarbel1.github.io/scordle/,
  // so every built link must start with /scordle/. Kept on in dev too, so
  // local behaves like the live site.
  base: "/scordle/",
});
