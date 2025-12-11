import {
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "fs";
import { join } from "path";
import { extractSpeciesFromPath } from "./species";

/**
 * Cache of existing file contents, keyed by file path
 */
export type FileContentCache = Map<string, unknown>;

/**
 * Normalize JSON data by removing the generatedAt field from metadata for comparison
 */
function normalizeForComparison<T>(data: T): T {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeForComparison) as T;
  }

  const normalized = { ...data } as Record<string, unknown>;

  // If this is a GeneratedDataFile structure, remove generatedAt from metadata
  if (
    "metadata" in normalized &&
    typeof normalized.metadata === "object" &&
    normalized.metadata !== null
  ) {
    const metadata = { ...normalized.metadata } as Record<string, unknown>;
    delete metadata.generatedAt;
    normalized.metadata = metadata;
  }

  // Recursively normalize nested objects
  for (const [key, value] of Object.entries(normalized)) {
    if (typeof value === "object" && value !== null) {
      normalized[key] = normalizeForComparison(value);
    }
  }

  return normalized as T;
}

/**
 * Compare two JSON objects for equality, ignoring generatedAt in metadata
 */
function areEqualIgnoringGeneratedAt<T>(a: T, b: T): boolean {
  const normalizedA = normalizeForComparison(a);
  const normalizedB = normalizeForComparison(b);
  return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
}

/**
 * Write JSON data to a file with consistent formatting.
 * Skips writing if the file content is identical (ignoring generatedAt).
 *
 * @param filePath - Path to the file to write
 * @param data - Data to write
 * @param existingFileCache - Optional cache of existing file contents to compare against
 * @returns true if file was written, false if skipped due to identical content
 */
export function writeJsonFile<T>(
  filePath: string,
  data: T,
  existingFileCache?: FileContentCache
): boolean {
  const formattedData = JSON.stringify(data, null, 2) + "\n";

  // If we have a cache, compare with existing content
  // BUT: only skip writing if the file actually exists on disk
  // (after backup, files are renamed to .old, so we must write even if cache matches)
  if (existingFileCache?.has(filePath) && existsSync(filePath)) {
    const existingData = existingFileCache.get(filePath);
    if (areEqualIgnoringGeneratedAt(data, existingData)) {
      // Content is identical (ignoring generatedAt) AND file exists, skip writing
      return false;
    }
  }

  // Write the file (either cache doesn't match, or file doesn't exist on disk)
  writeFileSync(filePath, formattedData, "utf-8");
  return true;
}

/**
 * Read all JSON files from a directory and cache their contents
 *
 * @param directory - Directory to read files from
 * @returns Map of file paths to parsed JSON content
 */
export function readExistingJsonFiles(directory: string): FileContentCache {
  const cache = new Map<string, unknown>();

  if (!existsSync(directory)) {
    return cache;
  }

  try {
    const files = readdirSync(directory).filter((f) => f.endsWith(".json"));

    for (const filename of files) {
      const filePath = join(directory, filename);
      try {
        const fileContent = readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(fileContent);
        cache.set(filePath, parsed);
      } catch {
        // Skip files that can't be read or parsed
      }
    }
  } catch {
    // If directory can't be read, return empty cache
  }

  return cache;
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
