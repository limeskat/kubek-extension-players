import React from "react";
import { cx } from "./cx";

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
};

export const TabBar: React.FC<{
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
}> = ({ items, value, onChange, label, className }) => (
  <div role="tablist" aria-label={label} className={cx("k-tabs", className)}>
    {items.map((item) => {
      const active = item.id === value;
      return (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active}
          className={cx("k-tab", active && "k-tab-active")}
          onClick={() => onChange(item.id)}
        >
          {item.icon ? <span className="k-tab-icon">{item.icon}</span> : null}
          <span>{item.label}</span>
          {item.count ? <span className="k-tab-count">{item.count}</span> : null}
        </button>
      );
    })}
  </div>
);
