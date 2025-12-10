/**
 * Unified logger system for scripts and application
 * Provides the Logger interface and configures Winston
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info('Processing data');
 * logger.success('Data processed successfully');
 * logger.error('Failed to process', error);
 * ```
 */

export type { Logger } from "./types";
export { createLogger, createDefaultLogger } from "./logger-factory";
export type { LoggerOptions } from "./logger-factory";

// Default logger instance - automatically configured for current environment
import { createDefaultLogger } from "./logger-factory";
export const logger = createDefaultLogger();
