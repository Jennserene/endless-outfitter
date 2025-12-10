/**
 * Server Component that displays ships data.
 *
 * This is a Server Component (default in Next.js App Router), so it runs
 * on the server. The game data is loaded from pre-generated JSON files.
 *
 * For large datasets, prefer using API routes and fetching client-side
 * to avoid blocking the page render.
 */
import { getShips } from "@/lib/game-data";

export default async function ShipsPage() {
  // This runs on the server only
  const ships = getShips();

  return (
    <div>
      <h1>Ships</h1>
      <p>Total ships: {ships.length}</p>
      {/* TODO: Display ships in a table or list */}
    </div>
  );
}
