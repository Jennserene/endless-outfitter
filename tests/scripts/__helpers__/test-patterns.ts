/**
 * Reusable test pattern utilities
 * Provides common test patterns that can be parameterized for different entity types
 */

import type { Mock } from "jest-mock";

/**
 * Common test data for converter tests
 */
export interface ConverterTestData<T> {
  content: string;
  rawItems: T[];
  transformed: unknown;
  validated: unknown;
}

/**
 * Common test data for parser tests
 */
export interface ParserTestData {
  mockFiles: Array<{ path: string; content: string }>;
  mockSpeciesMap: Map<string, string[]>;
  mockNodes: Array<{
    key: string;
    value: string;
    children: Array<{
      key: string;
      value: string | number;
      children: unknown[];
    }>;
    lineNumber: number;
  }>;
  expectedOutput: Array<{ name: string; [key: string]: unknown }>;
}

/**
 * Common test data for generator tests
 */
export interface GeneratorTestData {
  converterFunction: string;
  rawDir: string;
  outputDir: string;
  itemType: string;
  itemName: string;
}

/**
 * Create a test suite builder for converter tests
 */
export function createConverterTestSuite<T>(config: {
  itemType: "ship" | "outfit";
  parseFunction: Mock;
  transformerClass: Mock;
  schemaParse: Mock;
  handleValidationError: Mock;
  createRawItem: (overrides?: Partial<T>) => T;
  createMockItem: (overrides?: Partial<unknown>) => unknown;
  createMockZodError: () => unknown;
}) {
  return {
    /**
     * Test successful conversion from content
     */
    testConvertFromContent: (testData: ConverterTestData<T>) => {
      const { rawItems, transformed, validated } = testData;

      config.parseFunction.mockReturnValue(rawItems);
      config.transformerClass.mockImplementation(() => ({
        transform: jest.fn().mockReturnValue(transformed),
      }));
      config.schemaParse.mockReturnValue(validated);

      return {
        parseFunction: config.parseFunction,
        transformerClass: config.transformerClass,
        schemaParse: config.schemaParse,
        expectedResult: [validated],
      };
    },

    /**
     * Test conversion with multiple items
     */
    testConvertMultipleItems: (
      content: string,
      rawItems: T[],
      transformedItems: unknown[],
      validatedItems: unknown[]
    ) => {
      config.parseFunction.mockReturnValue(rawItems);
      const mockTransformer = {
        transform: jest
          .fn()
          .mockReturnValueOnce(transformedItems[0])
          .mockReturnValueOnce(transformedItems[1]),
      };
      config.transformerClass.mockImplementation(() => mockTransformer);
      config.schemaParse
        .mockReturnValueOnce(validatedItems[0])
        .mockReturnValueOnce(validatedItems[1]);

      return {
        parseFunction: config.parseFunction,
        transformer: mockTransformer,
        schemaParse: config.schemaParse,
        expectedResult: validatedItems,
      };
    },

    /**
     * Test validation error handling
     */
    testValidationError: (
      content: string,
      rawItems: T[],
      transformed: unknown,
      zodError: unknown
    ) => {
      config.parseFunction.mockReturnValue(rawItems);
      config.transformerClass.mockImplementation(() => ({
        transform: jest.fn().mockReturnValue(transformed),
      }));
      config.schemaParse.mockImplementation(() => {
        throw zodError;
      });
      config.handleValidationError.mockImplementation(() => {
        throw new Error("Validation failed");
      });

      return {
        parseFunction: config.parseFunction,
        schemaParse: config.schemaParse,
        handleValidationError: config.handleValidationError,
        expectedError: "Validation failed",
      };
    },
  };
}

/**
 * Create a test suite builder for parser tests
 */
export function createParserTestSuite(config: {
  itemType: "ship" | "outfit";
  itemKey: string;
  parseFunction: string;
  readGameDataFiles: Mock;
  groupFilesBySpecies: Mock;
  parseIndentedFormat: Mock;
  nodesToObject: Mock;
  writeJsonFile: Mock;
  getSpeciesFilePath: Mock;
  logger: { info: Mock; success: Mock };
}) {
  return {
    /**
     * Test parsing data from content
     */
    testParseData: (
      content: string,
      mockNodes: Array<{
        key: string;
        value: string;
        children: Array<{ key: string; value: string; children: unknown[] }>;
        lineNumber: number;
      }>,
      expectedOutput: Array<{ name: string; [key: string]: unknown }>
    ) => {
      config.parseIndentedFormat.mockReturnValue(mockNodes);
      config.nodesToObject
        .mockReturnValueOnce(expectedOutput[0] || {})
        .mockReturnValueOnce(expectedOutput[1] || {});

      return {
        parseIndentedFormat: config.parseIndentedFormat,
        nodesToObject: config.nodesToObject,
        expectedResult: expectedOutput,
      };
    },

    /**
     * Test parsing with no items
     */
    testParseNoItems: (content: string, otherKey: string) => {
      config.parseIndentedFormat.mockReturnValue([
        {
          key: otherKey,
          value: "Test Item",
          children: [],
          lineNumber: 1,
        },
      ]);

      return {
        parseIndentedFormat: config.parseIndentedFormat,
        expectedResult: [],
      };
    },

    /**
     * Test full parsing workflow
     */
    testParseWorkflow: (testData: ParserTestData) => {
      const { mockFiles, mockSpeciesMap, mockNodes, expectedOutput } = testData;

      config.readGameDataFiles.mockReturnValue(mockFiles);
      config.groupFilesBySpecies.mockReturnValue(mockSpeciesMap);
      config.parseIndentedFormat.mockReturnValue(mockNodes);
      config.nodesToObject.mockReturnValue(expectedOutput[0] || {});
      config.getSpeciesFilePath.mockReturnValue(
        `/test/${config.itemType}s-human.json`
      );

      return {
        readGameDataFiles: config.readGameDataFiles,
        groupFilesBySpecies: config.groupFilesBySpecies,
        parseIndentedFormat: config.parseIndentedFormat,
        nodesToObject: config.nodesToObject,
        writeJsonFile: config.writeJsonFile,
        getSpeciesFilePath: config.getSpeciesFilePath,
        logger: config.logger,
      };
    },
  };
}

/**
 * Create a test suite builder for generator tests
 */
export function createGeneratorTestSuite(config: {
  itemType: "ship" | "outfit";
  BaseGenerator: Mock;
  converterFunction: Mock;
  rawDir: string;
  outputDir: string;
}) {
  return {
    /**
     * Test generator execution
     */
    testGeneratorExecution: (mockExecute: Mock) => {
      config.BaseGenerator.mockImplementation(
        () =>
          ({
            execute: mockExecute,
          }) as unknown
      );

      return {
        BaseGenerator: config.BaseGenerator,
        converterFunction: config.converterFunction,
        mockExecute,
      };
    },
  };
}
