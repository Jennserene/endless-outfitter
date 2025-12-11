import { logger } from "@/lib/logger";
import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import { validateDataDirectories } from "./utils/directories";
import {
  handleScriptError,
  ScriptError,
  ScriptErrorCode,
} from "./utils/error-handling";
import {
  parseCliArgs,
  displayHelp,
  displayVersion,
  isMainModule,
  type CliOptions,
} from "./utils/cli-args";
import { setupSignalHandling } from "./utils/signal-handling";

/**
 * Validation result for a single data type
 */
interface ValidationResult {
  type: string;
  count: number;
  success: boolean;
}

/**
 * Overall validation result
 */
export interface ValidationPipelineResult {
  success: boolean;
  errorCode?: string;
  message: string;
  results?: ValidationResult[];
}

/**
 * Validate ships data
 * @returns Validation result with ship count
 */
function validateShips(): ValidationResult {
  logger.info("Validating ships.json...");
  const ships = loadShips();
  logger.success(`Validated ${ships.length} ships`);
  return {
    type: "ships",
    count: ships.length,
    success: true,
  };
}

/**
 * Validate outfits data
 * @returns Validation result with outfit count
 */
function validateOutfits(): ValidationResult {
  logger.info("Validating outfits.json...");
  const outfits = loadOutfits();
  logger.success(`Validated ${outfits.length} outfits`);
  return {
    type: "outfits",
    count: outfits.length,
    success: true,
  };
}

/**
 * Execute the validation pipeline with options
 */
export async function executeValidation(
  options: CliOptions = {
    version: false,
    help: false,
    json: false,
    debug: false,
  }
): Promise<ValidationPipelineResult> {
  // Set debug mode if requested
  if (options.debug) {
    process.env.DEBUG = "1";
  }

  try {
    logger.info("Starting data validation...\n");

    // Check files exist
    validateDataDirectories();

    // Validate data
    const shipResult = validateShips();
    const outfitResult = validateOutfits();

    const results = [shipResult, outfitResult];

    logger.success("Data validation completed successfully!");

    return {
      success: true,
      message: "Data validation completed successfully",
      results,
    };
  } catch (error) {
    if (error instanceof ScriptError) {
      return {
        success: false,
        errorCode: error.code,
        message: error.message,
      };
    }

    return {
      success: false,
      errorCode: ScriptErrorCode.VALIDATION_ERROR,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main entry point for data validation.
 * Orchestrates the validation of ships and outfits data files.
 * Returns exit code for programmatic usage.
 */
export async function main(): Promise<number> {
  const options = parseCliArgs();

  // Handle version flag
  if (options.version) {
    displayVersion("validate-data");
    return 0;
  }

  // Handle help flag
  if (options.help) {
    displayHelp("validate-data");
    return 0;
  }

  // Execute validation
  const result = await executeValidation(options);

  if (result.success) {
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    }
    return 0;
  } else {
    if (options.json) {
      console.error(JSON.stringify(result, null, 2));
    } else {
      handleScriptError(
        new ScriptError(
          (result.errorCode as ScriptErrorCode) ||
            ScriptErrorCode.VALIDATION_ERROR,
          result.message
        ),
        "Data validation"
      );
    }
    return 1;
  }
}

// Only execute if this file is run directly (allows for testing)
if (isMainModule(["validate-data"])) {
  setupSignalHandling("Data validation");
  main()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((error) => {
      handleScriptError(error, "Data validation");
    });
}
