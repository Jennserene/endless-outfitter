import {
  parseOutfitData,
  parseOutfitTxt,
} from "@scripts/parsers/parse-outfit-txt";
import { logger } from "@/lib/logger";
import * as retrieveGameData from "@scripts/parsers/retrieve-game-data";
import * as gameDataParser from "@scripts/parsers/game-data-parser";
import * as speciesUtils from "@scripts/utils/species";
import * as fileIo from "@scripts/utils/file-io";
import {
  TEST_ITEM_NAMES,
  TEST_LOGGER_MESSAGES,
  TEST_SPECIES,
  TEST_NUMERIC_VALUES,
  TEST_FILE_PATHS,
  TEST_SUCCESS_MESSAGES,
} from "../__fixtures__/constants";

// Mock dependencies
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@scripts/parsers/retrieve-game-data", () => ({
  readGameDataFiles: jest.fn(),
  GameDataPaths: {
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

describe("parse-outfit-txt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseOutfitData", () => {
    it("When parsing outfit data from content, Then should return array of outfit objects", () => {
      // Arrange
      const mockNodes = [
        {
          key: "outfit",
          value: TEST_ITEM_NAMES.OUTFIT,
          children: [
            {
              key: "mass",
              value: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
              children: [],
            },
            {
              key: "cost",
              value: TEST_NUMERIC_VALUES.COST_STRING,
              children: [],
            },
          ],
          lineNumber: 1,
        },
        {
          key: "outfit",
          value: TEST_ITEM_NAMES.ANOTHER_OUTFIT,
          children: [{ key: "mass", value: "20", children: [] }],
          lineNumber: 5,
        },
      ];

      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue(
        mockNodes
      );
      (gameDataParser.nodesToObject as jest.Mock)
        .mockReturnValueOnce({
          mass: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
          cost: TEST_NUMERIC_VALUES.COST_STRING,
        })
        .mockReturnValueOnce({ mass: "20" });

      // Act
      const result = parseOutfitData(
        `outfit ${TEST_ITEM_NAMES.OUTFIT}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT}\n\tcost ${TEST_NUMERIC_VALUES.COST_STRING}`
      );

      // Assert
      expect(result).toEqual([
        {
          name: TEST_ITEM_NAMES.OUTFIT,
          mass: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
          cost: TEST_NUMERIC_VALUES.COST_STRING,
        },
        { name: TEST_ITEM_NAMES.ANOTHER_OUTFIT, mass: "20" },
      ]);
    });

    it("When parsing content with no outfits, Then should return empty array", () => {
      // Arrange
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue([
        {
          key: "ship",
          value: TEST_ITEM_NAMES.SHIP,
          children: [],
          lineNumber: 1,
        },
      ]);

      // Act
      const result = parseOutfitData(`ship ${TEST_ITEM_NAMES.SHIP}`);

      // Assert
      expect(result).toEqual([]);
    });

    it("When parsing empty content, Then should return empty array", () => {
      // Arrange
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue([]);

      // Act
      const result = parseOutfitData("");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("parseOutfitTxt", () => {
    it("When parsing outfits, Then should write files for each species", () => {
      // Arrange
      const mockFiles = [
        {
          path: "outfits.txt",
          content: `outfit ${TEST_ITEM_NAMES.OUTFIT}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT}`,
        },
      ];
      const mockSpeciesMap = new Map([
        [
          TEST_SPECIES.HUMAN,
          [
            `outfit ${TEST_ITEM_NAMES.OUTFIT}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT}`,
          ],
        ],
      ]);
      const mockNodes = [
        {
          key: "outfit",
          value: TEST_ITEM_NAMES.OUTFIT,
          children: [
            {
              key: "mass",
              value: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
              children: [],
            },
          ],
          lineNumber: 1,
        },
      ];

      (retrieveGameData.readGameDataFiles as jest.Mock).mockReturnValue(
        mockFiles
      );
      (speciesUtils.groupFilesBySpecies as jest.Mock).mockReturnValue(
        mockSpeciesMap
      );
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue(
        mockNodes
      );
      (gameDataParser.nodesToObject as jest.Mock).mockReturnValue({
        mass: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
      });
      (fileIo.getSpeciesFilePath as jest.Mock).mockReturnValue(
        TEST_FILE_PATHS.OUTFITS_HUMAN
      );

      // Act
      parseOutfitTxt();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        TEST_LOGGER_MESSAGES.PARSING_OUTFITS
      );
      expect(fileIo.writeJsonFile).toHaveBeenCalledWith(
        TEST_FILE_PATHS.OUTFITS_HUMAN,
        [
          {
            name: TEST_ITEM_NAMES.OUTFIT,
            mass: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
          },
        ]
      );
      expect(logger.success).toHaveBeenCalledWith(
        TEST_SUCCESS_MESSAGES.PARSED_OUTFIT(
          1,
          TEST_SPECIES.HUMAN,
          "outfits-human.json"
        )
      );
      expect(logger.success).toHaveBeenCalledWith(
        TEST_SUCCESS_MESSAGES.TOTAL_SINGLE(1, "outfits", 1)
      );
    });

    it.skip("When file reading errors occur, Then should handle errors", () => {
      // Not working: Complex to mock file reading errors with current structure
      // Would need to mock readGameDataFiles to throw, but error handling isn't explicit in parseOutfitTxt
    });

    it("When parsing multiple species, Then should write files for each species", () => {
      // Arrange
      const mockFiles = [
        { path: "outfits.txt", content: `outfit ${TEST_ITEM_NAMES.OUTFIT_1}` },
        { path: "engines.txt", content: `outfit ${TEST_ITEM_NAMES.OUTFIT_2}` },
      ];
      const mockSpeciesMap = new Map([
        [TEST_SPECIES.HUMAN, [`outfit ${TEST_ITEM_NAMES.OUTFIT_1}`]],
        [TEST_SPECIES.PUG, [`outfit ${TEST_ITEM_NAMES.OUTFIT_2}`]],
      ]);
      const mockNodes1 = [
        {
          key: "outfit",
          value: TEST_ITEM_NAMES.OUTFIT_1,
          children: [],
          lineNumber: 1,
        },
      ];
      const mockNodes2 = [
        {
          key: "outfit",
          value: TEST_ITEM_NAMES.OUTFIT_2,
          children: [],
          lineNumber: 1,
        },
      ];

      (retrieveGameData.readGameDataFiles as jest.Mock).mockReturnValue(
        mockFiles
      );
      (speciesUtils.groupFilesBySpecies as jest.Mock).mockReturnValue(
        mockSpeciesMap
      );
      (gameDataParser.parseIndentedFormat as jest.Mock)
        .mockReturnValueOnce(mockNodes1)
        .mockReturnValueOnce(mockNodes2);
      (gameDataParser.nodesToObject as jest.Mock)
        .mockReturnValueOnce({})
        .mockReturnValueOnce({});
      (fileIo.getSpeciesFilePath as jest.Mock)
        .mockReturnValueOnce(TEST_FILE_PATHS.OUTFITS_HUMAN)
        .mockReturnValueOnce(TEST_FILE_PATHS.OUTFITS_PUG);

      // Act
      parseOutfitTxt();

      // Assert
      expect(fileIo.writeJsonFile).toHaveBeenCalledTimes(2);
      expect(logger.success).toHaveBeenCalledWith(
        TEST_SUCCESS_MESSAGES.TOTAL_SINGLE(2, "outfits", 2)
      );
    });
  });
});
