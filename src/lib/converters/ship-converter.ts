import { ShipSchema, type Ship } from "@/lib/schemas/ship";
import { parseShipData } from "@/lib/parsers/game-data-parser";
import { z } from "zod";

/**
 * Convert raw ship data to structured Ship objects with Zod validation.
 */
export function convertShipsToZod(content: string): Ship[] {
  const rawShips = parseShipData(content);
  const ships: Ship[] = [];

  for (const rawShip of rawShips) {
    try {
      // Transform raw data to match schema
      const transformed = transformRawShip(rawShip);
      const ship = ShipSchema.parse(transformed);
      ships.push(ship);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn(
          `Failed to parse ship "${
            (rawShip as { name?: string }).name || "unknown"
          }":`,
          error.issues
        );
      } else {
        console.warn(`Error parsing ship:`, error);
      }
    }
  }

  return ships;
}

function transformRawShip(raw: unknown): unknown {
  const ship = raw as Record<string, unknown>;

  // Extract attributes block
  const attributes = (ship.attributes as Record<string, unknown>) || {};

  // Extract licenses (can be array or single value)
  if (attributes.licenses) {
    if (!Array.isArray(attributes.licenses)) {
      attributes.licenses = [attributes.licenses];
    }
  }

  // Transform outfits list
  const outfits: Array<{ name: string; quantity: number }> = [];
  if (ship.outfits) {
    const outfitObj = ship.outfits as Record<string, unknown>;
    for (const [name, value] of Object.entries(outfitObj)) {
      const quantity = typeof value === "number" ? value : 1;
      outfits.push({ name, quantity });
    }
  }

  // Transform positions
  const positions: unknown[] = [];
  ["engine", "gun", "turret", "bay", "leak", "explode"].forEach((type) => {
    const posData = ship[type];
    if (posData) {
      const posArray = Array.isArray(posData) ? posData : [posData];
      for (const pos of posArray) {
        if (typeof pos === "object" && pos !== null) {
          const posObj = pos as Record<string, unknown>;
          const position: Record<string, unknown> = { type };

          // Extract values array if present
          const values = (posObj._values as Array<string | number>) || [];

          // Handle different position types
          if (type === "engine") {
            // engine x y [thrust]
            if (values.length >= 2) {
              position.x = Number(values[0]) || 0;
              position.y = Number(values[1]) || 0;
              if (values.length >= 3) {
                position.z = Number(values[2]) || 0;
              }
            }
          } else if (type === "gun" || type === "turret") {
            // gun/turret x y "outfit name"
            if (values.length >= 2) {
              position.x = Number(values[0]) || 0;
              position.y = Number(values[1]) || 0;
              if (values.length >= 3) {
                position.outfit = String(values[2]);
              }
            }
          } else if (type === "bay") {
            // bay "type" x y [launch effect]
            if (values.length >= 3) {
              position.bayType = String(values[0]);
              position.x = Number(values[1]) || 0;
              position.y = Number(values[2]) || 0;
              if (posObj["launch effect"]) {
                position.launchEffect = String(posObj["launch effect"]);
              }
            }
          } else if (type === "leak") {
            // leak "effect" x y
            if (values.length >= 3) {
              position.effect = String(values[0]);
              position.x = Number(values[1]) || 0;
              position.y = Number(values[2]) || 0;
            }
          } else if (type === "explode") {
            // explode "effect" count
            if (values.length >= 2) {
              position.effect = String(values[0]);
              position.count = Number(values[1]) || 0;
            }
          }

          positions.push(position);
        }
      }
    }
  });

  // Handle "final explode" separately
  if (ship["final explode"]) {
    positions.push({
      type: "final explode",
      effect: ship["final explode"],
    });
  }

  // Collect descriptions
  const descriptions: string[] = [];
  if (ship.description) {
    descriptions.push(
      ...(Array.isArray(ship.description)
        ? ship.description
        : [ship.description])
    );
  }

  return {
    name: ship.name,
    plural: ship.plural,
    sprite: ship.sprite,
    thumbnail: ship.thumbnail,
    attributes,
    outfits,
    positions,
    descriptions,
  };
}
