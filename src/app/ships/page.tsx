import type { Metadata } from "next";
import { getShips } from "@/lib/game-data";
import { ShipsList } from "./_components/ships-list";

export const metadata: Metadata = {
  title: "Ships - Endless Outfitter",
  description: "Browse all available ships",
};

/**
 * Server Component that displays ships data.
 *
 * This is a Server Component (default in Next.js App Router), so it runs
 * on the server. The game data is loaded from pre-generated JSON files.
 */
export default async function ShipsPage() {
  // This runs on the server only
  const ships = getShips();

  return <ShipsList ships={ships} />;
}
