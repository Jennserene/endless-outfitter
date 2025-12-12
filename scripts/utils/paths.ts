import { join } from "path";
import { GAME_REPO_PATH } from "@config/game-version";

/**
 * Path constants for data generation and validation scripts
 */
export const DATA_DIR = join(process.cwd(), "src/assets/data");
export const SHIPS_DIR = join(DATA_DIR, "ships");
export const OUTFITS_DIR = join(DATA_DIR, "outfits");
export const SEARCH_INDEX_PATH = join(DATA_DIR, "search-index.json");
export const IMAGES_DIR = join(process.cwd(), "src/assets/images");
export const OUTFIT_IMAGES_DIR = join(IMAGES_DIR, "outfit");
export const SHIP_IMAGES_DIR = join(IMAGES_DIR, "ship");
export const THUMBNAIL_IMAGES_DIR = join(IMAGES_DIR, "thumbnail");
export const SUBMODULE_PATH = join(process.cwd(), GAME_REPO_PATH);

/**
 * Paths to raw parsed data (from raw-parser.ts)
 * These are gitignored intermediate files
 */
export const RAW_DATA_DIR = join(process.cwd(), "scripts", ".data", "raw");
export const RAW_SHIP_DIR = join(RAW_DATA_DIR, "ships");
export const RAW_OUTFIT_DIR = join(RAW_DATA_DIR, "outfits");

/**
 * Game data repository root path
 */
const GAME_DATA_ROOT = join(process.cwd(), GAME_REPO_PATH);

/**
 * Get the full path to a file in the game data submodule
 */
export function getGameDataPath(relativePath: string): string {
  return join(GAME_DATA_ROOT, relativePath);
}

/**
 * Game data file patterns to search for
 */
export const GameDataPaths = {
  SHIPS: ["ships.txt", "kestrel.txt", "marauders.txt", "variants.txt"],
  OUTFITS: ["outfits.txt", "engines.txt", "power.txt", "weapons.txt"],
} as const;
