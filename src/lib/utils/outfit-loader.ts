import "server-only";

import { getOutfits } from "@/lib/game-data";
import type { Outfit } from "@/lib/schemas/outfit";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import { Ship } from "@/lib/models/ship";

/**
 * Gets an outfit by name from the loaded outfits data.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param name - The name of the outfit to find
 * @returns The outfit if found, undefined otherwise
 */
export function getOutfitByName(name: string): Outfit | undefined {
  const outfits = getOutfits();
  return outfits.find((outfit) => outfit.name === name);
}

/**
 * Loads multiple outfits by name from the loaded outfits data.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param names - Array of outfit names to load
 * @returns Array of outfits found (may be shorter than names array if some not found)
 */
export function loadOutfitsByName(names: string[]): Outfit[] {
  const outfits = getOutfits();
  const outfitMap = new Map<string, Outfit>();
  for (const outfit of outfits) {
    outfitMap.set(outfit.name, outfit);
  }

  const result: Outfit[] = [];
  for (const name of names) {
    const outfit = outfitMap.get(name);
    if (outfit) {
      result.push(outfit);
    }
  }

  return result;
}

/**
 * Loads outfits from a ship's outfits list (with quantities).
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param shipOutfits - Array of {name, quantity} from ship data
 * @returns Array of Outfit objects, with duplicates for quantity > 1
 */
export function loadOutfitsFromShipOutfits(
  shipOutfits: Array<{ name: string; quantity?: number }>
): Outfit[] {
  const outfits = getOutfits();
  const outfitMap = new Map<string, Outfit>();
  for (const outfit of outfits) {
    outfitMap.set(outfit.name, outfit);
  }

  const result: Outfit[] = [];
  for (const shipOutfit of shipOutfits) {
    const outfit = outfitMap.get(shipOutfit.name);
    if (outfit) {
      const quantity = shipOutfit.quantity ?? 1;
      for (let i = 0; i < quantity; i++) {
        result.push(outfit);
      }
    }
  }

  return result;
}

/**
 * Creates a Ship class instance from a Ship type, loading outfits from the ship's outfits list.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param shipData - The ship data to create a Ship instance from
 * @returns Ship class instance with outfits loaded
 */
export function createShipInstanceWithOutfits(shipData: ShipType): Ship {
  const outfits = loadOutfitsFromShipOutfits(shipData.outfits);
  return new Ship(shipData, outfits);
}
