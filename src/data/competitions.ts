import type { Colors } from "../engine/types";

export interface Competition {
  id: string;
  name: string;
  colors: Colors;
}

/** Competitions that matches can point to with `competitionId`. */
export const competitions: Record<string, Competition> = {
  ucl: {
    id: "ucl",
    name: "UEFA Champions League",
    colors: { primary: "#0b1f5c", secondary: "#ffffff" },
  },
  euro: {
    id: "euro",
    name: "UEFA European Championship",
    colors: { primary: "#143cdb", secondary: "#ffffff" },
  },
  wc: {
    id: "wc",
    name: "FIFA World Cup",
    colors: { primary: "#326295", secondary: "#ffffff" },
  },
};
