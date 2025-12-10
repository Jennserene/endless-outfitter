import type { Transformer } from "../types";
import { AttributesNormalizer } from "./attributes-normalizer";
import { NumericNormalizer } from "./numeric-normalizer";
import { LicensesExtractor } from "./licenses-extractor";
import { OutfitsListTransformer } from "./outfits-list-transformer";
import { DescriptionsExtractor } from "./descriptions-extractor";
import { SpriteThumbnailExtractor } from "./sprite-thumbnail-extractor";

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

    for (const transformer of this.transformers) {
      result = transformer.transform(result);
    }

    // Extract only the fields needed for the schema
    const transformed = result as Record<string, unknown>;
    return {
      name: transformed.name,
      plural: transformed.plural,
      sprite: transformed.sprite,
      thumbnail: transformed.thumbnail,
      attributes: transformed.attributes,
      outfits: transformed.outfits,
      descriptions: transformed.descriptions,
    };
  }
}
