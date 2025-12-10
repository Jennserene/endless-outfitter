import type { Logger } from "@/lib/logger";
import { logger as defaultLogger } from "@/lib/logger";
import { retrieveRawData } from "../parsers/retrieve-raw-data";
import { ensureDataDirectories } from "../utils/directories";
import { generateShips } from "../generators/ship-generator";
import { generateOutfits } from "../generators/outfit-generator";

/**
 * Pipeline step definition
 */
interface PipelineStep {
  name: string;
  execute: () => void;
}

/**
 * Orchestrates the complete data generation pipeline.
 * Handles the flow from game data files to validated, type-safe data files.
 */
export class DataGenerationPipeline {
  private readonly steps: PipelineStep[];

  constructor(private readonly logger: Logger = defaultLogger) {
    this.steps = this.createSteps();
  }

  /**
   * Create pipeline steps in execution order
   */
  private createSteps(): PipelineStep[] {
    return [
      {
        name: "Retrieve raw data",
        execute: () => retrieveRawData(),
      },
      {
        name: "Ensure data directories",
        execute: () => ensureDataDirectories(),
      },
      {
        name: "Generate ships",
        execute: () => generateShips(),
      },
      {
        name: "Generate outfits",
        execute: () => generateOutfits(),
      },
    ];
  }

  /**
   * Execute the complete data generation pipeline.
   *
   * Steps:
   * 1. Parse raw game data files to JSON (wipes and recreates raw data directory)
   * 2. Ensure output directories exist
   * 3. Generate ships from raw JSON
   * 4. Generate outfits from raw JSON
   */
  execute(): void {
    this.logger.info("Starting data generation pipeline...\n");

    for (const step of this.steps) {
      try {
        this.logger.info(`Executing step: ${step.name}...`);
        step.execute();
      } catch (error) {
        this.logger.error(`Step "${step.name}" failed`, error);
        throw new Error(`Pipeline failed at step "${step.name}"`, {
          cause: error,
        });
      }
    }

    this.logger.success("Data generation pipeline completed successfully!");
  }

  /**
   * Get the list of pipeline steps (for testing/debugging)
   */
  getSteps(): readonly PipelineStep[] {
    return this.steps;
  }
}
