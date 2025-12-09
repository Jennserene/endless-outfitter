/**
 * Example Server Component that uses game data.
 *
 * This is a Server Component (default in Next.js App Router), so it runs
 * on the server. The game data is read server-side and never sent to the
 * client unless you explicitly pass it as props.
 *
 * For large datasets, prefer using API routes and fetching client-side
 * to avoid blocking the page render.
 */
import { readGameDataFile, GameDataPaths } from "@/lib/game-data";

export default async function ShipsPage() {
  // This runs on the server only
  const shipsData = readGameDataFile(GameDataPaths.SHIPS);

  // TODO: Parse the ships.txt format
  // TODO: Only pass minimal data to client components if needed

  return (
    <div>
      <h1>Ships</h1>
      <p>Game data loaded server-side (not in client bundle)</p>
      <p>Data size: {shipsData.length} characters</p>
      {/* Don't render the raw data - parse and display structured info */}
    </div>
  );
}
