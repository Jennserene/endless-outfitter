import type { Metadata } from "next";
import { OutfitterPageClient } from "./_components/outfitter-page-client";

export const metadata: Metadata = {
  title: "Endless Outfitter - Ship Outfitter",
  description: "Modify and configure ship outfits for Endless Sky",
};

/**
 * Ship Outfitter page.
 *
 * This is a Server Component (default in Next.js App Router).
 * Loads ships data and passes it to the client component.
 */
export default function OutfitterPage() {
  return <OutfitterPageClient />;
}
