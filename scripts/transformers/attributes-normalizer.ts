import type { Transformer } from "../types";

/**
 * Normalizes the attributes block for ships.
 * Handles merging "add attributes", ensuring category exists, etc.
 */
export class AttributesNormalizer implements Transformer {
  transform(input: unknown): unknown {
    const ship = input as Record<string, unknown>;

    // Extract attributes block
    // Handle case where attributes might be a boolean (true) instead of an object
    let attributes: Record<string, unknown>;
    if (ship.attributes === true || ship.attributes === undefined) {
      attributes = {};
    } else if (
      typeof ship.attributes === "object" &&
      ship.attributes !== null
    ) {
      attributes = { ...(ship.attributes as Record<string, unknown>) };
    } else {
      attributes = {};
    }

    // Handle "add attributes" - add numeric values, replace others
    // Support both formats:
    // 1. "add attributes" (top-level format)
    // 2. "add" with _value === "attributes" (variant format from parser)
    let addAttributes: Record<string, unknown> | null = null;

    if (ship["add attributes"]) {
      const addAttrs = ship["add attributes"];
      if (typeof addAttrs === "object" && addAttrs !== null) {
        addAttributes = addAttrs as Record<string, unknown>;
      }
    } else if (ship.add && typeof ship.add === "object" && ship.add !== null) {
      const addData = ship.add as Record<string, unknown>;
      if (addData._value === "attributes") {
        addAttributes = { ...addData };
        delete addAttributes._value; // Remove internal parser value
      }
    }

    if (addAttributes) {
      for (const key in addAttributes) {
        const addValue = addAttributes[key];
        const existingValue = attributes[key];
        // If both are numbers, add them; otherwise replace
        if (typeof addValue === "number" && typeof existingValue === "number") {
          attributes[key] = existingValue + addValue;
        } else {
          attributes[key] = addValue;
        }
      }
    }

    // Category might be at the top level or in attributes
    // Ensure it's in attributes for the schema
    if (ship.category && !attributes.category) {
      attributes.category = ship.category;
    }

    // If category is still missing, provide a default
    if (!attributes.category) {
      attributes.category = "Unknown";
    }

    // Count gun ports and turret mounts from the gun and turret arrays
    // These are positional data that get collected as arrays
    // (Note: This is also done in ShipTransformer, but we keep it here as a fallback
    // in case the arrays are still available at this stage)
    if (Array.isArray(ship.gun) && attributes["gun ports"] === undefined) {
      attributes["gun ports"] = ship.gun.length;
    }
    if (
      Array.isArray(ship.turret) &&
      attributes["turret mounts"] === undefined
    ) {
      attributes["turret mounts"] = ship.turret.length;
    }

    return {
      ...ship,
      attributes,
    };
  }
}
