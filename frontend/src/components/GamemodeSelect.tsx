import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface GamemodeSelectProps {
  value: string;
  onChange: (gamemode: string) => void;
  disabled?: boolean;
}

export const GamemodeSelect: React.FC<GamemodeSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const kubek = typeof window !== "undefined" ? window.Kubek : undefined;
  const icons = kubek?.icons || {};

  const GamepadIcon = icons.Gamepad2 || icons.Gamepad || (() => null);
  const HeartIcon = icons.Heart || (() => null);
  const SparklesIcon = icons.Sparkles || (() => null);
  const CompassIcon = icons.Compass || (() => null);
  const EyeIcon = icons.Eye || (() => null);
  const ChevronDownIcon = icons.ChevronDown || (() => null);

  const gamemodes = [
    { id: "Survival", label: "Survival", icon: HeartIcon, color: "text-rose-400" },
    { id: "Creative", label: "Creative", icon: SparklesIcon, color: "text-amber-400" },
    { id: "Adventure", label: "Adventure", icon: CompassIcon, color: "text-blue-400" },
    { id: "Spectator", label: "Spectator", icon: EyeIcon, color: "text-purple-400" },
  ];

  const currentMode = gamemodes.find((g) => g.id.toLowerCase() === (value || "survival").toLowerCase()) || gamemodes[0];
  const CurrentIcon = currentMode.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/90 hover:bg-muted border border-border/80 text-foreground font-semibold text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
      >
        <CurrentIcon className={`w-3.5 h-3.5 ${currentMode.color}`} />
        <span>{currentMode.label}</span>
        <ChevronDownIcon className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-card/95 border border-border shadow-2xl backdrop-blur-md z-50 py-1 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          {gamemodes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = mode.id.toLowerCase() === currentMode.id.toLowerCase();
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  onChange(mode.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition text-left ${
                  isSelected
                    ? "bg-primary/20 text-primary"
                    : "text-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${mode.color}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
