import { convertRawShipsToZod } from "../converters/ship-converter";
import type { Ship } from "@/lib/schemas/ship";
import { SHIPS_DIR, RAW_SHIP_DIR } from "../utils/paths";
import { BaseGenerator } from "./base-generator";

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
 */
export function generateShips(): void {
  const generator = new ShipGenerator();
  generator.execute();
}
