// Minute parsing and the minute bonus rule (SPEC 5.4).

export type Half = 1 | 2;

export interface ParsedMinute {
  half: Half;
  /** minute + extra, e.g. "45+2" -> 47 */
  total: number;
}

/** How far (in minutes) a guess may be from the real minute and still earn the bonus. */
export const MINUTE_TOLERANCE = 2;

// "43", "45+2", and also "45 + 2" (spaces around "+" are allowed).
const MINUTE_PATTERN = /^(\d+)(?:\s*\+\s*(\d+))?$/;

function halfOf(minute: number): Half {
  return minute <= 45 ? 1 : 2;
}

/**
 * Parses a user's minute input. Returns null for empty or invalid input
 * (e.g. "abc", "0", "95", "30+2", "45+", "45+0") instead of throwing,
 * so a bad minute only loses the minute bonus (SPEC 5.4).
 */
export function parseMinute(input: string | null): ParsedMinute | null {
  if (input === null) return null;

  const match = MINUTE_PATTERN.exec(input.trim());
  if (!match) return null;

  const [, baseText, extraText] = match;
  const minute = Number(baseText);

  if (extraText === undefined) {
    if (minute < 1 || minute > 90) return null;
    return { half: halfOf(minute), total: minute };
  }

  const extra = Number(extraText);
  if (minute !== 45 && minute !== 90) return null;
  if (extra < 1) return null;
  return { half: halfOf(minute), total: minute + extra };
}

/** Converts a real goal's minute/extra into the same shape as a parsed guess. */
export function eventMinute(event: { minute: number; extra: number }): ParsedMinute {
  return { half: halfOf(event.minute), total: event.minute + event.extra };
}

/**
 * True if the guessed minute is within ±MINUTE_TOLERANCE of the real minute,
 * in the same half. Invalid or empty guesses never earn the bonus.
 */
export function isMinuteBonus(
  guessedMinute: string | null,
  event: { minute: number; extra: number },
): boolean {
  const guessed = parseMinute(guessedMinute);
  if (guessed === null) return false;

  const actual = eventMinute(event);
  if (guessed.half !== actual.half) return false;
  return Math.abs(guessed.total - actual.total) <= MINUTE_TOLERANCE;
}
