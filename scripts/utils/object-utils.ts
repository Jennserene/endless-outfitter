/**
 * Deep clone an object using JSON serialization.
 * Note: This method does not preserve functions, undefined values, or circular references.
 *
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge two objects, with source values overriding target values.
 * Nested objects are merged recursively, while arrays and primitives are replaced.
 *
 * @param target - The target object to merge into
 * @param source - The source object whose values will override target values
 * @returns A new merged object (target is not mutated)
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = deepClone(target);

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
