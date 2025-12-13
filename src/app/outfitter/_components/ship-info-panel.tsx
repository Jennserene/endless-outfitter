"use client";

import { ShipInfoDisplay } from "./ship-info-display";
import type { Ship } from "@/lib/models/ship";

interface ShipInfoPanelProps {
  ship: Ship | null;
}

/**
 * ShipInfoPanel - Always visible inline panel for ship information.
 * Replaces the Sheet component with an inline panel that never closes.
 */
export function ShipInfoPanel({ ship }: ShipInfoPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-background">
      <div className="flex-1 overflow-y-auto min-h-0">
        <ShipInfoDisplay ship={ship} />
      </div>
    </div>
  );
}
