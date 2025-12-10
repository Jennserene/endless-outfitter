import type { Metadata } from "../types";
import type { PipelineConfig } from "../config/pipeline-config";

/**
 * Service for creating metadata for generated data files
 */
export class MetadataService {
  constructor(private readonly config: PipelineConfig) {}

  /**
   * Create metadata for a generated data file
   */
  createMetadata(species: string, itemCount: number): Metadata {
    const schemaVersion = `${this.config.schemaVersion}-${this.config.gameVersion}`;
    return {
      version: this.config.gameVersion,
      schemaVersion,
      species,
      generatedAt: new Date().toISOString(),
      itemCount,
    };
  }
}
