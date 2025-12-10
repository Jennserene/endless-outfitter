import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

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
 * In production, uses pre-generated JSON files from src/data/.
 * In development, can optionally use submodule (fallback not implemented).
 */
export function getShips(): Ship[] {
  return loadShips();
}

/**
 * Get all outfits from generated data files.
 * In production, uses pre-generated JSON files from src/data/.
 * In development, can optionally use submodule (fallback not implemented).
 */
export function getOutfits(): Outfit[] {
  return loadOutfits();
}
