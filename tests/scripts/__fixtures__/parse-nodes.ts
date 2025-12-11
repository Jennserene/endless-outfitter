/**
 * Shared mock ParseNode structures for testing parsers
 */

export interface MockParseNode {
  key: string;
  value: string | number | undefined;
  children: MockParseNode[];
  lineNumber: number;
}

/**
 * Create a mock ship node
 */
export function createMockShipNode(
  name: string,
  attributes: Record<string, string | number> = {},
  lineNumber = 1
): MockParseNode {
  return {
    key: "ship",
    value: name,
    children: Object.entries(attributes).map(([key, value], idx) => ({
      key,
      value: String(value),
      children: [],
      lineNumber: lineNumber + idx + 1,
    })),
    lineNumber,
  };
}

/**
 * Create a mock outfit node
 */
export function createMockOutfitNode(
  name: string,
  attributes: Record<string, string | number> = {},
  lineNumber = 1
): MockParseNode {
  return {
    key: "outfit",
    value: name,
    children: Object.entries(attributes).map(([key, value], idx) => ({
      key,
      value: String(value),
      children: [],
      lineNumber: lineNumber + idx + 1,
    })),
    lineNumber,
  };
}

/**
 * Common test species names
 */
export const TEST_SPECIES = {
  HUMAN: "human",
  PUG: "pug",
  HAI: "hai",
  SHERAGI: "sheragi",
} as const;
