import { GAME_VERSION } from "@config/game-version";
import { DATA_SCHEMA_FORMAT_VERSION } from "@config/data-schema-version";
import type { Metadata } from "../types";

/**
 * Create metadata for a generated data file
 */
export function createMetadata(species: string, itemCount: number): Metadata {
  const schemaVersion = `${DATA_SCHEMA_FORMAT_VERSION}-${GAME_VERSION}`;
  return {
    version: GAME_VERSION,
    schemaVersion,
    species,
    generatedAt: new Date().toISOString(),
    itemCount,
  };
}
