import React from "react";

export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}> = ({ value, onChange, placeholder, label }) => (
  <label className="k-search">
    <svg className="k-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
    <input
      className="k-search-input"
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
