"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Displays "p/s" (per second) with a tooltip explaining it means "per second".
 * Reusable component for showing per-second rates in stat displays.
 */
export function PerSecond() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted decoration-muted-foreground underline-offset-2">
          p/s
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        onPointerEnter={() => {
          // Dismiss tooltip when mouse enters the content
          setOpen(false);
        }}
        sideOffset={2}
      >
        <p>per second</p>
      </TooltipContent>
    </Tooltip>
  );
}
