/**
 * Extract string value from various formats that the parser might produce.
 * Handles:
 * - Direct string values
 * - Objects with _value property
 * - Arrays (takes first element)
 * - Nested objects
 */
export function extractStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > 0) {
      return extractStringValue(value[0]);
    }
    return undefined;
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;

    // Check for _value property first (common parser pattern)
    if ("_value" in obj && typeof obj._value === "string") {
      return obj._value;
    }

    // Check for direct string properties
    for (const val of Object.values(obj)) {
      if (typeof val === "string") {
        return val;
      }
    }
  }

  return undefined;
}

/**
 * Extract string array from various formats.
 * Handles string, array of strings, array of objects, or object with string values.
 */
export function extractStringArray(value: unknown): string[] {
  const strings: string[] = [];

  if (typeof value === "string") {
    strings.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) {
      const extracted = extractStringValue(item);
      if (extracted !== undefined) {
        strings.push(extracted);
      }
    }
  } else if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    for (const val of Object.values(obj)) {
      const extracted = extractStringValue(val);
      if (extracted !== undefined) {
        strings.push(extracted);
      }
    }
  }

  return strings;
}
