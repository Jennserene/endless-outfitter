"use client";

import { ShipManager } from "./ship-manager";

interface OutfitterLayoutContentProps {
  children: React.ReactNode;
}

/**
 * Client component for the outfitter layout.
 * Handles the responsive layout with ShipManager.
 */
export function OutfitterLayoutContent({
  children,
}: OutfitterLayoutContentProps) {
  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      {/* Ship Manager - Always visible, responsive positioning */}
      <div className="w-full md:w-[400px] shrink-0 border-t md:border-t-0 md:border-l border-border overflow-hidden">
        <ShipManager />
      </div>
    </div>
  );
}
