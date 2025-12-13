import type { Ship, ExtendedAttributes } from "@/lib/models/ship";
import { formatCredits, formatNumber } from "@/lib/utils/format";

/**
 * Contribution item for displaying outfit contributions to a stat.
 */
export interface StatContribution {
  name: string;
  slug: string;
  quantity: number;
  value: number;
  statKey?: string; // The stat key this contribution came from (for per-second indicators)
}

/**
 * Sorts contributions by value: positive values first (largest first),
 * then negative values (most negative/furthest from 0 first).
 *
 * Note: Uses the total contribution value (item.value), not the individual
 * per-item value. For items with quantity > 1, this is the sum across all items.
 *
 * @param contributions - Array of contributions to sort
 * @returns Sorted array of contributions
 */
export function sortContributionsByValue(
  contributions: StatContribution[]
): StatContribution[] {
  return [...contributions].sort((a, b) => {
    // Sort by total value (a.value and b.value are already totals, not per-item)
    // Both positive: larger total first
    if (a.value > 0 && b.value > 0) {
      return b.value - a.value;
    }
    // Both negative: more negative total (smaller) first
    if (a.value < 0 && b.value < 0) {
      return a.value - b.value;
    }
    // One positive, one negative: positive first
    if (a.value > 0 && b.value < 0) return -1;
    if (a.value < 0 && b.value > 0) return 1;
    // Both zero: sort by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Props needed for a stat accordion item.
 */
export interface StatAccordionProps {
  value: string;
  label: string;
  stats: string;
  contributions: StatContribution[];
  emptyMessage: string;
  className?: string;
}

/**
 * Formats a stat value for display based on the stat key.
 *
 * @param value - The stat value
 * @param statKey - The stat key (e.g., "shields", "hull", "mass")
 * @param attrs - Extended attributes for context (e.g., for composite stats)
 * @returns Formatted string value
 */
export function formatStatValue(
  value: number,
  statKey: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _attrs?: ExtendedAttributes
): string {
  switch (statKey) {
    case "cost":
      return formatCredits(value);
    case "mass":
    case "cargo space":
      return `${formatNumber(value)} tons`;
    case "fuel capacity":
      return formatNumber(value);
    case "shields":
    case "hull":
      return formatNumber(value);
    case "required crew":
    case "bunks":
      return formatNumber(value);
    default:
      return String(value);
  }
}

/**
 * Formats a contribution value for display (with +/- sign).
 * For contributions, we show just the number with sign, not full formatting with units.
 * Rounds to 2 decimal places to avoid floating point precision issues.
 *
 * @param value - The contribution value (can be positive or negative)
 * @param statKey - The stat key for context (optional, for future use)
 * @returns Formatted string with sign (e.g., "+25", "-10", "+24.00")
 */
export function formatContributionValue(
  value: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _statKey?: string
): string {
  // Round to 2 decimal places to avoid floating point precision issues
  const rounded = Math.round(value * 100) / 100;

  // For contributions, show just the number with sign, no units
  // Units are shown in the main stat value, not in contributions
  if (rounded === 0) return "0";

  const sign = rounded > 0 ? "+" : "";
  // Format with up to 2 decimal places, removing trailing zeros
  const formatted = rounded.toFixed(2).replace(/\.?0+$/, "");
  return `${sign}${formatted}`;
}

/**
 * Gets stat contributions data from a ship for a specific stat.
 *
 * @param ship - The ship instance
 * @param statKey - The stat key to get contributions for
 * @returns Array of contribution items
 */
export function getStatContributionsData(
  ship: Ship,
  statKey: string
): StatContribution[] {
  const contributions = ship.getStatContributions(statKey);
  return contributions.map(({ outfit, quantity, value }) => ({
    name: outfit.name,
    slug: outfit.slug,
    quantity,
    value,
    statKey,
  }));
}

/**
 * Gets all props needed for a stat accordion item.
 *
 * @param ship - The ship instance
 * @param statKey - The stat key
 * @param label - The display label for the stat
 * @param defaultValue - Default value if stat is not defined
 * @param emptyMessage - Message to show when no contributions
 * @param className - Optional CSS class
 * @returns Props for the accordion item, or null if stat is not defined
 */
export function getStatAccordionProps(
  ship: Ship,
  statKey: string,
  label: string,
  defaultValue?: number,
  emptyMessage: string = `No outfits affecting ${label}`,
  className?: string
): StatAccordionProps | null {
  const attrs = ship.outfittedAttributes;
  const value =
    (attrs[statKey as keyof typeof attrs] as number | undefined) ??
    defaultValue;

  if (value === undefined) {
    return null;
  }

  const contributions = sortContributionsByValue(
    getStatContributionsData(ship, statKey)
  );
  const formattedValue = formatStatValue(value, statKey, attrs);

  return {
    value: statKey,
    label,
    stats: formattedValue,
    contributions,
    emptyMessage,
    className,
  };
}

/**
 * Gets props for a capacity stat accordion (shows "free / total" format).
 *
 * @param ship - The ship instance
 * @param statKey - The stat key (e.g., "outfit space", "weapon capacity")
 * @param label - The display label
 * @param getFreeValue - Function to get the free/remaining value
 * @param emptyMessage - Message to show when no contributions
 * @param className - Optional CSS class
 * @returns Props for the accordion item, or null if stat is not defined
 */
export function getCapacityAccordionProps(
  ship: Ship,
  statKey: string,
  label: string,
  getFreeValue: (ship: Ship) => number | undefined,
  emptyMessage: string = `No outfits affecting ${label}`,
  className?: string
): StatAccordionProps | null {
  const attrs = ship.outfittedAttributes;
  const total = attrs[statKey as keyof typeof attrs] as number | undefined;
  const free = getFreeValue(ship);

  if (total === undefined || free === undefined) {
    return null;
  }

  const contributions = getStatContributionsData(ship, statKey);
  const formattedValue = `${free} / ${total}`;

  return {
    value: statKey,
    label,
    stats: formattedValue,
    contributions,
    emptyMessage,
    className,
  };
}

/**
 * Gets props for a composite stat accordion (e.g., crew / bunks).
 *
 * @param ship - The ship instance
 * @param statKeys - Array of stat keys to combine
 * @param label - The display label
 * @param formatter - Function to format the combined values
 * @param emptyMessage - Message to show when no contributions
 * @param className - Optional CSS class
 * @returns Props for the accordion item, or null if no values are defined
 */
export function getCompositeStatAccordionProps(
  ship: Ship,
  statKeys: string[],
  label: string,
  formatter: (values: Record<string, number>) => string,
  emptyMessage: string = `No outfits affecting ${label}`,
  className?: string
): StatAccordionProps | null {
  const attrs = ship.outfittedAttributes;
  const values: Record<string, number> = {};

  for (const key of statKeys) {
    const value = attrs[key as keyof typeof attrs] as number | undefined;
    if (value !== undefined) {
      values[key] = value;
    }
  }

  if (Object.keys(values).length === 0) {
    return null;
  }

  // Get contributions for all stat keys
  const allContributions = new Map<string, StatContribution>();

  for (const statKey of statKeys) {
    const contributions = getStatContributionsData(ship, statKey);
    for (const contribution of contributions) {
      const existing = allContributions.get(contribution.slug);
      if (existing) {
        existing.quantity += contribution.quantity;
        existing.value += contribution.value;
      } else {
        allContributions.set(contribution.slug, { ...contribution });
      }
    }
  }

  const contributions = sortContributionsByValue(
    Array.from(allContributions.values())
  );

  return {
    value: statKeys.join("-"),
    label,
    stats: formatter(values),
    contributions,
    emptyMessage,
    className,
  };
}
