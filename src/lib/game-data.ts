import { GAME_REPO_PATH } from "@/config/game-version";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

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

const GAME_DATA_ROOT = join(process.cwd(), GAME_REPO_PATH);

export function getGameDataPath(relativePath: string): string {
  return join(GAME_DATA_ROOT, relativePath);
}

/**
 * Read a game data file from the submodule.
 * This runs server-side only and does NOT bundle data into the client.
 *
 * @param relativePath - Path relative to the game repo root (e.g., "data/ships.txt")
 * @returns File contents as string
 * @throws Error if file doesn't exist or submodule is not available
 */
export function readGameDataFile(relativePath: string): string {
  const fullPath = getGameDataPath(relativePath);

  if (!existsSync(fullPath)) {
    // In production, submodule should not be available
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Game data file not available in production: ${relativePath}. ` +
          `Game data submodule is only available in local development.`
      );
    }
    throw new Error(`Game data file not found: ${relativePath}`);
  }

  return readFileSync(fullPath, "utf-8");
}

export const GameDataPaths = {
  SHIPS: "data/ships.txt",
  OUTFITS: "data/outfits.txt",
  COMMODITIES: "data/commodities.txt",
  SYSTEMS: "data/systems.txt",
} as const;

// Re-export conversion functions
import { convertShipsToZod } from "@/lib/converters/ship-converter";
import { convertOutfitsToZod } from "@/lib/converters/outfit-converter";
export { convertShipsToZod, convertOutfitsToZod };
export type { Ship } from "@/lib/schemas/ship";
export type { Outfit } from "@/lib/schemas/outfit";

/**
 * Get all ships from game data, parsed and validated with Zod.
 */
export function getShips() {
  const content = readGameDataFile(GameDataPaths.SHIPS);
  return convertShipsToZod(content);
}

/**
 * Get all outfits from game data, parsed and validated with Zod.
 */
export function getOutfits() {
  const content = readGameDataFile(GameDataPaths.OUTFITS);
  return convertOutfitsToZod(content);
}
