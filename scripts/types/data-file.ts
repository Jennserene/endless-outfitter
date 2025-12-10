import type { Metadata } from "./metadata";

/**
 * Structure of generated data files (ships or outfits)
 */
export interface GeneratedDataFile<T> {
  metadata: Metadata;
  data: T[];
}
