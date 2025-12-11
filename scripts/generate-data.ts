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
import { setupSignalHandling } from "./utils/signal-handling";

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
 * Pipeline step type for error handling
 */
type PipelineStep = { name: string; status: "success" | "failed" };

/**
 * Determine which pipeline step failed from the error message
 * @param error - The error that was thrown
 * @param steps - Array of pipeline steps
 * @returns Index of the failed step, or -1 if unable to determine
 */
function determineFailedStep(error: unknown, steps: PipelineStep[]): number {
  if (
    error instanceof ScriptError &&
    error.message.includes("Pipeline failed at step")
  ) {
    const stepNameMatch = error.message.match(/"([^"]+)"/);
    if (stepNameMatch) {
      const failedStepName = stepNameMatch[1];
      return steps.findIndex((s) => s.name === failedStepName);
    }
  }
  return -1;
}

/**
 * Mark a step and all subsequent steps as failed
 * @param steps - Array of pipeline steps to modify
 * @param failedIndex - Index of the step that failed
 */
function markStepsAsFailed(steps: PipelineStep[], failedIndex: number): void {
  if (failedIndex >= 0 && failedIndex < steps.length) {
    steps[failedIndex].status = "failed";
    // Mark subsequent steps as failed (not executed)
    for (let i = failedIndex + 1; i < steps.length; i++) {
      steps[i].status = "failed";
    }
  } else {
    // If we can't determine the step, mark all as failed
    steps.forEach((step) => {
      step.status = "failed";
    });
  }
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
  const steps: PipelineStep[] = pipelineSteps.map((step) => ({
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
    const failedStepIndex = determineFailedStep(error, steps);
    markStepsAsFailed(steps, failedStepIndex);

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
    displayVersion("generate-data");
    return 0;
  }

  // Handle help flag
  if (options.help) {
    displayHelp("generate-data");
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

// Only execute if this file is run directly (allows for testing)
if (isMainModule(["generate-data"])) {
  setupSignalHandling("Data generation");
  main()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((error) => {
      handleScriptError(error, "Data generation");
    });
}
