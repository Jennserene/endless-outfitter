import { logger } from "@/lib/logger";
import { validateSubmoduleVersion } from "../utils/git";
import { wipeRawDataDirectory } from "../utils/directories";
import { parseShipTxt } from "./parse-ship-txt";
import { parseOutfitTxt } from "./parse-outfit-txt";

/**
 * Controller for raw data parsing pipeline.
 * Orchestrates the flow from game data text files to raw JSON files.
 *
 * Steps:
 * 1. Validate submodule version
 * 2. Wipe and recreate raw data directory
 * 3. Parse ships from game data files
 * 4. Parse outfits from game data files
 */
export function retrieveRawData(): void {
  logger.info("Starting raw data parsing...\n");

  // Step 1: Validate version
  validateSubmoduleVersion();

  // Step 2: Wipe and recreate raw data directory
  logger.info("Wiping raw data directory...");
  wipeRawDataDirectory();

  logger.info("Parsing ships to JSON without validation...");
  // Step 3: Parse ships from game data files
  parseShipTxt();

  // Step 4: Parse outfits from game data files
  parseOutfitTxt();

  logger.success("Raw data parsing completed successfully!");
}
