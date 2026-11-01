import React from "react";
import { cx } from "./cx";

export const PageHeader: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, className }) => (
  <div className={cx("k-page-header", className)}>
    <div className="k-page-header-text">
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className="k-page-header-actions">{actions}</div> : null}
  </div>
);
