import { readFileSync } from "fs";
import { join } from "path";

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
 * Parse command line arguments
 */
export function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    version: false,
    help: false,
    json: false,
    debug: false,
  };

  for (const arg of args) {
    if (arg === "--version" || arg === "-V") {
      options.version = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--debug") {
      options.debug = true;
    }
  }

  // Check environment variables (lower precedence than CLI args)
  if (!options.debug && process.env.DEBUG) {
    options.debug = true;
  }

  return options;
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
 * Display help message
 */
export function displayHelp(): void {
  const helpText = `
Usage: generate-data [options]

Generate data files from game data sources.

Options:
  --version, -V    Display version information
  --help, -h      Display this help message
  --json          Output results in JSON format (for CI/automation)
  --debug         Enable debug logging (also via DEBUG environment variable)

Examples:
  npm run generate-data
  npm run generate-data -- --json
  npm run generate-data -- --debug
  DEBUG=1 npm run generate-data

Environment Variables:
  DEBUG            Enable debug logging (same as --debug flag)

Exit Codes:
  0               Success
  1               General error
  2               Configuration error
`;
  console.log(helpText.trim());
}

/**
 * Display version information
 */
export function displayVersion(): void {
  const version = getVersion();
  console.log(`generate-data version ${version}`);
}

/**
 * Check if running as ES module entry point
 * Works with both tsx and node execution
 */
export function isMainModule(): boolean {
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
    return scriptName.includes("generate-data");
  }

  // Fallback: assume false if we can't determine
  return false;
}
