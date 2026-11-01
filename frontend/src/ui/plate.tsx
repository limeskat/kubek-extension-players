import React from "react";
import { cx } from "./cx";
import { type Tone, toneClass } from "./tone";

type PlateSize = "sm" | "md" | "lg" | "xl";

export const Plate: React.FC<{
  tone?: Tone;
  size?: PlateSize;
  className?: string;
  children?: React.ReactNode;
}> = ({ tone = "primary", size = "md", className, children }) => (
  <span className={cx("k-plate", `k-plate-${size}`, toneClass[tone], className)}>{children}</span>
);
