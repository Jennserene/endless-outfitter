import "server-only";

import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";
import { slugify } from "@/lib/utils/slug";

/**
 * SERVER-ONLY utilities for accessing game data files.
 * These functions use Node.js fs module and can ONLY run on the server.
 *
 * Safe to use in:
 * - Server Components (default in Next.js App Router)
 * - API Routes (app/api/.../route.ts)
 * - Server Actions
 *
 * DO NOT use in:
 * - Client Components (files with "use client")
 * - Browser code
 * - Static generation at build time (unless you want to bundle the data)
 */

/**
 * Get all ships from generated data files.
 * In production, uses pre-generated JSON files from public/assets/data/.
 * In development, can optionally use submodule (fallback not implemented).
 */
export function getShips(): Ship[] {
  return loadShips();
}

/**
 * Get all outfits from generated data files.
 * In production, uses pre-generated JSON files from public/assets/data/.
 * In development, can optionally use submodule (fallback not implemented).
 */
export function getOutfits(): Outfit[] {
  return loadOutfits();
}

/**
 * Find a ship by its slug (URL-friendly name).
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param slug - The slug to search for
 * @returns The ship if found, undefined otherwise
 */
export function getShipBySlug(slug: string): Ship | undefined {
  const ships = loadShips();
  return ships.find((ship) => slugify(ship.name) === slug);
}

/**
 * Find an outfit by its slug (URL-friendly name).
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param slug - The slug to search for
 * @returns The outfit if found, undefined otherwise
 */
export function getOutfitBySlug(slug: string): Outfit | undefined {
  const outfits = loadOutfits();
  return outfits.find((outfit) => slugify(outfit.name) === slug);
}
