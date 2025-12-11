/**
 * Shared converter test utilities
 * Provides reusable test functions for both ship and outfit converters
 */

import type { Mock } from "jest-mock";
import { z } from "zod";
import { TEST_LOGGER_MESSAGES } from "../__fixtures__/constants";
import { createMockTransformer } from "../__helpers__/transformers";

/**
 * Configuration for converter tests
 */
export interface ConverterTestConfig<T> {
  itemType: "ship" | "outfit";
  parseModule: string;
  parseFunction: string;
  transformerModule: string;
  transformerClass: string;
  schemaModule: string;
  schemaName: string;
  convertFromContentFn: (content: string) => unknown[];
  convertRawFn: (items: T[], species?: string) => unknown[];
  createRawItem: (overrides?: Partial<T>) => T;
  createMockItem: (overrides?: Partial<unknown>) => unknown;
  createMockItemWithAttributes?: (overrides?: Partial<unknown>) => unknown;
  transformerExtraProps?: Record<string, unknown>;
}

/**
 * Setup mocks for converter tests
 */
export function setupConverterMocks(config: ConverterTestConfig<unknown>) {
  jest.mock(config.parseModule, () => ({
    [config.parseFunction]: jest.fn(),
  }));

  jest.mock(config.transformerModule, () => ({
    [config.transformerClass]: jest.fn(),
  }));

  jest.mock("@scripts/utils/error-handling", () => ({
    handleValidationError: jest.fn(),
  }));

  jest.mock(config.schemaModule, () => ({
    [config.schemaName]: {
      parse: jest.fn(),
    },
  }));
}

/**
 * Create a mock transformer instance
 */
export function createMockTransformerInstance<T>(
  config: ConverterTestConfig<T>,
  transformerModule: unknown
): jest.Mocked<T> {
  const mockTransformer = {
    ...createMockTransformer(),
    ...(config.transformerExtraProps || {}),
  } as unknown as jest.Mocked<T>;

  (
    transformerModule as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: jest.MockedClass<new (...args: any[]) => any>;
    }
  )[config.transformerClass].mockImplementation(() => mockTransformer);

  return mockTransformer;
}

/**
 * Test convertFromContent function
 */
export function testConvertFromContent<T>(
  config: ConverterTestConfig<T>,
  mocks: {
    parseFunction: Mock;
    transformer: { transform: Mock };
    schemaParse: Mock;
  },
  testData: {
    content: string;
    rawItems: T[];
    transformed: unknown;
    validated: unknown;
  }
) {
  const { content, rawItems, transformed, validated } = testData;

  mocks.parseFunction.mockReturnValue(rawItems);
  mocks.transformer.transform.mockReturnValue(transformed);
  mocks.schemaParse.mockReturnValue(validated);

  const result = config.convertFromContentFn(content);

  expect(mocks.parseFunction).toHaveBeenCalledWith(content);
  expect(mocks.transformer.transform).toHaveBeenCalledWith(rawItems[0]);
  expect(mocks.schemaParse).toHaveBeenCalledWith(transformed);
  expect(result).toEqual([validated]);
}

/**
 * Test convertFromContent with multiple items
 */
export function testConvertMultipleItems<T>(
  config: ConverterTestConfig<T>,
  mocks: {
    parseFunction: Mock;
    transformer: { transform: Mock };
    schemaParse: Mock;
  },
  testData: {
    content: string;
    rawItems: T[];
    transformedItems: unknown[];
    validatedItems: unknown[];
  }
) {
  const { content, rawItems, transformedItems, validatedItems } = testData;

  mocks.parseFunction.mockReturnValue(rawItems);
  mocks.transformer.transform
    .mockReturnValueOnce(transformedItems[0])
    .mockReturnValueOnce(transformedItems[1]);
  mocks.schemaParse
    .mockReturnValueOnce(validatedItems[0])
    .mockReturnValueOnce(validatedItems[1]);

  const result = config.convertFromContentFn(content);

  expect(result).toHaveLength(2);
}

/**
 * Test validation error handling in convertFromContent
 */
export function testConvertFromContentValidationError<T>(
  config: ConverterTestConfig<T>,
  mocks: {
    parseFunction: Mock;
    transformer: { transform: Mock };
    schemaParse: Mock;
    handleValidationError: Mock;
  },
  testData: {
    content: string;
    rawItems: T[];
    transformed: unknown;
    zodError: unknown;
  }
) {
  const { content, rawItems, transformed, zodError } = testData;

  mocks.parseFunction.mockReturnValue(rawItems);
  mocks.transformer.transform.mockReturnValue(transformed);
  mocks.schemaParse.mockImplementation(() => {
    throw zodError;
  });
  mocks.handleValidationError.mockImplementation(() => {
    throw new Error(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);
  });

  expect(() => {
    config.convertFromContentFn(content);
  }).toThrow(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);

  expect(mocks.handleValidationError).toHaveBeenCalled();
}

/**
 * Test convertRaw function
 */
export function testConvertRaw<T>(
  config: ConverterTestConfig<T>,
  mocks: {
    transformer: { transform: Mock };
    schemaParse: Mock;
  },
  testData: {
    rawItems: T[];
    transformed: unknown;
    validated: unknown;
  }
) {
  const { rawItems, transformed, validated } = testData;

  mocks.transformer.transform.mockReturnValue(transformed);
  mocks.schemaParse.mockReturnValue(validated);

  const result = config.convertRawFn(rawItems);

  expect(mocks.transformer.transform).toHaveBeenCalledWith(rawItems[0]);
  expect(result).toEqual([validated]);
}

/**
 * Test convertRaw with validation error and species
 */
export function testConvertRawValidationErrorWithSpecies<T>(
  config: ConverterTestConfig<T>,
  mocks: {
    transformer: { transform: Mock };
    schemaParse: Mock;
    handleValidationError: Mock;
  },
  testData: {
    rawItems: T[];
    transformed: unknown;
    zodError: unknown;
    species: string;
  }
) {
  const { rawItems, transformed, zodError, species } = testData;

  mocks.transformer.transform.mockReturnValue(transformed);
  mocks.schemaParse.mockImplementation(() => {
    throw zodError;
  });
  mocks.handleValidationError.mockImplementation(() => {
    throw new Error(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);
  });

  expect(() => {
    config.convertRawFn(rawItems, species);
  }).toThrow(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);

  expect(mocks.handleValidationError).toHaveBeenCalledWith(
    expect.any(z.ZodError),
    expect.any(String),
    config.itemType,
    species
  );
}

/**
 * Test convertRaw with empty array
 */
export function testConvertRawEmptyArray<T>(config: ConverterTestConfig<T>) {
  const result = config.convertRawFn([]);
  expect(result).toEqual([]);
}
