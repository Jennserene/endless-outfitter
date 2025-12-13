"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import {
  getStatAccordionProps,
  formatContributionValue,
} from "@/lib/utils/ship-stats-accordion";

interface HullAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for hull stat with outfit contributions.
 * Thin wrapper that calls utility functions and renders the generic component.
 */
export function HullAccordionItem({ ship, className }: HullAccordionItemProps) {
  const props = getStatAccordionProps(
    ship,
    "hull",
    "hull",
    undefined,
    "No outfits affecting hull",
    className
  );

  if (!props) return null;

  return (
    <ShipStatAccordionItem
      {...props}
      valueFormatter={(v) => formatContributionValue(v, "hull")}
    />
  );
}
