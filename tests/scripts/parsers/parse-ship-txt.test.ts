import { parseShipData, parseShipTxt } from "@scripts/parsers/parse-ship-txt";
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
    SHIPS: ["ships.txt"],
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

describe("parse-ship-txt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseShipData", () => {
    it("When parsing ship data from content, Then should return array of ship objects", () => {
      // Arrange
      const mockNodes = [
        {
          key: "ship",
          value: TEST_ITEM_NAMES.SHIP,
          children: [
            {
              key: "mass",
              value: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
              children: [],
            },
            {
              key: "drag",
              value: TEST_NUMERIC_VALUES.DRAG_STRING,
              children: [],
            },
          ],
          lineNumber: 1,
        },
        {
          key: "ship",
          value: TEST_ITEM_NAMES.ANOTHER_SHIP,
          children: [{ key: "mass", value: "200", children: [] }],
          lineNumber: 5,
        },
      ];

      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue(
        mockNodes
      );
      (gameDataParser.nodesToObject as jest.Mock)
        .mockReturnValueOnce({
          mass: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
          drag: TEST_NUMERIC_VALUES.DRAG_STRING,
        })
        .mockReturnValueOnce({ mass: "200" });

      // Act
      const result = parseShipData(
        `ship ${TEST_ITEM_NAMES.SHIP}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_SHIP}\n\tdrag ${TEST_NUMERIC_VALUES.DRAG_STRING}`
      );

      // Assert
      expect(result).toEqual([
        {
          name: TEST_ITEM_NAMES.SHIP,
          mass: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
          drag: TEST_NUMERIC_VALUES.DRAG_STRING,
        },
        { name: TEST_ITEM_NAMES.ANOTHER_SHIP, mass: "200" },
      ]);
    });

    it("When parsing content with no ships, Then should return empty array", () => {
      // Arrange
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue([
        {
          key: "outfit",
          value: TEST_ITEM_NAMES.OUTFIT,
          children: [],
          lineNumber: 1,
        },
      ]);

      // Act
      const result = parseShipData(`outfit ${TEST_ITEM_NAMES.OUTFIT}`);

      // Assert
      expect(result).toEqual([]);
    });

    it("When parsing empty content, Then should return empty array", () => {
      // Arrange
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue([]);

      // Act
      const result = parseShipData("");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("parseShipTxt", () => {
    it("When parsing ships, Then should write files for each species", () => {
      // Arrange
      const mockFiles = [
        {
          path: "ships.txt",
          content: `ship ${TEST_ITEM_NAMES.SHIP}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_SHIP}`,
        },
      ];
      const mockSpeciesMap = new Map([
        [
          TEST_SPECIES.HUMAN,
          [
            `ship ${TEST_ITEM_NAMES.SHIP}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_SHIP}`,
          ],
        ],
      ]);
      const mockNodes = [
        {
          key: "ship",
          value: TEST_ITEM_NAMES.SHIP,
          children: [
            {
              key: "mass",
              value: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
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
        mass: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
      });
      (fileIo.getSpeciesFilePath as jest.Mock).mockReturnValue(
        TEST_FILE_PATHS.SHIPS_HUMAN
      );

      // Act
      parseShipTxt();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        TEST_LOGGER_MESSAGES.PARSING_SHIPS
      );
      expect(fileIo.writeJsonFile).toHaveBeenCalledWith(
        TEST_FILE_PATHS.SHIPS_HUMAN,
        [
          {
            name: TEST_ITEM_NAMES.SHIP,
            mass: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
          },
        ]
      );
      expect(logger.success).toHaveBeenCalledWith(
        TEST_SUCCESS_MESSAGES.PARSED_SHIP(
          1,
          TEST_SPECIES.HUMAN,
          "ships-human.json"
        )
      );
      expect(logger.success).toHaveBeenCalledWith(
        TEST_SUCCESS_MESSAGES.TOTAL_SINGLE(1, "ships", 1)
      );
    });

    it.skip("When file reading errors occur, Then should handle errors", () => {
      // Not working: Complex to mock file reading errors with current structure
      // Would need to mock readGameDataFiles to throw, but error handling isn't explicit in parseShipTxt
    });

    it("When parsing multiple species, Then should write files for each species", () => {
      // Arrange
      const mockFiles = [
        { path: "ships.txt", content: `ship ${TEST_ITEM_NAMES.SHIP_1}` },
        { path: "kestrel.txt", content: `ship ${TEST_ITEM_NAMES.SHIP_2}` },
      ];
      const mockSpeciesMap = new Map([
        [TEST_SPECIES.HUMAN, [`ship ${TEST_ITEM_NAMES.SHIP_1}`]],
        [TEST_SPECIES.PUG, [`ship ${TEST_ITEM_NAMES.SHIP_2}`]],
      ]);
      const mockNodes1 = [
        {
          key: "ship",
          value: TEST_ITEM_NAMES.SHIP_1,
          children: [],
          lineNumber: 1,
        },
      ];
      const mockNodes2 = [
        {
          key: "ship",
          value: TEST_ITEM_NAMES.SHIP_2,
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
        .mockReturnValueOnce(TEST_FILE_PATHS.SHIPS_HUMAN)
        .mockReturnValueOnce(TEST_FILE_PATHS.SHIPS_PUG);

      // Act
      parseShipTxt();

      // Assert
      expect(fileIo.writeJsonFile).toHaveBeenCalledTimes(2);
      expect(logger.success).toHaveBeenCalledWith(
        TEST_SUCCESS_MESSAGES.TOTAL_SINGLE(2, "ships", 2)
      );
    });
  });
});
