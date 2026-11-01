import React from "react";
import type { InventoryItem } from "../../types/player";
import { useAssetVersion } from "../../ui/assets";
import { cx } from "../../ui/cx";
import { resolveItemTexture } from "../../utils/item-textures";

const MissingGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3 21 7.5v9L12 21 3 16.5v-9L12 3Z" />
    <path d="M3 7.5 12 12l9-4.5" />
    <path d="M12 12v9" />
  </svg>
);

/** One inventory cell. Resolves its texture through the item model for the server version. */
export const ItemSlot: React.FC<{
  item?: InventoryItem | null;
  placeholder?: React.ReactNode;
}> = ({ item, placeholder }) => {
  const version = useAssetVersion();
  const [texture, setTexture] = React.useState<string | null | undefined>(undefined);

  React.useEffect(() => {
    if (!item) return;
    let alive = true;
    setTexture(undefined);
    void resolveItemTexture(item.id || "", version).then((url) => {
      if (alive) setTexture(url);
    });
    return () => {
      alive = false;
    };
  }, [item?.id, version]);

  if (!item) {
    return (
      <div className="k-slot" aria-label="Empty" title="Empty">
        {placeholder ? <span className="k-slot-placeholder">{placeholder}</span> : null}
      </div>
    );
  }

  const cleanId = (item.id || "").replace(/^[a-z0-9_]+:/i, "");
  const label = item.displayName || cleanId;
  const count = item.count || 1;

  return (
    <div className={cx("k-slot", "k-slot-filled")} title={`${label} (${item.id}) x${count}`}>
      {texture === undefined ? (
        <span className="k-slot-loading" aria-hidden="true" />
      ) : texture ? (
        <img
          className="k-slot-img"
          src={texture}
          alt={label}
          loading="lazy"
          decoding="async"
          onError={() => setTexture(null)}
        />
      ) : (
        <MissingGlyph className="k-slot-missing" />
      )}
      {count > 1 ? <span className="k-slot-count">{count}</span> : null}
    </div>
  );
};
