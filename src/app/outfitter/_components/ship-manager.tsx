"use client";

import { ShipInfoPanel } from "./ship-info-panel";
import { useOutfitter } from "@/stores/outfitter";

/**
 * ShipManager - Container component for ship information display.
 * The ship management buttons are now in the Header component.
 */
export function ShipManager() {
  const { state } = useOutfitter();
  const selectedShip = state.selectedShip;

  return (
    <div className="flex flex-col h-full">
      {/* ShipInfoPanel - Always visible */}
      <ShipInfoPanel ship={selectedShip} />
    </div>
  );
}
