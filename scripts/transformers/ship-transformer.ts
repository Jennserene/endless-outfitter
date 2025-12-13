import type { Transformer } from "../types";
import { AttributesNormalizer } from "./attributes-normalizer";
import { NumericNormalizer } from "./numeric-normalizer";
import { LicensesExtractor } from "./licenses-extractor";
import { OutfitsListTransformer } from "./outfits-list-transformer";
import { DescriptionsExtractor } from "./descriptions-extractor";
import { SpriteThumbnailExtractor } from "./sprite-thumbnail-extractor";
import { slugify } from "../utils/slug";
import { isRecord, isString } from "../utils/type-guards";

/**
 * Transforms raw ship data to match the Ship schema.
 * Chains multiple transformers in the correct order.
 */
export class ShipTransformer {
  private readonly transformers: Transformer[];

  constructor() {
    this.transformers = [
      new AttributesNormalizer(),
      new NumericNormalizer(),
      new LicensesExtractor(),
      new OutfitsListTransformer(),
      new DescriptionsExtractor(),
      new SpriteThumbnailExtractor(),
    ];
  }

  transform(raw: unknown): unknown {
    let result = raw;

    // Count gun ports and turret mounts BEFORE transformation
    // (they get removed during final extraction)
    if (isRecord(result)) {
      const gunCount = Array.isArray(result.gun)
        ? result.gun.length
        : undefined;
      const turretCount = Array.isArray(result.turret)
        ? result.turret.length
        : undefined;

      // Store counts in attributes so they're preserved through transformation
      if (gunCount !== undefined || turretCount !== undefined) {
        // Ensure attributes object exists
        if (!result.attributes || typeof result.attributes !== "object") {
          result.attributes = {};
        }
        const attrs = result.attributes as Record<string, unknown>;
        if (gunCount !== undefined) {
          attrs["gun ports"] = gunCount;
        }
        if (turretCount !== undefined) {
          attrs["turret mounts"] = turretCount;
        }
      }
    }

    for (const transformer of this.transformers) {
      result = transformer.transform(result);
    }

    // Extract only the fields needed for the schema
    if (!isRecord(result)) {
      throw new Error("Transform result must be a record");
    }

    const transformed = result;
    const name = isString(transformed.name) ? transformed.name : "";
    return {
      name,
      plural: transformed.plural,
      sprite: transformed.sprite,
      thumbnail: transformed.thumbnail,
      slug: slugify(name),
      attributes: transformed.attributes,
      outfits: transformed.outfits,
      descriptions: transformed.descriptions,
    };
  }
}
