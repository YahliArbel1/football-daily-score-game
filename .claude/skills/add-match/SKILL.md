---
name: add-match
description: Add a real historical football match to Scordle's match data. Researches line-ups, goals, minutes and assists from two sources, writes the match file, runs the data checks, and opens a PR only after the user approves. Use "/add-match <match>" for a given match or "/add-match suggest" for ideas.
argument-hint: "<match, e.g. Liverpool vs Barcelona 2019> | suggest"
disable-model-invocation: true
---

# Add a match to Scordle

You are adding one real match to the game's data. **Wrong data is worse than no
data**: a player who remembers the match will notice. Accuracy beats speed, and
every fact you are not sure of must be reported, never guessed.

The user reviews everything you produce. Keep them in control: ask before
choosing for them, and never commit, push or open a PR without an explicit yes
(see CLAUDE.md).

## Input

`$ARGUMENTS` is either:
- **a match** (e.g. `Liverpool vs Barcelona 2019`): go to step 2.
- **`suggest`** (or empty): go to step 1.

## Step 1: suggest matches (only for `suggest`)

Propose **5** candidates, one line each: teams, score, competition, year, and
why it is memorable. Pick matches that are:
- famous (finals, historic upsets, legendary comebacks), from varied eras and
  competitions;
- **decided in 90 minutes**: skip anything that went to extra time or
  penalties (SPEC 1.1: the game only covers 90 minutes + stoppage time);
- not already in `src/data/matches.ts`.

Then **stop and ask** which one to add. Continue with step 2 for that match only.

## Step 2: check it fits

Before researching in depth:
1. Read `src/data/matches.ts`. If the match is already there, stop and say so.
2. Confirm it was **decided in 90 minutes**. If it went to extra time or
   penalties, stop and explain why (SPEC 1.1). Don't add it.

## Step 3: research (two sources)

Collect, for both teams:
- date, venue (stadium, city), competition and stage;
- **starting XI and every substitute on the bench** (used and unused), with
  shirt numbers. Not only the players who came on;
- every goal: scorer, minute (stoppage time as `45+2` / `90+3`), assist, own goal.

Sources:
- **Source 1: English Wikipedia's article on the match** (finals and famous
  matches have one), or the competition season article.
- **Source 2: one independent site** with full line-ups, e.g. worldfootball.net,
  11v11.com, UEFA.com / FIFA.com match centre, transfermarkt.

Cross-check every fact in both. When they disagree, or only one source has it,
mark it **uncertain** and note both versions. Assists are often missing for old
matches: if no source names one, use `null` and list it as uncertain.

**Be efficient** (the user is on Claude Pro with usage limits): ask the fetch
tool focused questions ("the line-ups with shirt numbers and the goals with
minutes"), not whole pages. Use the second source to confirm, not to re-read
everything.

## Step 4: write the data

Use `src/engine/fixtures/barcelona-1999.ts` as the template: same structure,
same comments style. Rules (all checked by `src/data/validateMatch.ts`):

- **File**: `src/engine/fixtures/<city>-<year>.ts`, exporting
  `const <cityYear>: Match` (e.g. `madrid2019`). Start with a comment naming
  the sources you used and any uncertain facts.
- **id**: `<date>-<competition>-<stage>-<home id>-<away id>`, lowercase with
  dashes, e.g. `2014-07-08-wc-sf-bra-ger`.
- **Home/away**: as listed first/second in the official line-ups.
- **Team ids**: short lowercase codes (`liv`, `bar`, `ger`).
- **Player ids**: lowercase ASCII, no accents (`kaka`, `solskjaer`); add a first
  initial when needed (`g-neville`, `p-neville`). Ids are unique across both
  teams. `name` keeps the real spelling with accents.
- **Starters**: exactly 11 per team, no `sub` field. Bench players have `sub: true`.
- **Goals** (`events`): in time order. `minute` 1–90; stoppage time only as
  `minute: 45` or `90` with `extra: N`. `team` is the side the goal **counts
  for**: for an own goal that is the opponent of the scorer, with `ownGoal: true`
  and `assist: null`.
- **finalScore**: the score after 90 minutes; must equal the goals listed.
- **Colors**: the club's/nation's primary and secondary colors as `#rrggbb`.
- **competitionId**: a key in `src/data/competitions.ts`. If the competition is
  new, add it there (id, name, colors).
- **pool**: `"daily"` unless the user says Quick Play.
- **Add the match to the END of the list** in `src/data/matches.ts`, never in the
  middle (the daily match is picked by position, SPEC 2.1).

## Step 5: run the checks

```
npx vitest run src/data
npm test
npm run typecheck
```

Fix every problem the checks report, then run them again until all pass. Never
change a test or `validateMatch` to make your data pass.

## Step 6: report and ask

Show the user, briefly:
1. The match summary: teams, score, date, venue.
2. The goals table: minute, scorer, assist, and where each fact came from.
3. **Uncertain facts**: every disagreement or single-source fact, with both
   versions. If there are none, say so explicitly.
4. The files changed.

Then **ask**: "Should I create a branch, commit, push and open a PR?" Stop here
until the user says yes.

## Step 7: branch, commit, PR (only after an explicit yes)

1. From an up-to-date `main`: `git switch main`, `git pull`,
   `git switch -c data/<match id>`.
2. Commit only the match file, `matches.ts` and (if changed) `competitions.ts`.
   **Write the commit message and the PR body to files** and use
   `git commit -F <file>` and `gh pr create --body-file <file>`: in Windows
   PowerShell 5.1, quotes inside inline messages break the command.
3. PR title: `data: add <home> <score> <away> (<competition> <year>)`. The body
   includes the goals table, the sources, and the uncertain facts, so the
   reviewer knows exactly what to check.
4. Give the user the PR link. The CI runs the data checks on the PR again.
