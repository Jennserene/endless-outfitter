"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import { getCompositeStatAccordionProps } from "@/lib/utils/ship-stats-accordion";

interface CrewAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for crew stat (required crew / bunks) with outfit contributions.
 * Thin wrapper that calls utility functions and renders the generic component.
 */
export function CrewAccordionItem({ ship, className }: CrewAccordionItemProps) {
  const props = getCompositeStatAccordionProps(
    ship,
    ["required crew", "bunks"],
    "required crew / bunks",
    (values) => `${values["required crew"] ?? 0} / ${values.bunks ?? 0}`,
    "No outfits affecting crew",
    className
  );

  if (!props) return null;

  return <ShipStatAccordionItem {...props} />;
}
