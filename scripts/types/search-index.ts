/**
 * Individual item in the search index
 */
export interface SearchIndexItem {
  name: string;
  type: "ship" | "outfit";
  slug: string;
}

/**
 * Metadata for the search index file
 */
export interface SearchIndexMetadata {
  version: string;
  schemaVersion: string;
  generatedAt: string;
  shipCount: number;
  outfitCount: number;
  totalItems: number;
}

/**
 * Complete search index structure
 */
export interface SearchIndex {
  metadata: SearchIndexMetadata;
  index: Record<string, SearchIndexItem[]>;
}
