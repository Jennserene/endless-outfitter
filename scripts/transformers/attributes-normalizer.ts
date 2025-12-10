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

    // Handle "add attributes" - merge it into attributes
    if (ship["add attributes"]) {
      const addAttributes = ship["add attributes"];
      if (typeof addAttributes === "object" && addAttributes !== null) {
        Object.assign(attributes, addAttributes as Record<string, unknown>);
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

    return {
      ...ship,
      attributes,
    };
  }
}
