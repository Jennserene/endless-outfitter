"use client";

import type { Ship } from "@/lib/models/ship";
import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import { formatContributionValue } from "@/lib/utils/ship-stats-accordion";
import { calculateMovementStats } from "@/lib/utils/movement-stats";
import {
  getMaxSpeedContributions,
  getAccelerationContributions,
  getTurningContributions,
} from "@/lib/utils/movement-contributions";
import { Accordion } from "@/components/ui/accordion";

interface MovementAccordionItemProps {
  ship: Ship;
  className?: string;
}

/**
 * Accordion item for movement stats (max speed, acceleration, turning).
 * Shows calculated movement stats and contributions from outfits affecting
 * thrust, turn, drag, and related attributes.
 */
export function MovementAccordionItem({
  ship,
  className,
}: MovementAccordionItemProps) {
  const attrs = ship.outfittedAttributes;
  const mass = ship.getOutfittedMass();
  const drag = attrs.drag;

  if (drag === undefined) return null;

  const movementStats = calculateMovementStats(attrs, mass, drag, true);

  // Check if there are any movement-related problems
  const movementProblems = ship.getMovementProblems();
  if (
    movementProblems.length > 0 ||
    !movementStats.hasThruster ||
    !movementStats.hasSteering
  ) {
    // Show error state - could create a separate error accordion item
    return null;
  }

  // Get base attributes (hull only, no outfits)
  const baseAttrs = ship.hullAttributes;
  const baseMass = baseAttrs.mass ?? 0;

  // Calculate actual contributions to each movement stat
  // These calculate the real effect on the final calculated values
  const maxSpeedContributions = getMaxSpeedContributions(ship, baseAttrs, drag);
  const accelerationContributions = getAccelerationContributions(
    ship,
    baseAttrs,
    baseMass
  );
  const turningContributions = getTurningContributions(
    ship,
    baseAttrs,
    baseMass
  );

  return (
    <Accordion type="multiple" className={className}>
      <ShipStatAccordionItem
        value="max-speed"
        label="max speed"
        stats={movementStats.maxSpeed}
        contributions={maxSpeedContributions}
        emptyMessage="No outfits affecting max speed"
        valueFormatter={(v) => formatContributionValue(v)}
      />
      <ShipStatAccordionItem
        value="acceleration"
        label="acceleration"
        stats={movementStats.acceleration}
        contributions={accelerationContributions}
        emptyMessage="No outfits affecting acceleration"
        valueFormatter={(v) => formatContributionValue(v)}
      />
      <ShipStatAccordionItem
        value="turning"
        label="turning"
        stats={movementStats.turning}
        contributions={turningContributions}
        emptyMessage="No outfits affecting turning"
        valueFormatter={(v) => formatContributionValue(v)}
      />
    </Accordion>
  );
}
