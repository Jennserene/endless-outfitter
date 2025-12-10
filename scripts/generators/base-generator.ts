import type { GeneratedDataFile, Converter } from "../types";
import type { Logger } from "@/lib/logger";
import { logger as defaultLogger } from "@/lib/logger";
import { createMetadata } from "../utils/metadata";
import { writeJsonFile, getSpeciesFilePath } from "../utils/file-io";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

/**
 * Abstract base class for generating data files from raw JSON.
 * Handles common file I/O, species extraction, and output writing logic.
 */
export abstract class BaseGenerator<T> {
  constructor(
    protected readonly converter: Converter<T>,
    protected readonly rawDir: string,
    protected readonly outputDir: string,
    protected readonly prefix: string,
    protected readonly itemType: string,
    protected readonly logger: Logger = defaultLogger
  ) {}

  /**
   * Extract species name from filename
   */
  protected extractSpecies(filename: string): string {
    return filename
      .replace(new RegExp(`^${this.prefix}-`), "")
      .replace(/\.json$/, "");
  }

  /**
   * Read raw JSON file and parse it
   */
  protected readRawData(filePath: string): unknown[] {
    const fileContent = readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent) as unknown[];
  }

  /**
   * Write validated data to output file
   */
  protected writeOutput(species: string, items: T[]): void {
    const metadata = createMetadata(species, items.length);
    const data: GeneratedDataFile<T> = {
      metadata,
      data: items,
    };

    const outputPath = getSpeciesFilePath(this.outputDir, this.prefix, species);
    writeJsonFile(outputPath, data);
  }

  /**
   * Log progress for a single species
   */
  protected logProgress(species: string, count: number): void {
    this.logger.success(
      `Generated ${count} ${this.itemType} (${species}) to ${this.prefix}-${species}.json`
    );
  }

  /**
   * Log summary across all species
   */
  protected logSummary(total: number, speciesCount: number): void {
    this.logger.success(
      `Total: ${total} ${this.itemType} across ${speciesCount} species`
    );
  }

  /**
   * Generate data files from raw JSON
   */
  execute(): void {
    this.logger.info(`Generating ${this.itemType} files from raw JSON...`);

    if (!existsSync(this.rawDir)) {
      throw new Error(
        `Raw ${this.itemType} directory not found: ${this.rawDir}. Run raw-parser.ts first.`
      );
    }

    const files = readdirSync(this.rawDir).filter((f) => f.endsWith(".json"));
    let total = 0;

    for (const filename of files) {
      const speciesName = this.extractSpecies(filename);
      const filePath = join(this.rawDir, filename);
      const rawData = this.readRawData(filePath);
      const validated = this.converter(rawData, speciesName);
      this.writeOutput(speciesName, validated);
      this.logProgress(speciesName, validated.length);
      total += validated.length;
    }

    this.logSummary(total, files.length);
  }
}
