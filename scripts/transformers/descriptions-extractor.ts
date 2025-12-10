import { extractDescriptions } from "../utils/descriptions";
import type { Transformer } from "../types";

/**
 * Extracts descriptions from various formats.
 */
export class DescriptionsExtractor implements Transformer {
  transform(input: unknown): unknown {
    const item = input as Record<string, unknown>;
    const descriptions = extractDescriptions(item.description);

    return {
      ...item,
      descriptions,
    };
  }
}
