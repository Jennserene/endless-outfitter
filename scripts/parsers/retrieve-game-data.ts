import { readFileSync } from "fs";
import { join } from "path";
import { getGameDataPath, GameDataPaths } from "../utils/paths";
import { findDataFiles } from "../utils/file-io";

/**
 * Re-export GameDataPaths for convenience
 */
export { GameDataPaths };

/**
 * Read game data files of specific types from the submodule, grouped by species.
 * This searches all subdirectories in the data folder and returns files with their species.
 * Used for local development and data generation scripts.
 *
 * @param filenames - Array of filenames to search for (e.g., ["ships.txt", "kestrel.txt"])
 * @returns Array of objects with content and species
 * @throws Error if no files found or submodule is not available
 */
export function readGameDataFiles(
  filenames: readonly string[]
): Array<{ content: string; species: string | undefined }> {
  const dataDir = getGameDataPath("data");
  const files = findDataFiles(dataDir, filenames);

  if (files.length === 0) {
    throw new Error(
      `No game data files found matching [${filenames.join(", ")}] in ${dataDir}`
    );
  }

  // Read all matching files with their species
  const results: Array<{ content: string; species: string | undefined }> = [];
  for (const { path, species } of files) {
    const content = readFileSync(path, "utf-8");
    results.push({ content, species });
  }

  return results;
}
