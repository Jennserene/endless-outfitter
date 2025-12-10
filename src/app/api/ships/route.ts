import { getShips } from "@/lib/game-data";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * API route to serve ships data.
 *
 * This loads pre-generated JSON data files and returns structured data.
 *
 * Usage:
 * - GET /api/ships - Get all ships
 * - GET /api/ships?name=Argosy - Get specific ship (TODO: implement filtering)
 */
export async function GET(request: Request) {
  try {
    logger.debug("Loading ships data", { url: request.url });
    const ships = getShips();

    // TODO: Filter/search based on query parameters
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    let result = ships;
    if (name) {
      logger.debug("Filtering ships by name", { name });
      result = ships.filter((ship) =>
        ship.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    logger.info("Ships data loaded successfully", {
      total: ships.length,
      filtered: result.length,
    });

    return NextResponse.json({
      count: result.length,
      ships: result,
    });
  } catch (error) {
    logger.error("Failed to load ships data", error, { url: request.url });
    return NextResponse.json(
      {
        error: "Failed to load ships data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
