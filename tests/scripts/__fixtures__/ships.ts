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
 * By default, includes attributes with category "Unknown" for type compatibility.
 * To test cases without attributes, explicitly pass { attributes: undefined }
 */
export function createMockShip(overrides: Partial<MockShip> = {}): MockShip {
  // If attributes is explicitly set (including undefined), use it
  // Otherwise, provide default attributes for type compatibility
  const hasAttributesKey = "attributes" in overrides;
  const defaultAttributes = hasAttributesKey
    ? undefined
    : { category: "Unknown" };

  return {
    name: "Test Ship",
    ...(defaultAttributes && { attributes: defaultAttributes }),
    ...overrides,
    // If attributes was explicitly provided (even as undefined), use it
    ...(hasAttributesKey && { attributes: overrides.attributes }),
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
