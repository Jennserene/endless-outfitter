/**
 * Common test utilities
 */

/**
 * Clear all Jest mocks
 */
export function clearAllMocks(): void {
  jest.clearAllMocks();
}

/**
 * Create a mock species map for testing
 */
export function createMockSpeciesMap(
  species: Array<{ name: string; content: string }>
): Map<string, string[]> {
  return new Map(species.map((s) => [s.name, [s.content]]));
}

/**
 * Create mock game data files
 */
export function createMockGameDataFiles(
  files: Array<{ path: string; content: string }>
): Array<{ path: string; content: string }> {
  return files;
}
