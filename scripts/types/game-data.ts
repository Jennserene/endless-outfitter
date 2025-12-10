/**
 * Game data file with content and optional species information
 * Returned by readGameDataFiles()
 */
export interface GameDataFile {
  content: string;
  species: string | undefined;
}
