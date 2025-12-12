import type { Metadata } from "next";
import { getOutfits } from "@/lib/game-data";
import { OutfitsList } from "./_components/outfits-list";

export const metadata: Metadata = {
  title: "Outfits - Endless Outfitter",
  description: "Browse all available outfits",
};

/**
 * Server Component that displays outfits data.
 *
 * This is a Server Component (default in Next.js App Router), so it runs
 * on the server. The game data is loaded from pre-generated JSON files.
 */
export default async function OutfitsPage() {
  // This runs on the server only
  const outfits = getOutfits();

  return <OutfitsList outfits={outfits} />;
}
