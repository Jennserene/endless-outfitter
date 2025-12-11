/**
 * Shared schema mocks for ShipSchema and OutfitSchema
 */

export const mockShipSchema = {
  parse: jest.fn(),
};

export const mockOutfitSchema = {
  parse: jest.fn(),
};

/**
 * Create a mock ShipSchema
 */
export function createMockShipSchema() {
  return {
    parse: jest.fn(),
  };
}

/**
 * Create a mock OutfitSchema
 */
export function createMockOutfitSchema() {
  return {
    parse: jest.fn(),
  };
}
