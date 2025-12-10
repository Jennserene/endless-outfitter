import { OutfitSchema, type Outfit } from "@/lib/schemas/outfit";
import { parseOutfitData } from "../parsers/parse-outfit-txt";
import { handleValidationError } from "../utils/error-handling";
import { OutfitTransformer } from "../transformers/outfit-transformer";

/**
 * Convert raw outfit data (from string) to structured Outfit objects with Zod validation.
 */
export function convertOutfitsToZod(content: string): Outfit[] {
  const rawOutfits = parseOutfitData(content);
  return convertRawOutfitsToZod(rawOutfits);
}

/**
 * Convert raw outfit objects (already parsed JSON) to structured Outfit objects with Zod validation.
 */
export function convertRawOutfitsToZod(
  rawOutfits: unknown[],
  species?: string
): Outfit[] {
  const transformer = new OutfitTransformer();
  const outfits: Outfit[] = [];

  for (const rawOutfit of rawOutfits) {
    try {
      const transformed = transformer.transform(rawOutfit);
      const outfit = OutfitSchema.parse(transformed);
      outfits.push(outfit);
    } catch (error) {
      const outfitName = (rawOutfit as { name?: string }).name || "unknown";
      handleValidationError(error, outfitName, "outfit", species);
    }
  }

  return outfits;
}
