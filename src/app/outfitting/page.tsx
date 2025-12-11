import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Endless Outfitter - Ship Outfitting",
  description: "Modify and configure ship outfits for Endless Sky",
};

/**
 * Ship Outfitting page.
 *
 * This is a Server Component (default in Next.js App Router).
 * This page will eventually allow users to:
 * - Select a ship
 * - Add/remove outfits
 * - View calculated stats
 * - Save outfitted ship configurations
 */
export default function OutfittingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <main>
        <h1 className="text-3xl font-bold mb-4">Ship Outfitting</h1>
        <p className="text-muted-foreground">
          Select a ship and configure its outfits. This functionality will be
          implemented soon.
        </p>
      </main>
    </div>
  );
}
