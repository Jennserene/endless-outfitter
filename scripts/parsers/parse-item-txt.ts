import { logger } from "@/lib/logger";
import { readGameDataFiles } from "./retrieve-game-data";
import { groupFilesBySpecies } from "../utils/species";
import { writeJsonFile, getSpeciesFilePath } from "../utils/file-io";

/**
 * Generic function to parse item data (ships or outfits) from game data format.
 * Extracts common parsing logic shared between ship and outfit parsers.
 *
 * @param itemType - Type of item being parsed ('ship' or 'outfit')
 * @param itemKey - Key used in game data format (e.g., 'ship' or 'outfit')
 * @param parseItemData - Function to parse content string into array of items
 * @param rawDir - Directory to write raw JSON output
 * @param prefix - Prefix for output filenames (e.g., 'ships' or 'outfits')
 * @param gameDataPaths - Array of filenames to search for in game data
 */
export function parseItemTxt<T>(
  itemType: "ship" | "outfit",
  itemKey: string,
  parseItemData: (content: string) => T[],
  rawDir: string,
  prefix: string,
  gameDataPaths: readonly string[]
): void {
  logger.info(`Parsing ${itemType}s to raw JSON...`);

  const files = readGameDataFiles(gameDataPaths);
  const speciesMap = groupFilesBySpecies(files);

  let totalItems = 0;

  for (const [speciesName, contents] of speciesMap.entries()) {
    // Combine all content for this species and parse
    const combinedContent = contents.join("\n");
    const rawItems = parseItemData(combinedContent);

    // Write raw JSON without validation
    const outputPath = getSpeciesFilePath(rawDir, prefix, speciesName);
    writeJsonFile(outputPath, rawItems);

    const filename = `${prefix}-${speciesName}.json`;
    logger.success(
      `Parsed ${rawItems.length} ${itemType}s (${speciesName}) to ${filename}`
    );
    totalItems += rawItems.length;
  }

  logger.success(
    `Total: ${totalItems} ${itemType}s across ${speciesMap.size} species`
  );
}
