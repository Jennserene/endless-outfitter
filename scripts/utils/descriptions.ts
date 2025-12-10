import { extractStringValue } from "./value-extraction";

/**
 * Extract descriptions from various formats.
 * Handles string, array of strings, or objects with _value properties.
 */
export function extractDescriptions(description: unknown): string[] {
  const descriptions: string[] = [];

  if (!description) {
    return descriptions;
  }

  // Handle array or single value
  const descriptionArray = Array.isArray(description)
    ? description
    : [description];

  for (const desc of descriptionArray) {
    const extracted = extractStringValue(desc);
    if (extracted !== undefined) {
      descriptions.push(extracted);
    }
  }

  return descriptions;
}
