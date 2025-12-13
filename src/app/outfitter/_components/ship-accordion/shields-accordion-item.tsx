"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import {
  getStatContributionsData,
  formatContributionValue,
  formatStatValue,
  sortContributionsByValue,
} from "@/lib/utils/ship-stats-accordion";
import type { StatContribution } from "@/lib/utils/ship-stats-accordion";

interface ShieldsAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for shields stat with outfit contributions.
 * Shows contributions from both "shields" (capacity) and shield-related attributes
 * like "shield generation", "shield energy", etc.
 */
export function ShieldsAccordionItem({
  ship,
  className,
}: ShieldsAccordionItemProps) {
  const attrs = ship.outfittedAttributes;
  const shieldsValue = attrs.shields;

  if (shieldsValue === undefined) return null;

  // Get contributions from multiple shield-related attributes
  const shieldRelatedKeys = [
    "shields",
    "shield generation",
    "delayed shield generation",
    "shield generation multiplier",
    "shield energy",
    "delayed shield energy",
    "shield energy multiplier",
  ];

  // Combine contributions from all shield-related attributes
  // Track which stat keys are per-second (regeneration rates)
  const perSecondKeys = new Set([
    "shield generation",
    "delayed shield generation",
    "shield generation multiplier",
  ]);

  const allContributions = new Map<string, StatContribution>();

  for (const statKey of shieldRelatedKeys) {
    const contributions = getStatContributionsData(ship, statKey);
    for (const contrib of contributions) {
      const existing = allContributions.get(contrib.slug);
      if (existing) {
        existing.quantity += contrib.quantity;
        existing.value += contrib.value;
        // If any contribution is per-second, mark the combined one as per-second
        // Keep the first per-second statKey found
        if (perSecondKeys.has(statKey) && !existing.statKey) {
          existing.statKey = statKey;
        }
      } else {
        allContributions.set(contrib.slug, { ...contrib });
      }
    }
  }

  const contributions = sortContributionsByValue(
    Array.from(allContributions.values())
  );

  const formattedValue = formatStatValue(shieldsValue, "shields", attrs);

  return (
    <ShipStatAccordionItem
      value="shields"
      label="shields"
      stats={formattedValue}
      contributions={contributions}
      emptyMessage="No outfits affecting shields"
      className={className}
      valueFormatter={(v) => formatContributionValue(v, "shields")}
    />
  );
}
