import type { Logger } from "@/lib/logger";
import { logger as defaultLogger } from "@/lib/logger";

/**
 * Default shutdown timeout in milliseconds
 */
const DEFAULT_SHUTDOWN_TIMEOUT = 5000;

/**
 * Setup graceful signal handling for CLI scripts.
 * Handles SIGINT (Ctrl+C) and SIGTERM signals with graceful shutdown.
 *
 * @param scriptName - Name of the script for logging purposes
 * @param shutdownTimeout - Timeout in milliseconds before forcing exit (default: 5000ms)
 * @param customLogger - Optional logger instance (defaults to global logger)
 */
export function setupSignalHandling(
  scriptName: string,
  shutdownTimeout: number = DEFAULT_SHUTDOWN_TIMEOUT,
  customLogger: Logger = defaultLogger
): void {
  let isShuttingDown = false;

  const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) {
      customLogger.error("Force shutdown requested");
      process.exit(1);
    }

    isShuttingDown = true;
    customLogger.info(`\nReceived ${signal}, shutting down gracefully...`);
    customLogger.info("Press Ctrl+C again to force shutdown");

    // Give a moment for cleanup, then exit
    setTimeout(() => {
      customLogger.error("Shutdown timeout, forcing exit");
      process.exit(1);
    }, shutdownTimeout);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}
