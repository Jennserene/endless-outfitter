/**
 * Converter function type for converting raw data to validated types
 */
export type Converter<T> = (rawData: unknown[], species?: string) => T[];
