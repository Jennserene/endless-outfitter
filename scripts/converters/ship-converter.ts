import { ShipSchema, type Ship } from "@/lib/schemas/ship";
import { parseShipData } from "../parsers/parse-ship-txt";
import {
  handleValidationError,
  ScriptError,
  ScriptErrorCode,
} from "../utils/error-handling";
import { ShipTransformer } from "../transformers/ship-transformer";
import { deepClone, deepMerge } from "../utils/object-utils";
import {
  isRecord,
  isString,
  isBaseShip,
  isVariant,
} from "../utils/type-guards";

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
  const baseShips = new Map<string, Record<string, unknown>>();

  // First pass: collect base ships
  for (const rawShip of rawShips) {
    if (!isRecord(rawShip)) {
      continue;
    }

    if (isBaseShip(rawShip)) {
      // This is a base ship - transform it and store
      try {
        const transformed = transformer.transform(rawShip);
        const validatedShip = ShipSchema.parse(transformed);
        const shipName = isString(rawShip.name) ? rawShip.name : "unknown";
        baseShips.set(
          shipName,
          validatedShip as unknown as Record<string, unknown>
        );
        ships.push(validatedShip);
      } catch (error) {
        const shipName = isString(rawShip.name) ? rawShip.name : "unknown";
        handleValidationError(error, shipName, "ship", species);
      }
    }
  }

  // Second pass: process variants (merge with base ship)
  for (const rawShip of rawShips) {
    if (!isRecord(rawShip)) {
      continue;
    }

    if (isVariant(rawShip)) {
      // This is a variant - find base ship and merge
      const baseShipName = isString(rawShip.baseShip)
        ? rawShip.baseShip
        : "unknown";
      const baseShip = baseShips.get(baseShipName);

      if (baseShip) {
        try {
          // Merge base ship with variant differences
          const merged = deepMerge(deepClone(baseShip), rawShip);

          // Remove baseShip and add references before transformation
          // The transformer chain (AttributesNormalizer) will handle "add attributes"
          delete merged.baseShip;
          delete merged.add;

          // Transform merged data
          const transformed = transformer.transform(merged);
          const validatedShip = ShipSchema.parse(transformed);
          ships.push(validatedShip);
        } catch (error) {
          const shipName = isString(rawShip.name) ? rawShip.name : "unknown";
          handleValidationError(error, shipName, "ship", species);
        }
      } else {
        // Base ship not found - this is an error condition
        const shipName = isString(rawShip.name) ? rawShip.name : "unknown";
        const error = new ScriptError(
          ScriptErrorCode.SHIP_VARIANT_MISSING_BASE,
          `Variant "${shipName}" references base ship "${baseShipName}" which was not found`,
          `This usually indicates a data parsing error or missing base ship definition. ` +
            `Ensure the base ship "${baseShipName}" is defined before its variant "${shipName}". ` +
            `Check the ship data files for missing or incorrectly named base ship definitions.`
        );

        // Log error but continue processing other ships to collect all errors
        // To fail fast on first error, uncomment the throw statement below
        console.error(`Error (${error.code}): ${error.message}`);
        if (error.actionable) {
          console.error(error.actionable);
        }
        // throw error; // Uncomment to fail fast on first missing base ship
      }
    }
  }

  return ships;
}
