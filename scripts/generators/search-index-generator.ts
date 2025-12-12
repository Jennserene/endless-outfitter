import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";
import type { Logger } from "@/lib/logger";
import { logger as defaultLogger } from "@/lib/logger";
import { GAME_VERSION } from "@config/game-version";
import { DATA_SCHEMA_FORMAT_VERSION } from "@config/data-schema-version";
import { writeJsonFile } from "../utils/file-io";
import { SEARCH_INDEX_PATH } from "../utils/paths";
import type {
  SearchIndex,
  SearchIndexItem,
  SearchIndexMetadata,
} from "../types/search-index";

/**
 * Normalize a name for indexing (lowercase and trim)
 */
function normalizeName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Create metadata for the search index
 */
function createSearchIndexMetadata(
  shipCount: number,
  outfitCount: number,
  totalItems: number
): SearchIndexMetadata {
  const schemaVersion = `${DATA_SCHEMA_FORMAT_VERSION}-${GAME_VERSION}`;
  return {
    version: GAME_VERSION,
    schemaVersion,
    generatedAt: new Date().toISOString(),
    shipCount,
    outfitCount,
    totalItems,
  };
}

/**
 * Build the search index from ships and outfits
 */
function buildIndex(
  ships: Ship[],
  outfits: Outfit[]
): Record<string, SearchIndexItem[]> {
  const index: Record<string, SearchIndexItem[]> = {};

  // Index ships
  // Ships with variants will have names like "Kestrel (More Engines)"
  // which are already unique, so we can use the name directly
  for (const ship of ships) {
    const normalizedName = normalizeName(ship.name);
    const item: SearchIndexItem = {
      name: ship.name,
      type: "ship",
      slug: ship.slug,
    };

    if (!index[normalizedName]) {
      index[normalizedName] = [];
    }
    index[normalizedName].push(item);
  }

  // Index outfits
  for (const outfit of outfits) {
    const normalizedName = normalizeName(outfit.name);
    const item: SearchIndexItem = {
      name: outfit.name,
      type: "outfit",
      slug: outfit.slug,
    };

    if (!index[normalizedName]) {
      index[normalizedName] = [];
    }
    index[normalizedName].push(item);
  }

  return index;
}

/**
 * Generator for search index file
 */
export class SearchIndexGenerator {
  constructor(private readonly logger: Logger = defaultLogger) {}

  /**
   * Generate the search index file
   */
  execute(): void {
    this.logger.info("Generating search index...");

    // Load all ships and outfits
    const ships = loadShips();
    const outfits = loadOutfits();

    const shipCount = ships.length;
    const outfitCount = outfits.length;
    const totalItems = shipCount + outfitCount;

    // Build the index
    const index = buildIndex(ships, outfits);

    // Create metadata
    const metadata = createSearchIndexMetadata(
      shipCount,
      outfitCount,
      totalItems
    );

    // Create the search index structure
    const searchIndex: SearchIndex = {
      metadata,
      index,
    };

    // Write the file
    writeJsonFile(SEARCH_INDEX_PATH, searchIndex);

    this.logger.success(
      `Generated search index with ${totalItems} items (${shipCount} ships, ${outfitCount} outfits) to search-index.json`
    );
  }
}

/**
 * Generate search index file from all ships and outfits
 */
export function generateSearchIndex(): void {
  const generator = new SearchIndexGenerator();
  generator.execute();
}
