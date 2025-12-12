/**
 * Shared test constants for reuse across test files
 */

/**
 * Test version string for CLI version testing
 */
export const TEST_VERSION = "0.1.0";

/**
 * Standard pipeline step names for testing
 */
export const TEST_STEP_NAMES = [
  "Read existing files",
  "Backup existing files",
  "Clean output directories",
  "Retrieve raw data",
  "Ensure data directories",
  "Generate ships",
  "Generate outfits",
  "Generate search index",
  "Retrieve images",
  "Delete backup files",
] as const;

/**
 * Common test error messages
 */
export const TEST_ERROR_MESSAGES = {
  GENERIC: "Test error",
  PIPELINE_FAILED: "Pipeline failed",
  STEP_FAILED: "Step failed",
  DIRECTORY_ERROR: "Directory error",
  IMAGE_RETRIEVAL_ERROR: "Image retrieval error",
  VALIDATION_ERROR: "Parse error",
} as const;

/**
 * Common test script names
 */
export const TEST_SCRIPT_NAMES = {
  GENERATE_DATA: "generate-data",
  VALIDATE_DATA: "validate-data",
  TEST_SCRIPT: "Test Script",
} as const;

/**
 * Test constants for signal handling
 */
export const TEST_SIGNAL_HANDLING = {
  DEFAULT_TIMEOUT: 5000,
  CUSTOM_TIMEOUT: 2000,
  SHORT_TIMEOUT: 1000,
} as const;

/**
 * Common test item names
 */
export const TEST_ITEM_NAMES = {
  SHIP: "Test Ship",
  SHIP_1: "Ship1",
  SHIP_2: "Ship2",
  ANOTHER_SHIP: "Another Ship",
  OUTFIT: "Test Outfit",
  OUTFIT_1: "Outfit1",
  OUTFIT_2: "Outfit2",
  ANOTHER_OUTFIT: "Another Outfit",
  ITEM: "Test Item",
} as const;

/**
 * Common test logger messages
 */
export const TEST_LOGGER_MESSAGES = {
  PARSING_SHIPS: "Parsing ships to raw JSON...",
  PARSING_OUTFITS: "Parsing outfits to raw JSON...",
  GENERATING_ITEMS: "Generating test-items files from raw JSON...",
  VALIDATION_FAILED: "Validation failed",
} as const;

/**
 * Common test file paths
 */
export const TEST_FILE_PATHS = {
  SHIPS_HUMAN: "/test/ships-human.json",
  SHIPS_PUG: "/test/ships-pug.json",
  OUTFITS_HUMAN: "/test/outfits-human.json",
  OUTFITS_PUG: "/test/outfits-pug.json",
} as const;

/**
 * Common test success messages
 */
export const TEST_SUCCESS_MESSAGES = {
  PARSED_SHIP: (count: number, species: string, filename: string) =>
    `Parsed ${count} ships (${species}) to ${filename}`,
  PARSED_OUTFIT: (count: number, species: string, filename: string) =>
    `Parsed ${count} outfits (${species}) to ${filename}`,
  GENERATED_ITEMS: (
    count: number,
    itemType: string,
    species: string,
    filename: string
  ) => `Generated ${count} ${itemType} (${species}) to ${filename}`,
  TOTAL_SINGLE: (count: number, itemType: string, speciesCount: number) =>
    `Total: ${count} ${itemType} across ${speciesCount} species`,
  TOTAL_MULTIPLE: (count: number, itemType: string, speciesCount: number) =>
    `Total: ${count} ${itemType} across ${speciesCount} species`,
} as const;

/**
 * Common test metadata timestamps
 */
export const TEST_TIMESTAMPS = {
  DEFAULT: "2024-01-01T00:00:00.000Z",
  LATER: "2024-12-11T12:00:00.000Z",
} as const;

/**
 * Common test species names
 */
export const TEST_SPECIES = {
  HUMAN: "human",
  PUG: "pug",
  HAI: "hai",
  SHERAGI: "sheragi",
} as const;

/**
 * Common test numeric values
 */
export const TEST_NUMERIC_VALUES = {
  MASS_SHIP: 100,
  MASS_OUTFIT: 10,
  COST: 1000,
  DRAG: 0.1,
  POWER: 200,
  MASS_STRING_SHIP: "100",
  MASS_STRING_OUTFIT: "10",
  COST_STRING: "1000",
  DRAG_STRING: "0.1",
} as const;
