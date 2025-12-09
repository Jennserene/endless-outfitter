import { OutfitSchema, type Outfit } from "@/lib/schemas/outfit";
import { parseOutfitData } from "@/lib/parsers/game-data-parser";
import { z } from "zod";

/**
 * Convert raw outfit data to structured Outfit objects with Zod validation.
 */
export function convertOutfitsToZod(content: string): Outfit[] {
  const rawOutfits = parseOutfitData(content);
  const outfits: Outfit[] = [];

  for (const rawOutfit of rawOutfits) {
    try {
      const transformed = transformRawOutfit(rawOutfit);
      const outfit = OutfitSchema.parse(transformed);
      outfits.push(outfit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn(
          `Failed to parse outfit "${
            (rawOutfit as { name?: string }).name || "unknown"
          }":`,
          error.issues
        );
      } else {
        console.warn(`Error parsing outfit:`, error);
      }
    }
  }

  return outfits;
}

function transformRawOutfit(raw: unknown): unknown {
  const outfit = raw as Record<string, unknown>;

  // Separate known fields from dynamic attributes
  const knownFields = [
    "name",
    "plural",
    "category",
    "series",
    "index",
    "cost",
    "thumbnail",
    "mass",
    "outfit space",
    "description",
  ];
  const attributes: Record<string, unknown> = {};
  const result: Record<string, unknown> = {
    name: outfit.name,
    plural: outfit.plural,
    category: outfit.category,
    series: outfit.series,
    index: typeof outfit.index === "number" ? outfit.index : undefined,
    cost: typeof outfit.cost === "number" ? outfit.cost : undefined,
    thumbnail: outfit.thumbnail,
    mass: typeof outfit.mass === "number" ? outfit.mass : undefined,
    "outfit space":
      typeof outfit["outfit space"] === "number"
        ? outfit["outfit space"]
        : undefined,
  };

  // Collect all other fields as dynamic attributes
  for (const [key, value] of Object.entries(outfit)) {
    if (!knownFields.includes(key) && key !== "attributes") {
      attributes[key] = value;
    }
  }

  result.attributes = attributes;

  // Collect descriptions
  const descriptions: string[] = [];
  if (outfit.description) {
    descriptions.push(
      ...(Array.isArray(outfit.description)
        ? outfit.description
        : [outfit.description])
    );
  }
  result.descriptions = descriptions;

  return result;
}
