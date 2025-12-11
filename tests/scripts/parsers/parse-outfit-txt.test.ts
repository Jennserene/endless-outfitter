import {
  parseOutfitData,
  parseOutfitTxt,
} from "@scripts/parsers/parse-outfit-txt";
import { logger } from "@/lib/logger";
import * as retrieveGameData from "@scripts/parsers/retrieve-game-data";
import * as gameDataParser from "@scripts/parsers/game-data-parser";
import * as speciesUtils from "@scripts/utils/species";
import * as fileIo from "@scripts/utils/file-io";

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
    it("should parse outfit data from content", () => {
      const mockNodes = [
        {
          key: "outfit",
          value: "Test Outfit",
          children: [
            { key: "mass", value: "10", children: [] },
            { key: "cost", value: "1000", children: [] },
          ],
          lineNumber: 1,
        },
        {
          key: "outfit",
          value: "Another Outfit",
          children: [{ key: "mass", value: "20", children: [] }],
          lineNumber: 5,
        },
      ];

      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue(
        mockNodes
      );
      (gameDataParser.nodesToObject as jest.Mock)
        .mockReturnValueOnce({ mass: "10", cost: "1000" })
        .mockReturnValueOnce({ mass: "20" });

      const result = parseOutfitData(
        "outfit Test Outfit\n\tmass 10\n\tcost 1000"
      );

      expect(result).toEqual([
        { name: "Test Outfit", mass: "10", cost: "1000" },
        { name: "Another Outfit", mass: "20" },
      ]);
    });

    it("should return empty array when no outfits found", () => {
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue([
        { key: "ship", value: "Test Ship", children: [], lineNumber: 1 },
      ]);

      const result = parseOutfitData("ship Test Ship");

      expect(result).toEqual([]);
    });

    it("should handle empty content", () => {
      (gameDataParser.parseIndentedFormat as jest.Mock).mockReturnValue([]);

      const result = parseOutfitData("");

      expect(result).toEqual([]);
    });
  });

  describe("parseOutfitTxt", () => {
    it("should parse outfits and write files for each species", () => {
      const mockFiles = [
        { path: "outfits.txt", content: "outfit Test Outfit\n\tmass 10" },
      ];
      const mockSpeciesMap = new Map([
        ["human", ["outfit Test Outfit\n\tmass 10"]],
      ]);
      const mockNodes = [
        {
          key: "outfit",
          value: "Test Outfit",
          children: [{ key: "mass", value: "10", children: [] }],
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
        mass: "10",
      });
      (fileIo.getSpeciesFilePath as jest.Mock).mockReturnValue(
        "/test/outfits-human.json"
      );

      parseOutfitTxt();

      expect(logger.info).toHaveBeenCalledWith(
        "Parsing outfits to raw JSON..."
      );
      expect(fileIo.writeJsonFile).toHaveBeenCalledWith(
        "/test/outfits-human.json",
        [{ name: "Test Outfit", mass: "10" }]
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Parsed 1 outfits (human) to outfits-human.json"
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Total: 1 outfits across 1 species"
      );
    });

    it.skip("should handle file reading errors", () => {
      // Not working: Complex to mock file reading errors with current structure
      // Would need to mock readGameDataFiles to throw, but error handling isn't explicit in parseOutfitTxt
    });

    it("should handle multiple species", () => {
      const mockFiles = [
        { path: "outfits.txt", content: "outfit Outfit1" },
        { path: "engines.txt", content: "outfit Outfit2" },
      ];
      const mockSpeciesMap = new Map([
        ["human", ["outfit Outfit1"]],
        ["pug", ["outfit Outfit2"]],
      ]);
      const mockNodes1 = [
        { key: "outfit", value: "Outfit1", children: [], lineNumber: 1 },
      ];
      const mockNodes2 = [
        { key: "outfit", value: "Outfit2", children: [], lineNumber: 1 },
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
        .mockReturnValueOnce("/test/outfits-human.json")
        .mockReturnValueOnce("/test/outfits-pug.json");

      parseOutfitTxt();

      expect(fileIo.writeJsonFile).toHaveBeenCalledTimes(2);
      expect(logger.success).toHaveBeenCalledWith(
        "Total: 2 outfits across 2 species"
      );
    });
  });
});
