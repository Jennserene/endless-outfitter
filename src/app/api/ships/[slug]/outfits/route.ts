import { NextRequest, NextResponse } from "next/server";
import { getShipBySlug } from "@/lib/game-data";
import { loadOutfitsFromShipOutfits } from "@/lib/utils/outfit-loader";
import { logger } from "@/lib/logger";

/**
 * API route to load outfits for a ship by slug.
 *
 * Returns the outfit objects that correspond to the ship's default outfits list.
 *
 * Usage:
 * - GET /api/ships/[slug]/outfits - Get outfits for a ship
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    logger.debug("Loading outfits for ship", { slug });

    const ship = getShipBySlug(slug);
    if (!ship) {
      return NextResponse.json({ error: "Ship not found" }, { status: 404 });
    }

    // Load outfits from ship's outfits list
    const outfits = loadOutfitsFromShipOutfits(ship.outfits);

    logger.info("Outfits loaded for ship", {
      slug,
      outfitCount: outfits.length,
      requestedCount: ship.outfits.length,
    });

    return NextResponse.json({
      outfits,
    });
  } catch (error) {
    logger.error("Failed to load outfits for ship", error, {
      slug,
    });
    return NextResponse.json(
      {
        error: "Failed to load outfits",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
