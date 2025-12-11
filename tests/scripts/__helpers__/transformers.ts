/**
 * Helper functions for creating transformer mocks
 */

/**
 * Create a mock transformer instance with a transform method
 */
export function createMockTransformer<TInput = unknown, TOutput = unknown>() {
  return {
    transform: jest.fn<TOutput, [TInput]>(),
  };
}

/**
 * Create multiple mock transformers for a chain
 */
export function createMockTransformerChain(count: number) {
  return Array.from({ length: count }, () => createMockTransformer());
}

/**
 * Setup transformer mocks for ShipTransformer dependencies
 */
export function setupShipTransformerMocks() {
  const mockAttributesNormalizer = createMockTransformer();
  const mockNumericNormalizer = createMockTransformer();
  const mockLicensesExtractor = createMockTransformer();
  const mockOutfitsListTransformer = createMockTransformer();
  const mockDescriptionsExtractor = createMockTransformer();
  const mockSpriteThumbnailExtractor = createMockTransformer();

  return {
    mockAttributesNormalizer,
    mockNumericNormalizer,
    mockLicensesExtractor,
    mockOutfitsListTransformer,
    mockDescriptionsExtractor,
    mockSpriteThumbnailExtractor,
  };
}
