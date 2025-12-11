/**
 * Shared mock setup utilities for test files
 * Provides common mock configurations that can be reused across tests
 */

import { mockLogger } from "../__mocks__/logger";
import { mockFs } from "../__mocks__/fs";
import { TEST_PATHS } from "../__mocks__/paths";
import { TEST_CONFIG } from "../__mocks__/config";

/**
 * Setup common mocks used across multiple test files
 * This includes logger, fs, paths, and config mocks
 */
export function setupCommonMocks() {
  jest.mock("@/lib/logger", () => ({
    logger: mockLogger,
  }));

  jest.mock("fs", () => mockFs);

  jest.mock("@scripts/utils/paths", () => TEST_PATHS);

  jest.mock("@config/game-version", () => ({
    GAME_VERSION: TEST_CONFIG.GAME_VERSION,
    GAME_REPO_PATH: "vendor/endless-sky",
  }));

  jest.mock("@config/data-schema-version", () => ({
    DATA_SCHEMA_FORMAT_VERSION: "1.0",
  }));
}

/**
 * Setup logger mock only
 */
export function setupLoggerMock() {
  jest.mock("@/lib/logger", () => ({
    logger: mockLogger,
  }));
}

/**
 * Setup fs mock only
 */
export function setupFsMock() {
  jest.mock("fs", () => mockFs);
}

/**
 * Setup paths mock only
 */
export function setupPathsMock() {
  jest.mock("@scripts/utils/paths", () => TEST_PATHS);
}

/**
 * Setup config mocks (game-version and data-schema-version)
 */
export function setupConfigMocks() {
  jest.mock("@config/game-version", () => ({
    GAME_VERSION: TEST_CONFIG.GAME_VERSION,
    GAME_REPO_PATH: "vendor/endless-sky",
  }));

  jest.mock("@config/data-schema-version", () => ({
    DATA_SCHEMA_FORMAT_VERSION: "1.0",
  }));
}

/**
 * Setup parser-related mocks (retrieve-game-data, game-data-parser, species, file-io)
 */
export function setupParserMocks() {
  jest.mock("@scripts/parsers/retrieve-game-data", () => ({
    readGameDataFiles: jest.fn(),
    GameDataPaths: {
      SHIPS: ["ships.txt"],
      OUTFITS: ["outfits.txt"],
    },
  }));

  jest.mock("@scripts/parsers/game-data-parser", () => ({
    parseIndentedFormat: jest.fn(),
    nodesToObject: jest.fn(),
  }));

  jest.mock("@scripts/utils/species", () => ({
    groupFilesBySpecies: jest.fn(),
  }));

  jest.mock("@scripts/utils/file-io", () => ({
    writeJsonFile: jest.fn(),
    getSpeciesFilePath: jest.fn(),
  }));
}

/**
 * Setup converter-related mocks (parsers, transformers, error-handling, schemas)
 * Note: This function should be called at the module level, not inside tests
 */
export function setupConverterMocks(itemType: "ship" | "outfit") {
  const parseModule =
    itemType === "ship"
      ? "@scripts/parsers/parse-ship-txt"
      : "@scripts/parsers/parse-outfit-txt";
  const parseFunction =
    itemType === "ship" ? "parseShipData" : "parseOutfitData";
  const transformerModule =
    itemType === "ship"
      ? "@scripts/transformers/ship-transformer"
      : "@scripts/transformers/outfit-transformer";
  const transformerClass =
    itemType === "ship" ? "ShipTransformer" : "OutfitTransformer";
  const schemaModule =
    itemType === "ship" ? "@/lib/schemas/ship" : "@/lib/schemas/outfit";
  const schemaName = itemType === "ship" ? "ShipSchema" : "OutfitSchema";

  jest.mock(parseModule, () => ({
    [parseFunction]: jest.fn(),
  }));

  jest.mock(transformerModule, () => ({
    [transformerClass]: jest.fn(),
  }));

  jest.mock("@scripts/utils/error-handling", () => ({
    handleValidationError: jest.fn(),
  }));

  jest.mock(schemaModule, () => ({
    [schemaName]: {
      parse: jest.fn(),
    },
  }));
}

/**
 * Setup generator-related mocks (BaseGenerator)
 */
export function setupGeneratorMocks() {
  jest.mock("@scripts/generators/base-generator");
}
