"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import {
  getStatAccordionProps,
  formatContributionValue,
} from "@/lib/utils/ship-stats-accordion";

interface CargoAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for cargo space stat with outfit contributions.
 * Thin wrapper that calls utility functions and renders the generic component.
 */
export function CargoAccordionItem({
  ship,
  className,
}: CargoAccordionItemProps) {
  const props = getStatAccordionProps(
    ship,
    "cargo space",
    "cargo space",
    undefined,
    "No outfits affecting cargo space",
    className
  );

  if (!props) return null;

  return (
    <ShipStatAccordionItem
      {...props}
      valueFormatter={(v) => formatContributionValue(v, "cargo space")}
    />
  );
}
