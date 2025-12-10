import { extractLicenses } from "../utils/licenses";
import { extractDescriptions } from "../utils/descriptions";
import { extractStringValue } from "../utils/value-extraction";

/**
 * Transforms raw outfit data to match the Outfit schema.
 */
export class OutfitTransformer {
  private readonly knownFields = [
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
    "licenses",
  ];

  transform(raw: unknown): unknown {
    const outfit = raw as Record<string, unknown>;

    const attributes: Record<string, unknown> = {};
    const result: Record<string, unknown> = {
      name: outfit.name,
      plural: outfit.plural,
      category: outfit.category,
      series: outfit.series,
      index: typeof outfit.index === "number" ? outfit.index : undefined,
      cost: typeof outfit.cost === "number" ? outfit.cost : undefined,
      thumbnail:
        typeof outfit.thumbnail === "string"
          ? outfit.thumbnail
          : extractStringValue(outfit.thumbnail),
      mass: typeof outfit.mass === "number" ? outfit.mass : undefined,
      "outfit space":
        typeof outfit["outfit space"] === "number"
          ? outfit["outfit space"]
          : undefined,
    };

    // Handle licenses - convert to array of strings if present
    const licenses = extractLicenses(outfit.licenses);
    if (licenses) {
      attributes.licenses = licenses;
    }

    // Collect all other fields as dynamic attributes
    for (const [key, value] of Object.entries(outfit)) {
      if (!this.knownFields.includes(key) && key !== "attributes") {
        attributes[key] = value;
      }
    }

    result.attributes = attributes;

    // Collect descriptions
    result.descriptions = extractDescriptions(outfit.description);

    return result;
  }
}
