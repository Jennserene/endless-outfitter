import type { Logger } from "./types";
import winston from "winston";

/**
 * Winston-based logger implementation
 * Provides the Logger interface and configures Winston
 */
export class WinstonLogger implements Logger {
  private readonly winston: winston.Logger;

  constructor(
    level: string = "info",
    structured: boolean = false,
    silent: boolean = false
  ) {
    // Configure Winston format
    const format = structured
      ? // JSON format for production/log aggregation
        winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : // Human-readable format for development
        winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.errors({ stack: true }),
          winston.format.printf(
            ({ timestamp, level, message, type, ...meta }) => {
              // Handle success type with emoji
              const prefix = type === "success" ? "✓ " : "";
              const metaStr =
                Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
              return `${timestamp} [${level}]: ${prefix}${message}${metaStr}`;
            }
          )
        );

    // Configure transports - empty array for silent mode
    const transports: winston.transport[] = silent
      ? []
      : [new winston.transports.Console()];

    this.winston = winston.createLogger({
      level,
      format,
      transports,
    });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.winston.debug(message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.winston.info(message, context);
  }

  success(message: string, context?: Record<string, unknown>): void {
    // Winston doesn't have a "success" level, so we use info with a type marker
    this.winston.info(message, { ...context, type: "success" });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.winston.warn(message, context);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ): void {
    // Winston handles Error objects natively when passed as metadata
    const metadata: Record<string, unknown> = { ...context };
    if (error instanceof Error) {
      metadata.error = error;
    } else if (error !== undefined) {
      metadata.error = String(error);
    }
    this.winston.error(message, metadata);
  }
}
