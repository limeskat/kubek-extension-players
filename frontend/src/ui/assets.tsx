import React from "react";
import { FALLBACK_VERSION } from "../utils/item-textures";

const AssetVersionContext = React.createContext<string>(FALLBACK_VERSION);

/** Game version used to resolve item textures, from the selected server's GAME_VERSION. */
export const AssetVersionProvider: React.FC<{ version?: string; children?: React.ReactNode }> = ({
  version,
  children,
}) => (
  <AssetVersionContext.Provider value={(version || "").trim() || FALLBACK_VERSION}>
    {children}
  </AssetVersionContext.Provider>
);

export const useAssetVersion = () => React.useContext(AssetVersionContext);
