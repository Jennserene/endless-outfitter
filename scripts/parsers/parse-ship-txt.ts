import { parseIndentedFormat, nodesToObject } from "./game-data-parser";
import { parseItemTxt } from "./parse-item-txt";
import { GameDataPaths } from "./retrieve-game-data";
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
  parseItemTxt(
    "ship",
    "ship",
    parseShipData,
    RAW_SHIP_DIR,
    "ships",
    GameDataPaths.SHIPS
  );
}
