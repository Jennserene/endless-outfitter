import type { GameDataFile } from "../types";

/**
 * Extract species name from file path.
 * Examples:
 * - "vendor/endless-sky/data/human/ships.txt" -> "human"
 * - "vendor/endless-sky/data/hai/hai ships.txt" -> "hai"
 * - "vendor/endless-sky/data/ships.txt" -> undefined (no species)
 */
export function extractSpeciesFromPath(
  filePath: string,
  dataDir: string
): string | undefined {
  // Get relative path from data directory
  const relativePath = filePath.replace(dataDir + "/", "");
  const parts = relativePath.split("/");

  // If there's a subdirectory (species folder), use it as species
  // e.g., "human/ships.txt" -> "human"
  if (parts.length > 1) {
    return parts[0];
  }

  return undefined;
}

/**
 * Group game data files by species
 */
export function groupFilesBySpecies(
  files: GameDataFile[]
): Map<string, string[]> {
  const speciesMap = new Map<string, string[]>();
  for (const { content, species } of files) {
    const speciesName = species || "unknown";
    if (!speciesMap.has(speciesName)) {
      speciesMap.set(speciesName, []);
    }
    speciesMap.get(speciesName)!.push(content);
  }
  return speciesMap;
}
