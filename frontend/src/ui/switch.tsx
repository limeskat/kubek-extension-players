import React from "react";
import { cx } from "./cx";

export const Switch: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}> = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className={cx("k-switch", checked && "k-switch-on")}
    onClick={() => onChange(!checked)}
  >
    <span className="k-switch-thumb" />
  </button>
);
