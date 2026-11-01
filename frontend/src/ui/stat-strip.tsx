import React from "react";
import { cx } from "./cx";
import { Plate } from "./plate";
import { type Tone } from "./tone";

export const StatStrip: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-strip", className)}>{children}</div>;

export const Stat: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  onClick?: () => void;
  className?: string;
}> = ({ label, value, unit, icon, tone = "primary", onClick, className }) => {
  const content = (
    <>
      <span className="k-stat-label">
        <span>{label}</span>
        {icon ? (
          <Plate tone={tone} size="sm">
            {icon}
          </Plate>
        ) : null}
      </span>
      <span className="k-stat-value">
        {value}
        {unit ? <small className="k-stat-unit">{unit}</small> : null}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={cx("k-stat", "k-stat-clickable", className)} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={cx("k-stat", className)}>{content}</div>;
};
