// Text for the Daily Game: its label and the countdown to the next one.

import { DAILY_START } from "../engine/daily";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * "#1 · NOV 27" for day 0. Players count from 1; the code counts from 0.
 * The month is a word so no one misreads 11/27 vs 27/11.
 */
export function dailyLabel(day: number, start: string = DAILY_START): string {
  const date = new Date(Date.parse(`${start}T00:00:00Z`) + day * MS_PER_DAY);
  return `#${day + 1} · ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/** 5h 12m 33s → "05:12:33". Negative times show as "00:00:00". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const parts = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60];
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}
