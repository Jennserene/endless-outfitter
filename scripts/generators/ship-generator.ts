import { convertRawShipsToZod } from "../converters/ship-converter";
import type { Ship } from "@/lib/schemas/ship";
import { SHIPS_DIR, RAW_SHIP_DIR } from "../utils/paths";
import { BaseGenerator } from "./base-generator";
import type { FileContentCache } from "../utils/file-io";

/**
 * Generator for ships data files
 */
class ShipGenerator extends BaseGenerator<Ship> {
  constructor() {
    super(convertRawShipsToZod, RAW_SHIP_DIR, SHIPS_DIR, "ships", "ships");
  }
}

/**
 * Generate ships.json files (one per species) from raw JSON
 * Reads from .data/raw/ships/ and converts to validated Zod types
 *
 * @param existingFileCache - Optional cache of existing file contents to compare against
 */
export function generateShips(existingFileCache?: FileContentCache): void {
  const generator = new ShipGenerator();
  if (existingFileCache) {
    generator.setExistingFileCache(existingFileCache);
  }
  generator.execute();
}
