import { readGameDataFile, GameDataPaths } from "@/lib/game-data";
import { NextResponse } from "next/server";

/**
 * Example API route showing how to serve game data server-side.
 *
 * This keeps all game data on the server and only sends filtered/parsed
 * data to the client. The raw game files never reach the browser.
 *
 * Usage:
 * - GET /api/ships - Get all ships (you'd parse and filter here)
 * - GET /api/ships?name=Argosy - Get specific ship
 */
export async function GET() {
  try {
    // Read game data file (server-side only, not bundled)
    const shipsData = readGameDataFile(GameDataPaths.SHIPS);

    // TODO: Parse the ships.txt format and extract ship data
    // TODO: Filter/search based on query parameters
    // TODO: Return only the data needed by the client

    // For now, return a placeholder response
    // In production, you'd parse the file format and return structured JSON
    return NextResponse.json({
      message: "Ships data endpoint",
      note: "Parse ships.txt format and return structured data here",
      dataSize: shipsData.length,
      // Don't send the raw file content - parse it first!
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to read game data" },
      { status: 500 }
    );
  }
}
