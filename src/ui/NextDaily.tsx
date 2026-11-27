import { useEffect, useState } from "react";
import { getDayNumber, timeUntilNextDaily } from "../engine/daily";
import { formatCountdown } from "./dailyText";

/**
 * "Next match in 05:12:33", ticking every second. If the page stays open past
 * midnight UTC, it says a new match is ready (a reload picks it up).
 */
export function NextDaily({ day }: { day: number }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    // Stop the timer when the screen closes.
    return () => clearInterval(timer);
  }, []);

  if (getDayNumber(now) !== day) {
    return <p className="next-daily pixel">New match ready · reload the page</p>;
  }
  return (
    <p className="next-daily pixel">
      Next match in <span className="next-daily-time">{formatCountdown(timeUntilNextDaily(now))}</span>
    </p>
  );
}
