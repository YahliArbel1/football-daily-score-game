import { Fragment, useEffect, useRef, useState } from "react";
import { OWN_GOAL, type Player } from "../engine/types";
import { searchPlayers, splitSquad } from "./goalGuesses";

interface PlayerPickerProps {
  /** What the field is for, e.g. "Scorer". */
  label: string;
  /** Text on the button when nothing is chosen, e.g. "Choose scorer". */
  placeholder: string;
  players: Player[];
  /** A player id, OWN_GOAL, or null when nothing is chosen. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Show "Own goal" as the first option. */
  allowOwnGoal?: boolean;
}

/** A button that opens a searchable list of players. */
export function PlayerPicker({
  label,
  placeholder,
  players,
  value,
  onChange,
  allowOwnGoal = false,
}: PlayerPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const choose = (next: string | null) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const chosenName =
    value === OWN_GOAL ? "Own goal" : players.find((p) => p.id === value)?.name ?? null;
  const results = searchPlayers(players, query);

  // With no search: "Starting XI" and "Substitutes" headings. While searching: one flat list.
  const { starters, subs } = splitSquad(players);
  const groups =
    query.trim() || subs.length === 0
      ? [{ title: "", players: results }]
      : [
          { title: "Starting XI", players: starters },
          { title: "Substitutes", players: subs },
        ];

  return (
    <div className="picker">
      <span className="picker-label pixel">{label}</span>
      <button
        type="button"
        className={`picker-button${chosenName ? " chosen" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{chosenName ?? placeholder}</span>
        <span className="picker-arrow" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className="picker-panel" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
          <input
            ref={searchRef}
            className="picker-search"
            type="search"
            placeholder="Search by name or number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`Search ${label.toLowerCase()}`}
          />
          <ul className="picker-list">
            {allowOwnGoal && !query && (
              <li>
                <button type="button" className="picker-option own-goal" onClick={() => choose(OWN_GOAL)}>
                  <span className="picker-number pixel">OG</span>
                  Own goal
                </button>
              </li>
            )}
            {groups.map((group) => (
              <Fragment key={group.title}>
                {group.title && <li className="picker-group pixel">{group.title}</li>}
                {group.players.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`picker-option${p.id === value ? " selected" : ""}`}
                      onClick={() => choose(p.id)}
                    >
                      <span className="picker-number pixel">{p.number}</span>
                      {p.name}
                    </button>
                  </li>
                ))}
              </Fragment>
            ))}
            {results.length === 0 && <li className="picker-empty">No player found</li>}
            {value !== null && (
              <li>
                <button type="button" className="picker-option clear" onClick={() => choose(null)}>
                  Clear choice
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
