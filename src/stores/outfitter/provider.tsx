"use client";

import { useState, useCallback } from "react";

import {
  OutfitterContext,
  type OutfitterState,
  type OutfitterContextValue,
} from "./context";

import { Ship } from "@/lib/models/ship";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

interface OutfitterProviderProps {
  children: React.ReactNode;
}

export function OutfitterProvider({ children }: OutfitterProviderProps) {
  const [state, setState] = useState<OutfitterState>({
    selectedShip: null,
  });

  const setSelectedShip = useCallback(async (ship: Ship | ShipType | null) => {
    // Convert plain Ship type to Ship class instance if needed
    let shipInstance: Ship | null = null;
    if (ship !== null) {
      if (ship instanceof Ship) {
        shipInstance = ship;
      } else {
        // Check if ship has default outfits to load
        if (ship.outfits && ship.outfits.length > 0) {
          try {
            // Load outfits from API
            const response = await fetch(`/api/ships/${ship.slug}/outfits`);
            if (response.ok) {
              const data = await response.json();
              const outfits: Outfit[] = data.outfits || [];
              shipInstance = new Ship(ship, outfits);
            } else {
              // If API fails, create ship without outfits
              console.warn(
                `Failed to load outfits for ship ${ship.slug}, creating ship without default outfits`
              );
              shipInstance = new Ship(ship, []);
            }
          } catch (error) {
            // If API fails, create ship without outfits
            console.error(
              `Error loading outfits for ship ${ship.slug}:`,
              error
            );
            shipInstance = new Ship(ship, []);
          }
        } else {
          // No default outfits, create ship without outfits
          shipInstance = new Ship(ship, []);
        }
      }
    }

    setState((prev) => ({
      ...prev,
      selectedShip: shipInstance,
    }));
  }, []);

  const addOutfitToShip = useCallback(
    (outfit: Outfit, quantity: number = 1) => {
      setState((prev) => {
        if (!prev.selectedShip) {
          return prev;
        }

        const updatedShip = prev.selectedShip.addOutfit(outfit, quantity);
        return {
          ...prev,
          selectedShip: updatedShip,
        };
      });
    },
    []
  );

  const removeOutfitFromShip = useCallback(
    (outfitName: string, quantity: number = 1) => {
      setState((prev) => {
        if (!prev.selectedShip) {
          return prev;
        }

        const updatedShip = prev.selectedShip.removeOutfit(
          outfitName,
          quantity
        );
        return {
          ...prev,
          selectedShip: updatedShip,
        };
      });
    },
    []
  );

  const setShipOutfits = useCallback((outfits: Outfit[]) => {
    setState((prev) => {
      if (!prev.selectedShip) {
        return prev;
      }

      const updatedShip = prev.selectedShip.setOutfits(outfits);
      return {
        ...prev,
        selectedShip: updatedShip,
      };
    });
  }, []);

  const value: OutfitterContextValue = {
    state,
    setSelectedShip,
    addOutfitToShip,
    removeOutfitFromShip,
    setShipOutfits,
  };

  return (
    <OutfitterContext.Provider value={value}>
      {children}
    </OutfitterContext.Provider>
  );
}
