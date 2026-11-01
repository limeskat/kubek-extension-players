import React from "react";
import type { InventoryItem } from "../../types/player";
import { cx } from "../../ui/cx";
import { itemTextureUrls } from "../../utils/format";

/** One inventory cell. Falls back from the item texture to the block texture, then to text. */
export const ItemSlot: React.FC<{
  item?: InventoryItem | null;
  placeholder?: React.ReactNode;
}> = ({ item, placeholder }) => {
  const [stage, setStage] = React.useState<0 | 1 | 2>(0);

  React.useEffect(() => {
    setStage(0);
  }, [item?.id]);

  if (!item) {
    return (
      <div className="k-slot" aria-label="Empty" title="Empty">
        {placeholder ? <span className="k-slot-placeholder">{placeholder}</span> : null}
      </div>
    );
  }

  const cleanId = (item.id || "").replace(/^[a-z0-9_]+:/i, "");
  const urls = itemTextureUrls(item.id || "");
  const label = item.displayName || cleanId;
  const count = item.count || 1;

  return (
    <div
      className={cx("k-slot", "k-slot-filled")}
      title={`${label} (${item.id}) x${count}`}
    >
      {stage < 2 ? (
        <img
          className="k-slot-img"
          src={stage === 0 ? urls.item : urls.block}
          alt={label}
          loading="lazy"
          decoding="async"
          onError={() => setStage((current) => (current === 0 ? 1 : 2))}
        />
      ) : (
        <span className="k-slot-text">{label.slice(0, 3)}</span>
      )}
      {count > 1 ? <span className="k-slot-count">{count}</span> : null}
    </div>
  );
};
