"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import {
  getStatAccordionProps,
  formatContributionValue,
} from "@/lib/utils/ship-stats-accordion";

interface FuelAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for fuel capacity stat with outfit contributions.
 * Thin wrapper that calls utility functions and renders the generic component.
 */
export function FuelAccordionItem({ ship, className }: FuelAccordionItemProps) {
  const props = getStatAccordionProps(
    ship,
    "fuel capacity",
    "fuel capacity",
    undefined,
    "No outfits affecting fuel capacity",
    className
  );

  if (!props) return null;

  return (
    <ShipStatAccordionItem
      {...props}
      valueFormatter={(v) => formatContributionValue(v, "fuel capacity")}
    />
  );
}
