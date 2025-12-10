import { extractStringArray } from "./value-extraction";

/**
 * Extract licenses from various formats and return as array of strings.
 * Returns undefined if no valid licenses found.
 */
export function extractLicenses(licenses: unknown): string[] | undefined {
  if (!licenses) {
    return undefined;
  }

  const licenseStrings = extractStringArray(licenses);
  return licenseStrings.length > 0 ? licenseStrings : undefined;
}
