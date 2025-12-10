/**
 * Normalize a numeric value from various formats.
 * Handles:
 * - Numbers (returns as-is)
 * - Strings (converts to number if valid)
 * - Objects with _value property (extracts and converts)
 * - Invalid values (returns undefined)
 */
export function normalizeNumeric(value: unknown): number | undefined {
  if (typeof value === "number") {
    return isNaN(value) || !isFinite(value) ? undefined : value;
  }

  if (typeof value === "string") {
    const numValue = Number(value);
    return isNaN(numValue) || !isFinite(numValue) ? undefined : numValue;
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if ("_value" in obj) {
      const numValue = Number(obj._value);
      return isNaN(numValue) || !isFinite(numValue) ? undefined : numValue;
    }
  }

  return undefined;
}

/**
 * Normalize numeric attributes in an attributes object.
 * Returns a new object with normalized numeric values, removing invalid ones.
 */
export function normalizeNumericAttributes(
  attributes: Record<string, unknown>,
  numericKeys: readonly string[]
): Record<string, unknown> {
  const normalized = { ...attributes };
  for (const key of numericKeys) {
    if (normalized[key] !== undefined) {
      const normalizedValue = normalizeNumeric(normalized[key]);
      if (normalizedValue !== undefined) {
        normalized[key] = normalizedValue;
      } else {
        // Remove invalid numeric values
        delete normalized[key];
      }
    }
  }
  return normalized;
}
