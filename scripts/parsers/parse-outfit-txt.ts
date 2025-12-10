import { logger } from "@/lib/logger";
import { readGameDataFiles, GameDataPaths } from "./retrieve-game-data";
import { parseIndentedFormat, nodesToObject } from "./game-data-parser";
import { groupFilesBySpecies } from "../utils/species";
import { writeJsonFile, getSpeciesFilePath } from "../utils/file-io";
import { RAW_OUTFIT_DIR } from "../utils/paths";

/**
 * Parse outfit data from game data format.
 */
export function parseOutfitData(content: string): unknown[] {
  const nodes = parseIndentedFormat(content);
  const outfits: unknown[] = [];

  for (const node of nodes) {
    if (node.key === "outfit") {
      const outfitName = node.value as string;
      // Outfits don't have positional data, so pass empty array
      const outfitObj = nodesToObject(node.children, []);
      outfits.push({
        name: outfitName,
        ...outfitObj,
      });
    }
  }

  return outfits;
}

/**
 * Parse outfits data to raw JSON (no validation)
 */
export function parseOutfitTxt(): void {
  logger.info("Parsing outfits to raw JSON...");

  const files = readGameDataFiles(GameDataPaths.OUTFITS);
  const speciesMap = groupFilesBySpecies(files);

  let totalOutfits = 0;

  for (const [speciesName, contents] of speciesMap.entries()) {
    // Combine all content for this species and parse
    const combinedContent = contents.join("\n");
    const rawOutfits = parseOutfitData(combinedContent);

    // Write raw JSON without validation
    const outputPath = getSpeciesFilePath(
      RAW_OUTFIT_DIR,
      "outfits",
      speciesName
    );
    writeJsonFile(outputPath, rawOutfits);

    const filename = `outfits-${speciesName}.json`;
    logger.success(
      `Parsed ${rawOutfits.length} outfits (${speciesName}) to ${filename}`
    );
    totalOutfits += rawOutfits.length;
  }

  logger.success(
    `Total: ${totalOutfits} outfits across ${speciesMap.size} species`
  );
}
