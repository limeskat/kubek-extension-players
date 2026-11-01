import React from "react";
import { cx } from "./cx";

export const Empty: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-empty", className)}>{children}</div>;

export const EmptyHeader: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-empty-header", className)}>{children}</div>;

export const EmptyMedia: React.FC<{ icon?: React.ReactNode; className?: string }> = ({
  icon,
  className,
}) => <div className={cx("k-empty-media", className)}>{icon}</div>;

export const EmptyTitle: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-empty-title", className)}>{children}</div>;

export const EmptyDescription: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-empty-description", className)}>{children}</div>;

export const EmptyContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cx("k-empty-content", className)}>{children}</div>;
