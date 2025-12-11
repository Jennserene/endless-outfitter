import {
  handleScriptError,
  ScriptError,
  ScriptErrorCode,
} from "./utils/error-handling";
import { DataGenerationPipeline } from "./pipeline/data-generation-pipeline";
import {
  parseCliArgs,
  displayHelp,
  displayVersion,
  isMainModule,
  type CliOptions,
} from "./utils/cli-args";
import { logger } from "@/lib/logger";

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  success: boolean;
  errorCode?: string;
  message: string;
  steps?: Array<{ name: string; status: "success" | "failed" }>;
}

/**
 * Execute the data generation pipeline with options
 */
export async function executePipeline(
  options: CliOptions = {
    version: false,
    help: false,
    json: false,
    debug: false,
  }
): Promise<PipelineResult> {
  // Set debug mode if requested
  if (options.debug) {
    process.env.DEBUG = "1";
  }

  const pipeline = new DataGenerationPipeline();
  const pipelineSteps = pipeline.getSteps();
  const steps: Array<{ name: string; status: "success" | "failed" }> =
    pipelineSteps.map((step) => ({
      name: step.name,
      status: "success" as const,
    }));

  try {
    pipeline.execute();

    return {
      success: true,
      message: "Data generation pipeline completed successfully",
      steps,
    };
  } catch (error) {
    // Determine which step failed from error message
    let failedStepIndex = -1;
    if (
      error instanceof ScriptError &&
      error.message.includes("Pipeline failed at step")
    ) {
      const stepNameMatch = error.message.match(/"([^"]+)"/);
      if (stepNameMatch) {
        const failedStepName = stepNameMatch[1];
        failedStepIndex = steps.findIndex((s) => s.name === failedStepName);
      }
    }

    // Mark failed step and subsequent steps
    if (failedStepIndex >= 0) {
      steps[failedStepIndex].status = "failed";
      // Mark subsequent steps as failed (not executed)
      for (let i = failedStepIndex + 1; i < steps.length; i++) {
        steps[i].status = "failed";
      }
    } else {
      // If we can't determine the step, mark all as failed
      steps.forEach((step) => {
        step.status = "failed";
      });
    }

    if (error instanceof ScriptError) {
      return {
        success: false,
        errorCode: error.code,
        message: error.message,
        steps,
      };
    }

    return {
      success: false,
      errorCode: ScriptErrorCode.GENERIC_ERROR,
      message: error instanceof Error ? error.message : String(error),
      steps,
    };
  }
}

/**
 * Main entry point for data generation pipeline.
 * Orchestrates the complete flow from game data files to validated, type-safe data files.
 * Returns exit code for programmatic usage.
 */
export async function main(): Promise<number> {
  const options = parseCliArgs();

  // Handle version flag
  if (options.version) {
    displayVersion();
    return 0;
  }

  // Handle help flag
  if (options.help) {
    displayHelp();
    return 0;
  }

  // Execute pipeline
  const result = await executePipeline(options);

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
            ScriptErrorCode.GENERIC_ERROR,
          result.message
        ),
        "Data generation"
      );
    }
    return 1;
  }
}

/**
 * Setup graceful signal handling
 */
function setupSignalHandling(): void {
  let isShuttingDown = false;

  const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) {
      logger.error("Force shutdown requested");
      process.exit(1);
    }

    isShuttingDown = true;
    logger.info(`\nReceived ${signal}, shutting down gracefully...`);
    logger.info("Press Ctrl+C again to force shutdown");

    // Give a moment for cleanup, then exit
    setTimeout(() => {
      logger.error("Shutdown timeout, forcing exit");
      process.exit(1);
    }, 5000);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

// Only execute if this file is run directly (allows for testing)
if (isMainModule()) {
  setupSignalHandling();
  main()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((error) => {
      handleScriptError(error, "Data generation");
    });
}
