"use client";

import { useState } from "react";
import { Span } from "@/components/ui/typography";
import { PerSecond } from "@/components/ui/per-second";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StatContribution } from "@/lib/utils/ship-stats-accordion";

/**
 * Stat keys that represent per-second rates.
 */
const PER_SECOND_STAT_KEYS = new Set([
  "shield generation",
  "delayed shield generation",
  "shield generation multiplier",
  "hull repair rate",
  "delayed hull repair rate",
  "hull repair multiplier",
]);

interface ContributionValueProps {
  contribution: StatContribution;
  formatValue: (value: number) => string;
  showEach?: boolean;
}

/**
 * Displays the contribution value with proper formatting, colors, and per-second indicators.
 * Handles both single and multiple quantity cases.
 */
export function ContributionValue({
  contribution,
  formatValue,
  showEach = true,
}: ContributionValueProps) {
  const isPerSecond =
    contribution.statKey !== undefined &&
    PER_SECOND_STAT_KEYS.has(contribution.statKey);

  const valueClassName =
    contribution.value < 0
      ? "text-destructive"
      : "text-green-600 dark:text-green-400";

  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (contribution.quantity > 1 && showEach) {
    const individualValue = contribution.value / contribution.quantity;

    return (
      <div className="shrink-0 ml-auto text-right">
        <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground cursor-help">
              ({formatValue(individualValue)})
            </span>
          </TooltipTrigger>
          <TooltipContent
            onPointerEnter={() => {
              // Dismiss tooltip when mouse enters the content
              setTooltipOpen(false);
            }}
            sideOffset={2}
          >
            <p>{formatValue(individualValue)} each</p>
          </TooltipContent>
        </Tooltip>
        <Span className={valueClassName}>
          {" "}
          {formatValue(contribution.value)}
          {isPerSecond && (
            <span className="ml-1">
              <PerSecond />
            </span>
          )}
        </Span>
      </div>
    );
  }

  return (
    <Span className={`shrink-0 ml-auto text-right ${valueClassName}`}>
      {formatValue(contribution.value)}
      {isPerSecond && (
        <span className="ml-1">
          <PerSecond />
        </span>
      )}
    </Span>
  );
}
