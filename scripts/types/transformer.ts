/**
 * Transformer interface for transforming raw data
 */
export interface Transformer<T = unknown> {
  transform(input: unknown): unknown;
}
