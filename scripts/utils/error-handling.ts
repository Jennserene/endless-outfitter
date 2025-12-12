import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Error codes for trackable errors
 */
export enum ScriptErrorCode {
  GENERIC_ERROR = "E4001",
  PIPELINE_STEP_FAILED = "E4002",
  VALIDATION_ERROR = "E4003",
  CONFIGURATION_ERROR = "E4004",
  FILE_SYSTEM_ERROR = "E4005",
  INTERRUPTED = "E4006",
  SHIP_VARIANT_MISSING_BASE = "E4007",
}

/**
 * Custom error class with error code and actionable message
 */
export class ScriptError extends Error {
  constructor(
    public readonly code: ScriptErrorCode,
    message: string,
    public readonly actionable?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ScriptError";
  }
}

/**
 * Handle script errors with consistent formatting and error codes
 */
export function handleScriptError(
  error: unknown,
  scriptName: string,
  exitCode: number = 1
): never {
  if (error instanceof ScriptError) {
    logger.error(
      `Error (${error.code}): ${error.message}`,
      error.cause || error
    );
    if (error.actionable) {
      logger.error(error.actionable);
    }
  } else {
    logger.error(`${scriptName} failed`, error);
  }
  process.exit(exitCode);
}

/**
 * Create a pipeline step error with error code and actionable message
 */
export function createPipelineStepError(
  stepName: string,
  cause: unknown
): ScriptError {
  return new ScriptError(
    ScriptErrorCode.PIPELINE_STEP_FAILED,
    `Pipeline failed at step "${stepName}"`,
    `Review the error above and ensure all prerequisites for step "${stepName}" are met. Check file permissions, required files, and dependencies.`,
    cause
  );
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
    throw new ScriptError(
      ScriptErrorCode.VALIDATION_ERROR,
      `Failed to validate ${itemType} ${speciesPrefix}"${itemName}": ${errorMessages}`,
      `Ensure the ${itemType} data matches the expected schema. Review validation errors above.`
    );
  } else {
    throw new ScriptError(
      ScriptErrorCode.VALIDATION_ERROR,
      `Failed to parse ${itemType} ${speciesPrefix}"${itemName}": ${
        error instanceof Error ? error.message : String(error)
      }`,
      `Check the ${itemType} data format and ensure it's valid.`
    );
  }
}
