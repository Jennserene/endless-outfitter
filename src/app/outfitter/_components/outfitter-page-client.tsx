"use client";

import { Heading1, Paragraph } from "@/components/ui/typography";

export function OutfitterPageClient() {
  return (
    <main className="w-full py-8 px-4 md:px-8">
      <Heading1>Ship Outfitter</Heading1>
      <Paragraph className="text-muted-foreground mb-6">
        Select a ship and configure its outfits. The ship information will be
        displayed in the panel on the right.
      </Paragraph>
    </main>
  );
}
