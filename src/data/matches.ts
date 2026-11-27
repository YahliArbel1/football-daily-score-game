import { barcelona1999 } from "../engine/fixtures/barcelona-1999";
import { barcelona2017 } from "../engine/fixtures/barcelona-2017";
import { beloHorizonte2014 } from "../engine/fixtures/belo-horizonte-2014";
import { istanbul2005 } from "../engine/fixtures/istanbul-2005";
import { lisbon2004 } from "../engine/fixtures/lisbon-2004";
import { liverpool2019 } from "../engine/fixtures/liverpool-2019";
import { mexicoCity1986 } from "../engine/fixtures/mexico-city-1986";
import type { Match } from "../engine/types";

/**
 * Every match in the game. Each match's `pool` ("daily" or "quick") decides
 * which mode it appears in, so a match is never in both.
 *
 * The Daily Game goes through the daily matches in this order, one per day
 * (src/engine/daily.ts). Add new daily matches ONLY AT THE END: inserting one
 * earlier would change which match every later day gets.
 */
export const matches: Match[] = [
  istanbul2005,
  barcelona1999,
  beloHorizonte2014,
  barcelona2017,
  liverpool2019,
  mexicoCity1986,
  lisbon2004,
];
