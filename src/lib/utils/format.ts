/**
 * Format a number with appropriate precision.
 * Numbers >= 1000 are formatted with no decimal places.
 * Numbers < 1000 are formatted with up to 2 decimal places.
 *
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format a credit value (currency).
 * Credits are always formatted with no decimal places.
 *
 * @param value - The credit value to format
 * @returns Formatted credit string
 */
export function formatCredits(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
