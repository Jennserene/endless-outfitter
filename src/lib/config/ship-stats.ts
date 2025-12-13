import { formatCredits } from "@/lib/utils/format";
import type { StatConfig, CompositeStatConfig } from "@/lib/types/ship-stats";

/**
 * Basic ship stats displayed in the outfitter panel.
 */
export const BASIC_STATS: StatConfig[] = [
  { key: "shields", label: "shields" },
  { key: "hull", label: "hull" },
  { key: "mass", label: "mass with no cargo", unit: "tons" },
  { key: "cargo space", label: "cargo space", unit: "tons" },
  { key: "fuel capacity", label: "fuel capacity" },
];

/**
 * Ship cost stat configuration with credit formatting.
 */
export const COST_STAT: StatConfig = {
  key: "cost",
  label: "cost",
  unit: "credits",
  formatter: formatCredits,
};

/**
 * Composite stat for required crew and bunks.
 */
export const CREW_STAT: CompositeStatConfig = {
  keys: ["required crew", "bunks"],
  label: "required crew / bunks",
  formatter: (values) =>
    `${values["required crew"] ?? 0} / ${values.bunks ?? 0}`,
};

/**
 * Outfit space related stats (outfit space, weapon capacity, engine capacity).
 */
export const OUTFIT_SPACE_STATS: StatConfig[] = [
  {
    key: "outfit space",
    label: "outfit space free",
    formatter: (value) => `${value} / ${value}`,
  },
  {
    key: "weapon capacity",
    label: "weapon capacity",
    formatter: (value) => `${value} / ${value}`,
    className: "pl-4",
  },
  {
    key: "engine capacity",
    label: "engine capacity",
    formatter: (value) => `${value} / ${value}`,
    className: "pl-4",
  },
];
