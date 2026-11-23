import { istanbul2005 } from "../engine/fixtures/istanbul-2005";
import type { Match } from "../engine/types";

/**
 * Every match in the game. Each match's `pool` ("daily" or "quick") decides
 * which mode it appears in, so a match is never in both.
 */
export const matches: Match[] = [istanbul2005];
