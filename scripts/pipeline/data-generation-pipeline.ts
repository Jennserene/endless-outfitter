import type { Logger } from "@/lib/logger";
import { logger as defaultLogger } from "@/lib/logger";
import { retrieveRawData } from "../parsers/retrieve-raw-data";
import {
  ensureDataDirectories,
  cleanOutputDirectories,
  backupExistingFiles,
  deleteBackupFiles,
  restoreBackupFiles,
} from "../utils/directories";
import { generateShips } from "../generators/ship-generator";
import { generateOutfits } from "../generators/outfit-generator";
import { ImageRetrievalService } from "../services/image-retrieval-service";
import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import { createPipelineStepError } from "../utils/error-handling";
import { readExistingJsonFiles } from "../utils/file-io";
import { SHIPS_DIR, OUTFITS_DIR } from "../utils/paths";

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
  private existingFileCache: Map<string, unknown> = new Map();

  constructor(private readonly logger: Logger = defaultLogger) {
    this.steps = this.createSteps();
  }

  /**
   * Read existing JSON files before cleaning to preserve for comparison
   */
  private readExistingFiles(): void {
    this.logger.info("Reading existing files for comparison...");
    const shipsCache = readExistingJsonFiles(SHIPS_DIR);
    const outfitsCache = readExistingJsonFiles(OUTFITS_DIR);

    // Merge both caches into a single map
    this.existingFileCache = new Map([...shipsCache, ...outfitsCache]);

    const totalFiles = this.existingFileCache.size;
    if (totalFiles > 0) {
      this.logger.info(`Cached ${totalFiles} existing file(s) for comparison`);
    }
  }

  /**
   * Create pipeline steps in execution order
   */
  private createSteps(): PipelineStep[] {
    return [
      {
        name: "Read existing files",
        execute: () => this.readExistingFiles(),
      },
      {
        name: "Backup existing files",
        execute: () => backupExistingFiles(),
      },
      {
        name: "Clean output directories",
        execute: () => cleanOutputDirectories(),
      },
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
        execute: () => generateShips(this.existingFileCache),
      },
      {
        name: "Generate outfits",
        execute: () => generateOutfits(this.existingFileCache),
      },
      {
        name: "Retrieve images",
        execute: () => {
          const ships = loadShips();
          const outfits = loadOutfits();
          const service = new ImageRetrievalService(this.logger);
          service.retrieveImages(ships, outfits);
        },
      },
      {
        name: "Delete backup files",
        execute: () => deleteBackupFiles(),
      },
    ];
  }

  /**
   * Execute the complete data generation pipeline.
   *
   * Steps:
   * 1. Read existing files for comparison (before backing up)
   * 2. Backup existing JSON files (renames with .old extension)
   * 3. Clean output directories (removes image directories, JSON files already backed up)
   * 4. Parse raw game data files to JSON (wipes and recreates raw data directory)
   * 5. Ensure output directories exist
   * 6. Generate ships from raw JSON (skips writing if content unchanged)
   * 7. Generate outfits from raw JSON (skips writing if content unchanged)
   * 8. Retrieve and copy image files to assets directory
   * 9. Delete backup files (on success)
   *
   * On error, all backup files are restored to their original names.
   */
  execute(): void {
    this.logger.info("Starting data generation pipeline...\n");

    try {
      for (const step of this.steps) {
        try {
          this.logger.info(`Executing step: ${step.name}...`);
          step.execute();
        } catch (error) {
          // Log the error - logger will extract details properly
          this.logger.error(`Step "${step.name}" failed`, error);
          // Restore backup files before rethrowing
          this.logger.info("Restoring backup files due to error...");
          restoreBackupFiles();
          throw createPipelineStepError(step.name, error);
        }
      }

      this.logger.success("Data generation pipeline completed successfully!");
    } catch (error) {
      // Final safety net: if error wasn't caught in the inner loop, restore backups
      // This handles cases where an error might be thrown outside the step execution
      try {
        restoreBackupFiles();
      } catch (restoreError) {
        this.logger.warn("Failed to restore backup files", {
          error:
            restoreError instanceof Error
              ? restoreError.message
              : String(restoreError),
        });
      }
      throw error;
    }
  }

  /**
   * Get the list of pipeline steps (for testing/debugging)
   */
  getSteps(): readonly PipelineStep[] {
    return this.steps;
  }
}
