import { GAME_VERSION, GAME_REPO_PATH } from "@config/game-version";
import { DATA_SCHEMA_FORMAT_VERSION } from "@config/data-schema-version";
import { join } from "path";
import {
  DATA_DIR,
  SHIPS_DIR,
  OUTFITS_DIR,
  RAW_DATA_DIR,
  RAW_SHIP_DIR,
  RAW_OUTFIT_DIR,
  GameDataPaths,
} from "../utils/paths";

/**
 * Centralized configuration for the data generation pipeline
 */
export interface PipelineConfig {
  /**
   * Game version from submodule
   */
  gameVersion: string;

  /**
   * Path to game repository submodule
   */
  gameRepoPath: string;

  /**
   * Data schema format version
   */
  schemaVersion: string;

  /**
   * File patterns to search for in game data
   */
  filePatterns: {
    ships: readonly string[];
    outfits: readonly string[];
  };

  /**
   * Directory paths for data generation
   */
  paths: {
    dataDir: string;
    shipsDir: string;
    outfitsDir: string;
    rawDataDir: string;
    rawShipsDir: string;
    rawOutfitsDir: string;
    gameDataRoot: string;
  };
}

/**
 * Create pipeline configuration with current settings
 */
export function createPipelineConfig(): PipelineConfig {
  const gameDataRoot = join(process.cwd(), GAME_REPO_PATH);

  return {
    gameVersion: GAME_VERSION,
    gameRepoPath: GAME_REPO_PATH,
    schemaVersion: DATA_SCHEMA_FORMAT_VERSION,
    filePatterns: {
      ships: GameDataPaths.SHIPS,
      outfits: GameDataPaths.OUTFITS,
    },
    paths: {
      dataDir: DATA_DIR,
      shipsDir: SHIPS_DIR,
      outfitsDir: OUTFITS_DIR,
      rawDataDir: RAW_DATA_DIR,
      rawShipsDir: RAW_SHIP_DIR,
      rawOutfitsDir: RAW_OUTFIT_DIR,
      gameDataRoot,
    },
  };
}
