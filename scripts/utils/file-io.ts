import { writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { extractSpeciesFromPath } from "./species";

/**
 * Write JSON data to a file with consistent formatting
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Generate output file path for a species-specific data file
 */
export function getSpeciesFilePath(
  directory: string,
  prefix: string,
  species: string
): string {
  const filename = `${prefix}-${species}.json`;
  return join(directory, filename);
}

/**
 * Find all files matching patterns in subdirectories of the data folder.
 * Looks for both exact matches (e.g., "ships.txt") and species-prefixed matches (e.g., "hai ships.txt").
 *
 * @param dataDir - The data directory to search in
 * @param filenames - Array of filenames to search for (e.g., ["ships.txt", "kestrel.txt"])
 * @returns Array of objects with file path and species
 */
export function findDataFiles(
  dataDir: string,
  filenames: readonly string[]
): Array<{ path: string; species: string | undefined }> {
  const files: Array<{ path: string; species: string | undefined }> = [];

  if (!existsSync(dataDir)) {
    return files;
  }

  function searchDirectory(dir: string): void {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip _deprecated folder
          if (entry === "_deprecated") {
            continue;
          }
          // Recursively search subdirectories
          searchDirectory(fullPath);
        } else if (stat.isFile()) {
          // Check if this file matches any of the target filenames
          const normalizedEntry = entry.toLowerCase();

          for (const filename of filenames) {
            const normalizedFilename = filename.toLowerCase();
            const baseName = filename.replace(".txt", "");
            const normalizedBaseName = baseName.toLowerCase();

            // Match exact filename or species-prefixed filename
            // e.g., "ships.txt" or "hai ships.txt" or "human ships.txt"
            // Also handle cases like "ships" (without extension) or "hai ships"
            if (
              normalizedEntry === normalizedFilename ||
              normalizedEntry.endsWith(` ${normalizedFilename}`) ||
              normalizedEntry === normalizedBaseName ||
              normalizedEntry.endsWith(` ${normalizedBaseName}`)
            ) {
              const species = extractSpeciesFromPath(fullPath, dataDir);
              files.push({ path: fullPath, species });
              break; // Found a match, no need to check other filenames
            }
          }
        }
      }
    } catch {
      // Ignore errors reading directories
    }
  }

  searchDirectory(dataDir);
  return files;
}
