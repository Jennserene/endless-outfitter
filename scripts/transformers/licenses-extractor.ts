import { extractLicenses } from "../utils/licenses";
import type { Transformer } from "../types";

/**
 * Extracts and normalizes licenses from attributes.
 */
export class LicensesExtractor implements Transformer {
  transform(input: unknown): unknown {
    const item = input as Record<string, unknown>;
    const attributes = item.attributes as Record<string, unknown> | undefined;

    if (!attributes) {
      return item;
    }

    const licenses = extractLicenses(attributes.licenses);
    if (licenses) {
      attributes.licenses = licenses;
    } else if (attributes.licenses !== undefined) {
      // Remove invalid licenses (object that couldn't be converted to array)
      delete attributes.licenses;
    }

    return item;
  }
}
