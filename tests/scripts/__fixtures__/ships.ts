/**
 * Shared test fixtures for ship objects
 */

export interface MockShip {
  name: string;
  plural?: string;
  sprite?: string;
  thumbnail?: string;
  attributes?: Record<string, unknown>;
  outfits?: Array<{ name: string; quantity?: number }>;
  descriptions?: string[];
  [key: string]: unknown;
}

/**
 * Create a basic mock ship
 */
export function createMockShip(overrides: Partial<MockShip> = {}): MockShip {
  return {
    name: "Test Ship",
    ...overrides,
  };
}

/**
 * Create a mock ship with attributes
 */
export function createMockShipWithAttributes(
  attributes: Record<string, unknown> = {},
  overrides: Partial<MockShip> = {}
): MockShip {
  return createMockShip({
    attributes: {
      category: "Unknown",
      ...attributes,
    },
    ...overrides,
  });
}

/**
 * Create a mock ship with full structure
 */
export function createMockShipFull(
  overrides: Partial<MockShip> = {}
): MockShip {
  return createMockShip({
    plural: "Test Ships",
    sprite: "sprite.png",
    thumbnail: "thumbnail.png",
    attributes: {
      category: "Fighter",
      mass: 100,
      cost: 1000,
      drag: 0.5,
    },
    outfits: [{ name: "Engine", quantity: 1 }],
    descriptions: ["A test ship"],
    ...overrides,
  });
}

/**
 * Create a raw ship (before transformation)
 */
export function createRawShip(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    name: "Test Ship",
    mass: "100",
    cost: "1000",
    ...overrides,
  };
}
