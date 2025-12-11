/**
 * Shared test fixtures for outfit objects
 */

export interface MockOutfit {
  name: string;
  plural?: string;
  category?: string;
  series?: string;
  index?: number;
  cost?: number;
  thumbnail?: string;
  mass?: number;
  "outfit space"?: number;
  descriptions?: string[];
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Create a basic mock outfit
 */
export function createMockOutfit(
  overrides: Partial<MockOutfit> = {}
): MockOutfit {
  return {
    name: "Test Outfit",
    ...overrides,
  };
}

/**
 * Create a mock outfit with full structure
 */
export function createMockOutfitFull(
  overrides: Partial<MockOutfit> = {}
): MockOutfit {
  return createMockOutfit({
    plural: "Test Outfits",
    category: "Engine",
    cost: 1000,
    mass: 10,
    thumbnail: "thumbnail.png",
    descriptions: ["A test outfit"],
    attributes: {},
    ...overrides,
  });
}

/**
 * Create a raw outfit (before transformation)
 */
export function createRawOutfit(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    name: "Test Outfit",
    mass: "10",
    cost: "1000",
    ...overrides,
  };
}
