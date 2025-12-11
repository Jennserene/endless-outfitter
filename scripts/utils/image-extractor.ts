import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

/**
 * Extract all unique image paths from ships and outfits data.
 * Collects sprite and thumbnail paths from ships, and thumbnail paths from outfits.
 *
 * @param ships - Array of ship objects
 * @param outfits - Array of outfit objects
 * @returns Set of unique image paths
 */
export function extractImagePaths(
  ships: Ship[],
  outfits: Outfit[]
): Set<string> {
  const imagePaths = new Set<string>();

  // Extract sprite and thumbnail from ships
  for (const ship of ships) {
    if (ship.sprite) {
      imagePaths.add(ship.sprite);
    }
    if (ship.thumbnail) {
      imagePaths.add(ship.thumbnail);
    }
  }

  // Extract thumbnail from outfits
  for (const outfit of outfits) {
    if (outfit.thumbnail) {
      imagePaths.add(outfit.thumbnail);
    }
  }

  return imagePaths;
}
