import React from "react";
import { cx } from "./cx";

export const KeyValue: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <dl className={cx("k-kv", className)}>{children}</dl>;

export const KeyValueItem: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </>
);
