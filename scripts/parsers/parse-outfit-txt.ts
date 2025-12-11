import { parseIndentedFormat, nodesToObject } from "./game-data-parser";
import { parseItemTxt } from "./parse-item-txt";
import { GameDataPaths } from "./retrieve-game-data";
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
  parseItemTxt(
    "outfit",
    "outfit",
    parseOutfitData,
    RAW_OUTFIT_DIR,
    "outfits",
    GameDataPaths.OUTFITS
  );
}
