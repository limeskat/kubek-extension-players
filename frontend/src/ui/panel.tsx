import React from "react";
import { cx } from "./cx";

export const Panel: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, children, ...rest }) => (
  <section className={cx("k-panel", className)} {...rest}>
    {children}
  </section>
);

export const PanelHead: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cx("k-panel-head", className)} {...rest}>
    {children}
  </div>
);

export const PanelMeta: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, children, ...rest }) => (
  <span className={cx("k-panel-meta", className)} {...rest}>
    {children}
  </span>
);

export const PanelBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cx("k-panel-body", className)} {...rest}>
    {children}
  </div>
);

export const PanelFoot: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div className={cx("k-panel-foot", className)} {...rest}>
    {children}
  </div>
);
