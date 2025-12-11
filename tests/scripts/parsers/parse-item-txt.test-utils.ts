/**
 * Shared parser test utilities
 * Provides reusable test functions for both ship and outfit parsers
 */

import type { Mock } from "jest-mock";
import { TEST_SUCCESS_MESSAGES } from "../__fixtures__/constants";

/**
 * Configuration for parser tests
 */
export interface ParserTestConfig {
  itemType: "ship" | "outfit";
  itemKey: string;
  parseDataFn: (
    content: string
  ) => Array<{ name: string; [key: string]: unknown }>;
  parseTxtFn: () => void;
  otherItemKey: string;
  loggerMessage: string;
}

/**
 * Create mock nodes for parser tests
 */
export function createMockNodes(
  itemKey: string,
  itemName: string,
  attributes: Array<{ key: string; value: string | number }> = []
) {
  return [
    {
      key: itemKey,
      value: itemName,
      children: attributes.map((attr) => ({
        key: attr.key,
        value: attr.value,
        children: [],
      })),
      lineNumber: 1,
    },
  ];
}

/**
 * Test parseData function with valid content
 */
export function testParseData(
  config: ParserTestConfig,
  mocks: {
    parseIndentedFormat: Mock;
    nodesToObject: Mock;
  },
  testData: {
    content: string;
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
) {
  const { content, mockNodes, expectedOutput } = testData;

  mocks.parseIndentedFormat.mockReturnValue(mockNodes);
  mocks.nodesToObject
    .mockReturnValueOnce(expectedOutput[0] || {})
    .mockReturnValueOnce(expectedOutput[1] || {});

  const result = config.parseDataFn(content);

  expect(result).toEqual(expectedOutput);
}

/**
 * Test parseData with no items (other item type)
 */
export function testParseDataNoItems(
  config: ParserTestConfig,
  mocks: {
    parseIndentedFormat: Mock;
  },
  content: string
) {
  mocks.parseIndentedFormat.mockReturnValue([
    {
      key: config.otherItemKey,
      value: `Test ${config.otherItemKey}`,
      children: [],
      lineNumber: 1,
    },
  ]);

  const result = config.parseDataFn(content);

  expect(result).toEqual([]);
}

/**
 * Test parseData with empty content
 */
export function testParseDataEmpty(
  config: ParserTestConfig,
  mocks: {
    parseIndentedFormat: Mock;
  }
) {
  mocks.parseIndentedFormat.mockReturnValue([]);

  const result = config.parseDataFn("");

  expect(result).toEqual([]);
}

/**
 * Test parseTxt workflow with single species
 */
export function testParseTxtSingleSpecies(
  config: ParserTestConfig,
  mocks: {
    readGameDataFiles: Mock;
    groupFilesBySpecies: Mock;
    parseIndentedFormat: Mock;
    nodesToObject: Mock;
    writeJsonFile: Mock;
    getSpeciesFilePath: Mock;
    logger: { info: Mock; success: Mock };
  },
  testData: {
    mockFiles: Array<{ path: string; content: string }>;
    mockSpeciesMap: Map<string, string[]>;
    mockNodes: Array<{
      key: string;
      value: string;
      children: Array<{ key: string; value: string; children: unknown[] }>;
      lineNumber: number;
    }>;
    expectedOutput: Array<{ name: string; [key: string]: unknown }>;
    filePath: string;
    species: string;
  }
) {
  const {
    mockFiles,
    mockSpeciesMap,
    mockNodes,
    expectedOutput,
    filePath,
    species,
  } = testData;

  mocks.readGameDataFiles.mockReturnValue(mockFiles);
  mocks.groupFilesBySpecies.mockReturnValue(mockSpeciesMap);
  mocks.parseIndentedFormat.mockReturnValue(mockNodes);
  mocks.nodesToObject.mockReturnValue(expectedOutput[0] || {});
  mocks.getSpeciesFilePath.mockReturnValue(filePath);

  config.parseTxtFn();

  expect(mocks.logger.info).toHaveBeenCalledWith(config.loggerMessage);
  expect(mocks.writeJsonFile).toHaveBeenCalledWith(filePath, expectedOutput);
  expect(mocks.logger.success).toHaveBeenCalledWith(
    config.itemType === "ship"
      ? TEST_SUCCESS_MESSAGES.PARSED_SHIP(
          1,
          species,
          `${config.itemType}s-${species}.json`
        )
      : TEST_SUCCESS_MESSAGES.PARSED_OUTFIT(
          1,
          species,
          `${config.itemType}s-${species}.json`
        )
  );
  expect(mocks.logger.success).toHaveBeenCalledWith(
    TEST_SUCCESS_MESSAGES.TOTAL_SINGLE(1, `${config.itemType}s`, 1)
  );
}

/**
 * Test parseTxt workflow with multiple species
 */
export function testParseTxtMultipleSpecies(
  config: ParserTestConfig,
  mocks: {
    readGameDataFiles: Mock;
    groupFilesBySpecies: Mock;
    parseIndentedFormat: Mock;
    nodesToObject: Mock;
    writeJsonFile: Mock;
    getSpeciesFilePath: Mock;
    logger: { info: Mock; success: Mock };
  },
  testData: {
    mockFiles: Array<{ path: string; content: string }>;
    mockSpeciesMap: Map<string, string[]>;
    mockNodes1: Array<{
      key: string;
      value: string;
      children: unknown[];
      lineNumber: number;
    }>;
    mockNodes2: Array<{
      key: string;
      value: string;
      children: unknown[];
      lineNumber: number;
    }>;
    filePath1: string;
    filePath2: string;
    totalCount: number;
    speciesCount: number;
  }
) {
  const {
    mockFiles,
    mockSpeciesMap,
    mockNodes1,
    mockNodes2,
    filePath1,
    filePath2,
    totalCount,
    speciesCount,
  } = testData;

  mocks.readGameDataFiles.mockReturnValue(mockFiles);
  mocks.groupFilesBySpecies.mockReturnValue(mockSpeciesMap);
  mocks.parseIndentedFormat
    .mockReturnValueOnce(mockNodes1)
    .mockReturnValueOnce(mockNodes2);
  mocks.nodesToObject.mockReturnValueOnce({}).mockReturnValueOnce({});
  mocks.getSpeciesFilePath
    .mockReturnValueOnce(filePath1)
    .mockReturnValueOnce(filePath2);

  config.parseTxtFn();

  expect(mocks.writeJsonFile).toHaveBeenCalledTimes(2);
  expect(mocks.logger.success).toHaveBeenCalledWith(
    TEST_SUCCESS_MESSAGES.TOTAL_SINGLE(
      totalCount,
      `${config.itemType}s`,
      speciesCount
    )
  );
}
