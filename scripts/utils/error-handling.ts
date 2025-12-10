import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Handle script errors with consistent formatting
 */
export function handleScriptError(error: unknown, scriptName: string): never {
  logger.error(`${scriptName} failed`, error);
  process.exit(1);
}

/**
 * Handle validation errors with consistent formatting
 */
export function handleValidationError(
  error: unknown,
  itemName: string,
  itemType: string,
  species?: string
): never {
  const speciesPrefix = species ? `[${species}] ` : "";
  if (error instanceof z.ZodError) {
    const errorMessages = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(
      `Failed to validate ${itemType} ${speciesPrefix}"${itemName}": ${errorMessages}`
    );
  } else {
    throw new Error(
      `Failed to parse ${itemType} ${speciesPrefix}"${itemName}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
