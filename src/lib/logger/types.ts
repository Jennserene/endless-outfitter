/**
 * Logger interface for unified logging across scripts and app
 */
export interface Logger {
  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log informational message
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log success message (formatted with ✓)
   */
  success(message: string, context?: Record<string, unknown>): void;

  /**
   * Log warning message (formatted with ⚠)
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log error message (formatted with ✗)
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ): void;
}
