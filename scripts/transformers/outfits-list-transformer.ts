import type { Transformer } from "../types";

/**
 * Transforms outfits object to array format.
 */
export class OutfitsListTransformer implements Transformer {
  transform(input: unknown): unknown {
    const ship = input as Record<string, unknown>;

    const outfits: Array<{ name: string; quantity: number }> = [];
    if (ship.outfits) {
      const outfitObj = ship.outfits as Record<string, unknown>;
      for (const [name, value] of Object.entries(outfitObj)) {
        const quantity = typeof value === "number" ? value : 1;
        outfits.push({ name, quantity });
      }
    }

    return {
      ...ship,
      outfits,
    };
  }
}
