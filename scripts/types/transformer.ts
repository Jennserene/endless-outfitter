/**
 * Transformer interface for transforming raw data
 */
export interface Transformer {
  transform(input: unknown): unknown;
}
