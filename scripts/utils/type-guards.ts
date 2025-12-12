/**
 * Type guard to check if a value is a record (plain object)
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor === Object
  );
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isNonNullObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a ship-like object with a name
 */
export function isShipLike(value: unknown): value is {
  name: unknown;
  [key: string]: unknown;
} {
  return isRecord(value) && "name" in value;
}

/**
 * Type guard to check if a ship-like object has a baseShip property (variant)
 */
export function isVariant(
  value: unknown
): value is { baseShip: unknown; name: unknown; [key: string]: unknown } {
  return isShipLike(value) && "baseShip" in value;
}

/**
 * Type guard to check if a ship-like object is a base ship (not a variant)
 */
export function isBaseShip(
  value: unknown
): value is { name: unknown; [key: string]: unknown } {
  return isShipLike(value) && !("baseShip" in value);
}
