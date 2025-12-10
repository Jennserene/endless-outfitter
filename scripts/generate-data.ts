import { handleScriptError } from "./utils/error-handling";
import { DataGenerationPipeline } from "./pipeline/data-generation-pipeline";

/**
 * Entry point for data generation pipeline.
 * Orchestrates the complete flow from game data files to validated, type-safe data files.
 */
export function main(): void {
  try {
    const pipeline = new DataGenerationPipeline();
    pipeline.execute();
  } catch (error) {
    handleScriptError(error, "Data generation");
  }
}

// Only execute if this file is run directly (allows for testing)
if (require.main === module) {
  main();
}
