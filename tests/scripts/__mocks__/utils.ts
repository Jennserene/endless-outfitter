/**
 * Shared utility function mocks
 */

export const mockDescriptionsUtils = {
  extractDescriptions: jest.fn(),
};

export const mockLicensesUtils = {
  extractLicenses: jest.fn(),
};

export const mockValueExtraction = {
  extractStringValue: jest.fn(),
  extractStringArray: jest.fn(),
};

export const mockNumericUtils = {
  normalizeNumeric: jest.fn(),
  normalizeNumericAttributes: jest.fn(),
};

/**
 * Create a mock descriptions utils module
 */
export function createMockDescriptionsUtils() {
  return {
    extractDescriptions: jest.fn(),
  };
}

/**
 * Create a mock licenses utils module
 */
export function createMockLicensesUtils() {
  return {
    extractLicenses: jest.fn(),
  };
}

/**
 * Create a mock value extraction module
 */
export function createMockValueExtraction() {
  return {
    extractStringValue: jest.fn(),
    extractStringArray: jest.fn(),
  };
}

/**
 * Create a mock numeric utils module
 */
export function createMockNumericUtils() {
  return {
    normalizeNumeric: jest.fn(),
    normalizeNumericAttributes: jest.fn(),
  };
}
