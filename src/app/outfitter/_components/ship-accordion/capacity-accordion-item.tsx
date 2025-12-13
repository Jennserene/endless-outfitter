"use client";

import { ShipStatAccordionItem } from "./ship-stat-accordion-item";
import { formatContributionValue } from "@/lib/utils/ship-stats-accordion";

interface CapacityAccordionItemProps {
  value: string;
  label: string;
  stats: string;
  usage: Array<{
    name: string;
    slug: string;
    quantity: number;
    value: number;
  }>;
  emptyMessage: string;
  className?: string;
  showEach?: boolean;
}

/**
 * Capacity accordion item for outfit space, weapon capacity, and engine capacity.
 * Uses the generic ShipStatAccordionItem with capacity-specific formatting.
 * Maintains backward compatibility with existing API.
 */
export function CapacityAccordionItem({
  value,
  label,
  stats,
  usage,
  emptyMessage,
  className,
  showEach = true,
}: CapacityAccordionItemProps) {
  // Transform usage data to contributions format
  const contributions = usage.map((item) => ({
    name: item.name,
    slug: item.slug,
    quantity: item.quantity,
    value: item.value,
  }));

  return (
    <ShipStatAccordionItem
      value={value}
      label={label}
      stats={stats}
      contributions={contributions}
      emptyMessage={emptyMessage}
      className={className}
      valueFormatter={(v) => formatContributionValue(v)}
      showEach={showEach}
    />
  );
}
