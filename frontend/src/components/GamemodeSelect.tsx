import React from "react";

const MODES = ["Survival", "Creative", "Adventure", "Spectator"];

export const GamemodeSelect: React.FC<{
  value: string;
  onChange: (gamemode: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const current =
    MODES.find((mode) => mode.toLowerCase() === (value || "survival").toLowerCase()) || MODES[0];

  return (
    <select
      className="k-select"
      value={current}
      disabled={disabled}
      aria-label="Game mode"
      onChange={(event) => onChange(event.target.value)}
    >
      {MODES.map((mode) => (
        <option key={mode} value={mode}>
          {mode}
        </option>
      ))}
    </select>
  );
};
