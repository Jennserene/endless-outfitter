import { parseIndentedFormat, nodesToObject } from "./game-data-parser";
import { parseItemTxt } from "./parse-item-txt";
import { GameDataPaths } from "./retrieve-game-data";
import { RAW_SHIP_DIR } from "../utils/paths";
import { isString } from "../utils/type-guards";
import type { ParseNode } from "../types/parser";

/**
 * Determines if a ship node is a variant.
 * A variant is identified by having a _value child (second parameter) AND
 * the ship name already exists as a base ship name.
 *
 * @param node - The parse node to check
 * @param baseShipNames - Set of known base ship names
 * @returns True if this node represents a variant
 */
function isVariantNode(node: ParseNode, baseShipNames: Set<string>): boolean {
  if (node.key !== "ship" || !isString(node.value)) {
    return false;
  }

  const valueChildren = node.children.filter((c) => c.key === "_value");
  const hasValueChild = valueChildren.length > 0;
  const isKnownBaseShip = baseShipNames.has(node.value);

  // A variant has a _value child (display name) AND the ship name matches a base ship
  return hasValueChild && isKnownBaseShip;
}

/**
 * Extracts the display name from a ship node.
 * For base ships, this is the ship name itself.
 * For variants, this is the _value child (the second parameter).
 *
 * @param node - The parse node
 * @param shipName - The ship name from the node value
 * @returns The display name to use
 */
function extractDisplayName(node: ParseNode, shipName: string): string {
  const valueChildren = node.children.filter((c) => c.key === "_value");

  if (valueChildren.length > 0) {
    const firstValueChild = valueChildren[0];
    return isString(firstValueChild.value) ? firstValueChild.value : shipName;
  }

  return shipName;
}

/**
 * Creates a variant object with only the differences from the base ship.
 * Includes sprite, thumbnail, add blocks, and any other differing fields.
 *
 * @param displayName - The display name for the variant
 * @param baseShipName - The name of the base ship this variant extends
 * @param shipObj - The parsed ship object containing all fields
 * @returns A variant object with only differences
 */
function createVariantObject(
  displayName: string,
  baseShipName: string,
  shipObj: Record<string, unknown>
): Record<string, unknown> {
  const variant: Record<string, unknown> = {
    name: displayName,
    baseShip: baseShipName,
  };

  // Fields that should be included if present (usually differ from base)
  const variantFields = ["sprite", "thumbnail", "add"];

  for (const field of variantFields) {
    if (shipObj[field]) {
      variant[field] = shipObj[field];
    }
  }

  // Include any other fields that differ (engine, gun, turret, etc.)
  // Exclude fields that are handled separately or should not be in variants
  const excludedFields = new Set([
    "name",
    "sprite",
    "thumbnail",
    "add",
    "attributes",
    "outfits",
    "descriptions",
  ]);

  for (const key in shipObj) {
    if (!excludedFields.has(key)) {
      variant[key] = shipObj[key];
    }
  }

  return variant;
}

/**
 * Parse ship data from game data format.
 * Variants only store differences from the base ship.
 *
 * Algorithm:
 * 1. First pass: Identify base ships (those without a _value child)
 * 2. Second pass: Process all ships, creating base ships or variants
 */
export function parseShipData(content: string): unknown[] {
  const nodes = parseIndentedFormat(content);
  const ships: unknown[] = [];
  const baseShipNames = new Set<string>();

  // First pass: identify base ships (those without a second parameter/_value child)
  for (const node of nodes) {
    if (node.key === "ship" && isString(node.value)) {
      const valueChildren = node.children.filter((c) => c.key === "_value");
      const hasValueChild = valueChildren.length > 0;

      // Base ships don't have a _value child
      if (!hasValueChild) {
        baseShipNames.add(node.value);
      }
    }
  }

  // Second pass: process all ships (base ships and variants)
  for (const node of nodes) {
    if (node.key === "ship" && isString(node.value)) {
      const shipName = node.value;
      const displayName = extractDisplayName(node, shipName);
      const shipObj = nodesToObject(node.children, []) as Record<
        string,
        unknown
      >;

      if (isVariantNode(node, baseShipNames)) {
        // This is a variant - only store what's different from the base ship
        const variant = createVariantObject(displayName, shipName, shipObj);
        ships.push(variant);
      } else {
        // This is a base ship - store full data
        ships.push({
          name: displayName,
          ...shipObj,
        });
      }
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
