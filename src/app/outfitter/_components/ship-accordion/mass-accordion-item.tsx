"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import {
  getStatAccordionProps,
  formatContributionValue,
} from "@/lib/utils/ship-stats-accordion";

interface MassAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for mass stat with outfit contributions.
 * Thin wrapper that calls utility functions and renders the generic component.
 */
export function MassAccordionItem({ ship, className }: MassAccordionItemProps) {
  const props = getStatAccordionProps(
    ship,
    "mass",
    "mass with no cargo",
    undefined,
    "No outfits affecting mass",
    className
  );

  if (!props) return null;

  return (
    <ShipStatAccordionItem
      {...props}
      valueFormatter={(v) => formatContributionValue(v, "mass")}
    />
  );
}
