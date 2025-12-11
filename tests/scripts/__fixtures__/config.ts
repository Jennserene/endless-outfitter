/**
 * Shared test fixtures for PipelineConfig
 */

import type { PipelineConfig } from "@scripts/config/pipeline-config";

/**
 * Create a mock PipelineConfig
 */
export function createMockPipelineConfig(
  overrides: Partial<PipelineConfig> = {}
): PipelineConfig {
  return {
    gameVersion: "v0.10.16",
    gameRepoPath: "vendor/endless-sky",
    schemaVersion: "1.0",
    filePatterns: {
      ships: ["ships.txt"],
      outfits: ["outfits.txt"],
    },
    paths: {
      dataDir: "/test/data",
      shipsDir: "/test/data/ships",
      outfitsDir: "/test/data/outfits",
      rawDataDir: "/test/raw",
      rawShipsDir: "/test/raw/ships",
      rawOutfitsDir: "/test/raw/outfits",
      gameDataRoot: "/test/vendor/endless-sky",
    },
    ...overrides,
  };
}
