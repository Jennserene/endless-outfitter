import type { Logger } from "./types";
import { WinstonLogger } from "./winston-logger";

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /**
   * Minimum log level (debug, info, warn, error)
   */
  level?: string;

  /**
   * Use structured JSON logging instead of formatted console output
   */
  structured?: boolean;

  /**
   * Force silent mode (useful for tests)
   */
  silent?: boolean;
}

/**
 * Check if we're running in a script context (not a web server)
 */
function isScriptContext(): boolean {
  const isNextJs = process.env.NEXT_RUNTIME !== undefined;
  const isTty = process.stdout.isTTY === true;
  return !isNextJs && (isTty || process.argv[1]?.includes("scripts/"));
}

/**
 * Get current environment from NODE_ENV
 */
function getEnvironment(): "development" | "production" | "test" {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  if (env === "test" || env === "testing") return "test";
  if (env === "development" || env === "dev") return "development";
  return "production";
}

/**
 * Create a logger instance with Winston configuration
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const isScript = isScriptContext();
  const env = getEnvironment();
  const isTest = env === "test";
  const isProduction = env === "production";

  // Determine configuration
  const silent = options.silent ?? isTest;
  const level =
    options.level ?? (isScript ? "info" : isProduction ? "warn" : "info");
  const structured = options.structured ?? (isScript ? false : isProduction);

  return new WinstonLogger(level, structured, silent);
}

/**
 * Create the default logger for the current environment
 */
export function createDefaultLogger(): Logger {
  return createLogger();
}
