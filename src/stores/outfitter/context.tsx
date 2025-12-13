"use client";

import { createContext } from "react";
import type { Ship as ShipClass } from "@/lib/models/ship";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

export interface OutfitterState {
  selectedShip: ShipClass | null;
}

export interface OutfitterContextValue {
  state: OutfitterState;
  setSelectedShip: (ship: ShipClass | ShipType | null) => Promise<void>;
  addOutfitToShip: (outfit: Outfit, quantity?: number) => void;
  removeOutfitFromShip: (outfitName: string, quantity?: number) => void;
  setShipOutfits: (outfits: Outfit[]) => void;
}

export const OutfitterContext = createContext<OutfitterContextValue | null>(
  null
);
