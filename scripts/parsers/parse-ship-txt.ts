import { logger } from "@/lib/logger";
import { readGameDataFiles, GameDataPaths } from "./retrieve-game-data";
import { parseIndentedFormat, nodesToObject } from "./game-data-parser";
import { groupFilesBySpecies } from "../utils/species";
import { writeJsonFile, getSpeciesFilePath } from "../utils/file-io";
import { RAW_SHIP_DIR } from "../utils/paths";

/**
 * Parse ship data from game data format.
 */
export function parseShipData(content: string): unknown[] {
  const nodes = parseIndentedFormat(content);
  const ships: unknown[] = [];

  for (const node of nodes) {
    if (node.key === "ship") {
      const shipName = node.value as string;
      // No positional keys needed - we skip rendering data
      const shipObj = nodesToObject(node.children, []);
      ships.push({
        name: shipName,
        ...shipObj,
      });
    }
  }

  return ships;
}

/**
 * Parse ships data to raw JSON (no validation)
 */
export function parseShipTxt(): void {
  logger.info("Parsing ships to raw JSON...");

  const files = readGameDataFiles(GameDataPaths.SHIPS);
  const speciesMap = groupFilesBySpecies(files);

  let totalShips = 0;

  for (const [speciesName, contents] of speciesMap.entries()) {
    // Combine all content for this species and parse
    const combinedContent = contents.join("\n");
    const rawShips = parseShipData(combinedContent);

    // Write raw JSON without validation
    const outputPath = getSpeciesFilePath(RAW_SHIP_DIR, "ships", speciesName);
    writeJsonFile(outputPath, rawShips);

    const filename = `ships-${speciesName}.json`;
    logger.success(
      `Parsed ${rawShips.length} ships (${speciesName}) to ${filename}`
    );
    totalShips += rawShips.length;
  }

  logger.success(
    `Total: ${totalShips} ships across ${speciesMap.size} species`
  );
}
