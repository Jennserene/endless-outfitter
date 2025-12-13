"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heading2, Paragraph } from "@/components/ui/typography";

/**
 * Error boundary for the outfitter route.
 * Catches errors in the outfitter route segment and displays fallback UI.
 */
export default function OutfitterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Outfitter page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Heading2 className="text-2xl font-bold mb-4">
          Something went wrong!
        </Heading2>
        <Paragraph className="text-muted-foreground mb-4">
          {error.message}
        </Paragraph>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
