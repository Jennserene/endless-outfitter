"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { StatContribution } from "@/lib/utils/ship-stats-accordion";
import { ContributionRow } from "./contribution-row";

export interface ShipStatAccordionItemProps {
  value: string;
  label: string;
  stats: string | React.ReactNode;
  contributions: StatContribution[];
  emptyMessage: string;
  className?: string;
  valueFormatter?: (value: number) => string;
  showEach?: boolean;
}

/**
 * Generic accordion item for displaying ship stats with outfit contributions.
 * This is a presentation-only component - all data should be pre-formatted.
 */
export function ShipStatAccordionItem({
  value,
  label,
  stats,
  contributions,
  emptyMessage,
  className,
  valueFormatter,
  showEach = true,
}: ShipStatAccordionItemProps) {
  const formatValue = valueFormatter || ((v: number) => String(v));

  return (
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger
        className={cn(
          "text-sm pt-0 pb-1 font-normal text-muted-foreground [&>svg]:text-muted-foreground select-text",
          className
        )}
      >
        <div className="flex justify-between items-center w-full pr-4">
          <span className="font-medium">{label}</span>
          <span className="text-foreground">{stats}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {contributions.length > 0 ? (
          <div className="space-y-1 pl-4 text-sm">
            {contributions.map((contribution) => (
              <ContributionRow
                key={contribution.slug}
                contribution={contribution}
                formatValue={formatValue}
                showEach={showEach}
              />
            ))}
          </div>
        ) : (
          <div className="pl-4 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
