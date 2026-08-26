import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

// --- OFFICIAL MINECRAFT VANILLA PIXELATED ARMOR & SHIELD TEXTURES (BASE64) ---
export const SLOT_HELMET_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANUlEQVQ4y2NgGJ4gNDT0PzZMtGZy5IhTQEjN4DEAPdCQ+bR1AcWxQBUDcCkkWjOu1Dh48w0AYJ4/wa1cA24AAAAASUVORK5CYII=";
export const SLOT_CHESTPLATE_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAN0lEQVQ4y2NgGHQgNDT0Pz5MUCOxFmAIkuPSQWQAqYZgVUuxAcQaQjAqh7gBhBQQHdAk5wNKAAAxZUu1bTG8GwAAAABJRU5ErkJggg==";
export const SLOT_LEGGINGS_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALUlEQVQ4y2NgGHQgNDT0Pz5MUDMxFgwhA7D5m2gDiGGPGjBoDcCW7knKD6QCAJIMa5WmTdLCAAAAAElFTkSuQmCC";
export const SLOT_BOOTS_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANklEQVQ4y2NgGH4gNDT0PwzjE8OpmRT2qAF4NBPShGEINlMJ2YoiRtAGQmqQEwq+QCJW3RADAHiLW6VtnlyIAAAAAElFTkSuQmCC";
export const SLOT_SHIELD_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAgMAAABinRfyAAAADFBMVEX///8ZICIAAABVVVXvAVy1AAAAA3RSTlMAAAD6dsTeAAAASUlEQVR42mNYBQQMDcwXmBhW/bFfxdC/MuoTw7ZVq/oYtoKIuatWbYMQa0HE6lWrXkGJLCCx8tbqLIaVtXuzGFaFXwUSq1atAgA2yCiNNcLDCQAAAABJRU5ErkJggg==";

// 1. Pixelated Helmet Slot Silhouette (Vanilla Minecraft)
export const SlotHelmetIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src={SLOT_HELMET_B64}
    alt="Helmet Slot"
    className={`${className} image-pixelated pointer-events-none select-none`}
    style={{ imageRendering: "pixelated", width: "36px", height: "36px" }}
  />
);

// 2. Pixelated Chestplate Slot Silhouette (Vanilla Minecraft)
export const SlotChestplateIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src={SLOT_CHESTPLATE_B64}
    alt="Chestplate Slot"
    className={`${className} image-pixelated pointer-events-none select-none`}
    style={{ imageRendering: "pixelated", width: "36px", height: "36px" }}
  />
);

// 3. Pixelated Leggings Slot Silhouette (Vanilla Minecraft)
export const SlotLeggingsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src={SLOT_LEGGINGS_B64}
    alt="Leggings Slot"
    className={`${className} image-pixelated pointer-events-none select-none`}
    style={{ imageRendering: "pixelated", width: "36px", height: "36px" }}
  />
);

// 4. Pixelated Boots Slot Silhouette (Vanilla Minecraft)
export const SlotBootsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src={SLOT_BOOTS_B64}
    alt="Boots Slot"
    className={`${className} image-pixelated pointer-events-none select-none`}
    style={{ imageRendering: "pixelated", width: "36px", height: "36px" }}
  />
);

// 5. Pixelated Shield / Offhand Slot Silhouette (Vanilla Minecraft)
export const SlotShieldIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <img
    src={SLOT_SHIELD_B64}
    alt="Shield Slot"
    className={`${className} image-pixelated pointer-events-none select-none`}
    style={{ imageRendering: "pixelated", width: "36px", height: "36px" }}
  />
);

// --- CLEAN FLAT VECTOR HEARTS ---
export const MinecraftHeart: React.FC<{ type: "full" | "half" | "empty"; className?: string }> = ({
  type,
  className = "w-5 h-5",
}) => {
  const heartPath =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  if (type === "full") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#f43f5e" xmlns="http://www.w3.org/2000/svg">
        <path d={heartPath} />
      </svg>
    );
  }

  if (type === "half") {
    return (
      <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="heart-left-half">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path d={heartPath} fill="#27272a" stroke="#3f3f46" strokeWidth="0.5" />
        <path d={heartPath} fill="#f43f5e" clipPath="url(#heart-left-half)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="#27272a" stroke="#3f3f46" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
      <path d={heartPath} />
    </svg>
  );
};

// --- DRUMSTICK WITH WHITE BONE AND ROTATED MEAT ---
export const MinecraftFood: React.FC<{ type: "full" | "half" | "empty"; className?: string }> = ({
  type,
  className = "w-5 h-5",
}) => {
  const bonePath = "M4.5 19.5L8.5 15.5L10 17L6 21Z";
  const meatPath =
    "M8.5 15.2C7.2 13.6 7 11.2 8.2 9C9.5 6.4 12.2 3.8 15.8 3.2C19.2 2.6 22 4.8 22.5 8C23 11.2 20.8 15.2 18 17.5C15.5 19.5 12.8 19.2 11 17.5L8.5 15.2Z";

  if (type === "full") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={bonePath} fill="#ffffff" />
        <circle cx="4.2" cy="18.5" r="2.2" fill="#ffffff" />
        <circle cx="6.5" cy="20.8" r="2.2" fill="#ffffff" />
        <path d={meatPath} fill="#f97316" />
      </svg>
    );
  }

  if (type === "half") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="drumstick-left-cut">
            <rect x="0" y="0" width="13" height="24" />
          </clipPath>
        </defs>
        <path d={bonePath} fill="#475569" />
        <circle cx="4.2" cy="18.5" r="2.2" fill="#475569" />
        <circle cx="6.5" cy="20.8" r="2.2" fill="#475569" />
        <path d={meatPath} fill="#27272a" stroke="#3f3f46" strokeWidth="0.5" />
        <g clipPath="url(#drumstick-left-cut)">
          <path d={bonePath} fill="#ffffff" />
          <circle cx="4.2" cy="18.5" r="2.2" fill="#ffffff" />
          <circle cx="6.5" cy="20.8" r="2.2" fill="#ffffff" />
          <path d={meatPath} fill="#f97316" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={bonePath} fill="#3f3f46" />
      <circle cx="4.2" cy="18.5" r="2.2" fill="#3f3f46" />
      <circle cx="6.5" cy="20.8" r="2.2" fill="#3f3f46" />
      <path d={meatPath} fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
    </svg>
  );
};
