/**
 * Shared mock metadata for testing
 */

export interface MockMetadata {
  version: string;
  schemaVersion: string;
  species: string;
  generatedAt: string;
  itemCount: number;
}

/**
 * Create a mock metadata object
 */
export function createMockMetadata(
  species: string,
  itemCount: number,
  version = "v1.0",
  schemaVersion = "1.0-v1.0"
): MockMetadata {
  return {
    version,
    schemaVersion,
    species,
    generatedAt: "2024-01-01T00:00:00.000Z",
    itemCount,
  };
}
