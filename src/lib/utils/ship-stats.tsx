"use client";

import { StatRow } from "@/components/ui/stat-row";
import type { Ship } from "@/lib/schemas/ship";
import type { StatConfig, CompositeStatConfig } from "@/lib/types/ship-stats";

/**
 * Renders a StatRow component if the stat value is defined and is a number.
 *
 * @param config - Stat configuration
 * @param attrs - Ship attributes
 * @returns React node or null if value is undefined or not a number
 */
export function renderStatIfDefined(
  config: StatConfig,
  attrs: Ship["attributes"]
): React.ReactNode {
  const value = attrs[config.key];
  if (value === undefined || typeof value !== "number") return null;

  const displayValue = config.formatter ? config.formatter(value) : value;

  return (
    <StatRow
      label={config.label}
      value={displayValue}
      unit={config.unit}
      className={config.className}
    />
  );
}

/**
 * Renders a composite stat that combines multiple attributes.
 *
 * @param config - Composite stat configuration
 * @param attrs - Ship attributes
 * @returns React node or null if no values are defined
 */
export function renderCompositeStat(
  config: CompositeStatConfig,
  attrs: Ship["attributes"]
): React.ReactNode {
  const hasAnyValue = config.keys.some(
    (key) => attrs[key] !== undefined && typeof attrs[key] === "number"
  );
  if (!hasAnyValue) return null;

  const values = config.keys.reduce(
    (acc, key) => {
      const value = attrs[key];
      acc[key] = typeof value === "number" ? value : undefined;
      return acc;
    },
    {} as Record<string, number | undefined>
  );

  return <StatRow label={config.label} value={config.formatter(values)} />;
}
