import "server-only";

import "server-only";

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { z } from "zod";
import type { SearchIndex } from "@/lib/types/search-index";

const DATA_DIR = join(process.cwd(), "public/assets/data");
const SEARCH_INDEX_PATH = join(DATA_DIR, "search-index.json");

/**
 * Schema for SearchIndexItem
 */
const SearchIndexItemSchema = z.object({
  name: z.string(),
  type: z.enum(["ship", "outfit"]),
  slug: z.string(),
});

/**
 * Schema for SearchIndexMetadata
 */
const SearchIndexMetadataSchema = z.object({
  version: z.string(),
  schemaVersion: z.string(),
  generatedAt: z.string(),
  shipCount: z.number(),
  outfitCount: z.number(),
  totalItems: z.number(),
});

/**
 * Schema for the complete search index structure
 */
const SearchIndexSchema = z.object({
  metadata: SearchIndexMetadataSchema,
  index: z.record(z.string(), z.array(SearchIndexItemSchema)),
});

/**
 * Load and validate the search index from the generated JSON file.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 *
 * @returns The validated SearchIndex structure
 * @throws Error if the file doesn't exist or validation fails
 */
export function loadSearchIndex(): SearchIndex {
  try {
    if (!existsSync(SEARCH_INDEX_PATH)) {
      throw new Error(
        `Search index file not found: ${SEARCH_INDEX_PATH}. Please run the data generation pipeline to create it.`
      );
    }

    const fileContent = readFileSync(SEARCH_INDEX_PATH, "utf-8");

    try {
      const jsonData = JSON.parse(fileContent);
      const validated = SearchIndexSchema.parse(jsonData);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Failed to validate search index: ${error.issues.map((e) => e.message).join(", ")}`
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse search index: ${error.message}`);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to load search index: ${String(error)}`);
  }
}
