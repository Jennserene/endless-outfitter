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
