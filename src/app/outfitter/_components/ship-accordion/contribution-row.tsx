"use client";

import { Span } from "@/components/ui/typography";
import type { StatContribution } from "@/lib/utils/ship-stats-accordion";
import { ContributionValue } from "./contribution-value";

interface ContributionRowProps {
  contribution: StatContribution;
  formatValue: (value: number) => string;
  showEach?: boolean;
}

/**
 * Displays a single contribution row with outfit name and value.
 */
export function ContributionRow({
  contribution,
  formatValue,
  showEach = true,
}: ContributionRowProps) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1">
      <Span className="shrink-0 min-w-0">
        {contribution.name}
        {contribution.quantity > 1 && (
          <span className="text-muted-foreground">
            {" "}
            x{contribution.quantity}
          </span>
        )}
      </Span>
      <ContributionValue
        contribution={contribution}
        formatValue={formatValue}
        showEach={showEach}
      />
    </div>
  );
}
