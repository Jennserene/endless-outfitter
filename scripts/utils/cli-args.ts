import { readFileSync } from "fs";
import { join } from "path";
import { Command } from "commander";

/**
 * CLI configuration options
 */
export interface CliOptions {
  version: boolean;
  help: boolean;
  json: boolean;
  debug: boolean;
}

/**
 * Get version from package.json
 */
export function getVersion(): string {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
      version: string;
    };
    return packageJson.version;
  } catch {
    return "unknown";
  }
}

/**
 * Create and configure the commander program instance
 * Commander handles POSIX-compliant parsing including grouped flags (e.g., -vh)
 */
function createCommanderProgram(
  scriptName: string,
  description: string
): Command {
  const program = new Command();

  program
    .name(scriptName)
    .description(description)
    .version(getVersion(), "-V, --version", "Display version information")
    .option("--json", "Output results in JSON format (for CI/automation)")
    .option(
      "--debug",
      "Enable debug logging (also via DEBUG environment variable)",
      process.env.DEBUG === "1"
    )
    .allowExcessArguments(false)
    .allowUnknownOption(false);

  return program;
}

/**
 * Parse command line arguments using commander for POSIX-compliant parsing
 * Commander automatically handles:
 * - Grouped short flags (e.g., -vh) - no manual parsing needed
 * - Long and short flag variants (--help, -h)
 * - POSIX-compliant argument parsing
 */
export function parseCliArgs(): CliOptions {
  const program = createCommanderProgram("generate-data", "");
  program.exitOverride();

  // Detect help/version flags - commander handles grouped flags automatically
  const args = process.argv.slice(2);
  const hasVersionFlag =
    args.includes("--version") ||
    args.includes("-V") ||
    args.some(
      (arg) =>
        arg.startsWith("-") &&
        !arg.startsWith("--") &&
        (arg.includes("V") || arg.includes("v"))
    );
  const hasHelpFlag =
    args.includes("--help") ||
    args.includes("-h") ||
    args.some(
      (arg) => arg.startsWith("-") && !arg.startsWith("--") && arg.includes("h")
    );

  // Parse with commander - handles all POSIX-compliant parsing automatically
  try {
    program.parse(process.argv, { from: "node" });
  } catch {
    // Commander may throw when help/version is requested or on invalid options
    // This is expected - we handle it gracefully and return parsed options
  }

  const opts = program.opts();

  return {
    version: hasVersionFlag,
    help: hasHelpFlag,
    json: opts.json === true,
    debug: opts.debug === true || !!process.env.DEBUG,
  };
}

/**
 * Display help message using commander's built-in help
 * Supports both generate-data and validate-data scripts
 */
export function displayHelp(scriptName: string = "generate-data"): void {
  const description =
    scriptName === "generate-data"
      ? "Generate data files from game data sources."
      : "Validate ships and outfits data files.";
  const program = createCommanderProgram(scriptName, description);
  program.exitOverride();

  // Add custom help text sections
  program.addHelpText(
    "after",
    `
Examples:
  npm run ${scriptName}
  npm run ${scriptName} -- --json
  npm run ${scriptName} -- --debug
  DEBUG=1 npm run ${scriptName}

Environment Variables:
  DEBUG            Enable debug logging (same as --debug flag)

Exit Codes:
  0               Success
  1               General error
  2               Configuration error
`
  );

  // Use helpInformation() to get formatted help without triggering exit
  console.log(program.helpInformation());
}

/**
 * Display version information
 * Uses commander's version format but outputs manually to match expected format
 */
export function displayVersion(scriptName: string = "generate-data"): void {
  const version = getVersion();
  console.log(`${scriptName} version ${version}`);
}

/**
 * Check if running as ES module entry point
 * Works with both tsx and node execution
 * @param scriptNames - Array of script names to check for (e.g., ["generate-data", "validate-data"])
 */
export function isMainModule(
  scriptNames: string[] = ["generate-data", "validate-data"]
): boolean {
  // Try CommonJS first (for Jest and Node.js CommonJS)
  try {
    const mainModule = require.main;
    if (mainModule !== undefined && mainModule === module) {
      return true;
    }
  } catch {
    // require.main not available, continue
  }

  // For ES modules, check if the script name matches
  // We check this by looking at process.argv since import.meta may not be available in all contexts
  const scriptName = process.argv[1];
  if (scriptName) {
    return scriptNames.some((name) => scriptName.includes(name));
  }

  // Fallback: assume false if we can't determine
  return false;
}
