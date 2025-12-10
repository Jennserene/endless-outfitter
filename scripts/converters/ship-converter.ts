import { ShipSchema, type Ship } from "@/lib/schemas/ship";
import { parseShipData } from "../parsers/parse-ship-txt";
import { handleValidationError } from "../utils/error-handling";
import { ShipTransformer } from "../transformers/ship-transformer";

/**
 * Convert raw ship data (from string) to structured Ship objects with Zod validation.
 */
export function convertShipsToZod(content: string): Ship[] {
  const rawShips = parseShipData(content);
  return convertRawShipsToZod(rawShips);
}

/**
 * Convert raw ship objects (already parsed JSON) to structured Ship objects with Zod validation.
 */
export function convertRawShipsToZod(
  rawShips: unknown[],
  species?: string
): Ship[] {
  const transformer = new ShipTransformer();
  const ships: Ship[] = [];

  for (const rawShip of rawShips) {
    try {
      // Transform raw data to match schema
      const transformed = transformer.transform(rawShip);
      const ship = ShipSchema.parse(transformed);
      ships.push(ship);
    } catch (error) {
      const shipName = (rawShip as { name?: string }).name || "unknown";
      handleValidationError(error, shipName, "ship", species);
    }
  }

  return ships;
}
