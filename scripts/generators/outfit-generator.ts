import { convertRawOutfitsToZod } from "../converters/outfit-converter";
import type { Outfit } from "@/lib/schemas/outfit";
import { OUTFITS_DIR, RAW_OUTFIT_DIR } from "../utils/paths";
import { BaseGenerator } from "./base-generator";

/**
 * Generator for outfits data files
 */
class OutfitGenerator extends BaseGenerator<Outfit> {
  constructor() {
    super(
      convertRawOutfitsToZod,
      RAW_OUTFIT_DIR,
      OUTFITS_DIR,
      "outfits",
      "outfits"
    );
  }
}

/**
 * Generate outfits.json files (one per species) from raw JSON
 * Reads from .data/raw/outfits/ and converts to validated Zod types
 */
export function generateOutfits(): void {
  const generator = new OutfitGenerator();
  generator.execute();
}
