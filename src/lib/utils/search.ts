import "server-only";

import Fuse from "fuse.js";
import { loadSearchIndex } from "@/lib/loaders/search-index-loader";
import type { SearchIndexItem } from "@/lib/types/search-index";

/**
 * Search results grouped by type
 */
export interface SearchResults {
  ships: SearchIndexItem[];
  outfits: SearchIndexItem[];
}

/**
 * Search through ships and outfits using the search index and Fuse.js for fuzzy matching.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @param query - The search query string
 * @returns Search results grouped by type (ships and outfits)
 */
export function searchGameData(query: string): SearchResults {
  if (!query || query.trim().length === 0) {
    return { ships: [], outfits: [] };
  }

  // Load the search index
  const searchIndex = loadSearchIndex();

  // Flatten all items from the index into a single array
  const allItems: SearchIndexItem[] = [];
  for (const items of Object.values(searchIndex.index)) {
    allItems.push(...items);
  }

  // If no items in index, return empty results
  if (allItems.length === 0) {
    return { ships: [], outfits: [] };
  }

  // Create Fuse.js instance with configuration
  const fuse = new Fuse(allItems, {
    keys: ["name"], // Search only the 'name' field
    threshold: 0.4, // Balance between exact and fuzzy (0.0 = exact, 1.0 = match anything)
    includeScore: true, // Include relevance scores for ranking
    includeMatches: false, // Don't need match details for basic search
    minMatchCharLength: 2, // Minimum characters before fuzzy matching kicks in
  });

  // Perform fuzzy search
  const searchResults = fuse.search(query);

  // Group results by type and sort by score (lower = better match)
  const ships: SearchIndexItem[] = [];
  const outfits: SearchIndexItem[] = [];

  for (const result of searchResults) {
    if (result.item.type === "ship") {
      ships.push(result.item);
    } else if (result.item.type === "outfit") {
      outfits.push(result.item);
    }
  }

  // Sort by score (results are already sorted by Fuse.js, but we maintain that order)
  // Fuse.js returns results sorted by score ascending (best matches first)

  return { ships, outfits };
}
