import React from "react";
import type { InventoryItem } from "../../../types/player";
import {
  SlotBootsIcon,
  SlotChestplateIcon,
  SlotHelmetIcon,
  SlotLeggingsIcon,
  SlotShieldIcon,
} from "../../MinecraftIcons";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "../../../ui/empty";
import { cx } from "../../../ui/cx";
import { useKubek } from "../../../ui/kubek";
import { Panel, PanelBody, PanelHead } from "../../../ui/panel";
import { Plate } from "../../../ui/plate";
import { TabBar } from "../../../ui/tabs";
import { ItemSlot } from "../ItemSlot";
import type { SectionProps } from "../types";

type ViewMode = "native" | "classic";
type InventoryTab = "main" | "ender";

const VIEW_KEY = "kubek.players.inventoryView";

const readView = (): ViewMode => {
  if (typeof window === "undefined") return "native";
  return window.localStorage.getItem(VIEW_KEY) === "classic" ? "classic" : "native";
};

const slots = (items: Array<InventoryItem | null> | undefined) =>
  Array.from({ length: 27 }, (_, index) => items?.[index] ?? null);

const itemKey = (items: Array<InventoryItem | null> | undefined, index: number) => {
  const item = items?.[index];
  return item ? `${item.id}-${index}` : `empty-${index}`;
};

export const Inventory: React.FC<SectionProps> = ({ player }) => {
  const kubek = useKubek();
  const { hooks, icons = {} } = kubek;
  const { t } = hooks.useTranslation();
  const Box = icons.Box || icons.Package || (() => null);

  const [view, setView] = React.useState<ViewMode>(readView);
  const [tab, setTab] = React.useState<InventoryTab>("main");

  const changeView = (next: string) => {
    const mode = next === "classic" ? "classic" : "native";
    setView(mode);
    if (typeof window !== "undefined") window.localStorage.setItem(VIEW_KEY, mode);
  };

  const inventory = player.inventory;
  const armor = inventory?.armor;

  return (
    <Panel className={cx(view === "classic" && "k-inv--classic")}>
      <PanelHead>
        <Plate tone="blue" size="sm">
          <Box />
        </Plate>
        <span className="k-section-title">{t("ext.players.inventory") || "Inventory"}</span>
        <div className="k-section-switches">
          <TabBar
            compact
            items={[
              { id: "native", label: t("ext.players.inventory_native") || "Native" },
              { id: "classic", label: t("ext.players.inventory_classic") || "Classic" },
            ]}
            value={view}
            onChange={changeView}
            label="Inventory style"
          />
        </div>
      </PanelHead>

      <PanelBody>
        {!inventory ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No inventory data</EmptyTitle>
              <EmptyDescription>
                Inventory appears once the player has a data file on disk.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="k-inv">
            {inventory.enderChest ? (
              <TabBar
                compact
                items={[
                  { id: "main", label: t("ext.players.inventory") || "Inventory" },
                  { id: "ender", label: t("ext.players.ender_chest") || "Ender chest" },
                ]}
                value={tab}
                onChange={(id) => setTab(id as InventoryTab)}
                label="Inventory page"
              />
            ) : null}

            <div className="k-inv-canvas">
              <div className="k-inv-scroll">
                {tab === "main" ? (
                  <>
                    <div className="k-inv-layout">
                      <div className="k-inv-armor-col">
                        <ItemSlot item={armor?.helmet} placeholder={<SlotHelmetIcon className="k-slot-icon" />} />
                        <ItemSlot item={armor?.chestplate} placeholder={<SlotChestplateIcon className="k-slot-icon" />} />
                        <ItemSlot item={armor?.leggings} placeholder={<SlotLeggingsIcon className="k-slot-icon" />} />
                        <ItemSlot item={armor?.boots} placeholder={<SlotBootsIcon className="k-slot-icon" />} />
                      </div>

                      <div className="k-inv-grid">
                        {slots(inventory.main).map((item, index) => (
                          <ItemSlot key={itemKey(inventory.main, index)} item={item} />
                        ))}
                      </div>
                    </div>

                    <div className="k-inv-bar">
                      <ItemSlot item={inventory.offhand} placeholder={<SlotShieldIcon className="k-slot-icon" />} />
                      <div className="k-inv-grid">
                        {Array.from({ length: 9 }, (_, index) => (
                          <ItemSlot key={itemKey(inventory.hotbar, index)} item={inventory.hotbar?.[index] ?? null} />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="k-inv-grid">
                    {slots(inventory.enderChest).map((item, index) => (
                      <ItemSlot key={itemKey(inventory.enderChest, index)} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
};
