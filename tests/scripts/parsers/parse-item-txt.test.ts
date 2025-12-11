import { parseItemTxt } from "@scripts/parsers/parse-item-txt";
import { logger } from "@/lib/logger";
import * as retrieveGameData from "@scripts/parsers/retrieve-game-data";
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
    SHIPS: ["ships.txt"],
    OUTFITS: ["outfits.txt"],
  },
}));

jest.mock("@scripts/utils/species", () => ({
  groupFilesBySpecies: jest.fn(),
}));

jest.mock("@scripts/utils/file-io", () => ({
  writeJsonFile: jest.fn(),
  getSpeciesFilePath: jest.fn(),
}));

describe("parse-item-txt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseItemTxt", () => {
    it("When parsing ships, Then should process all species and write output files", () => {
      // Arrange
      const mockFiles = [
        { path: "ships.txt", content: "ship Test Ship\n\tmass 100" },
      ];
      const mockSpeciesMap = new Map([
        ["human", ["ship Test Ship\n\tmass 100"]],
      ]);
      const parseItemData = jest
        .fn()
        .mockReturnValue([{ name: "Test Ship", mass: "100" }]);

      (retrieveGameData.readGameDataFiles as jest.Mock).mockReturnValue(
        mockFiles
      );
      (speciesUtils.groupFilesBySpecies as jest.Mock).mockReturnValue(
        mockSpeciesMap
      );
      (fileIo.getSpeciesFilePath as jest.Mock).mockReturnValue(
        "/test/ships-human.json"
      );

      // Act
      parseItemTxt("ship", "ship", parseItemData, "/test/raw/ships", "ships", [
        "ships.txt",
      ]);

      // Assert
      expect(logger.info).toHaveBeenCalledWith("Parsing ships to raw JSON...");
      expect(parseItemData).toHaveBeenCalledWith("ship Test Ship\n\tmass 100");
      expect(fileIo.writeJsonFile).toHaveBeenCalledWith(
        "/test/ships-human.json",
        [{ name: "Test Ship", mass: "100" }]
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Parsed 1 ships (human) to ships-human.json"
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Total: 1 ships across 1 species"
      );
    });

    it("When parsing outfits, Then should process all species and write output files", () => {
      // Arrange
      const mockFiles = [
        { path: "outfits.txt", content: "outfit Test Outfit\n\tmass 10" },
      ];
      const mockSpeciesMap = new Map([
        ["human", ["outfit Test Outfit\n\tmass 10"]],
      ]);
      const parseItemData = jest
        .fn()
        .mockReturnValue([{ name: "Test Outfit", mass: "10" }]);

      (retrieveGameData.readGameDataFiles as jest.Mock).mockReturnValue(
        mockFiles
      );
      (speciesUtils.groupFilesBySpecies as jest.Mock).mockReturnValue(
        mockSpeciesMap
      );
      (fileIo.getSpeciesFilePath as jest.Mock).mockReturnValue(
        "/test/outfits-human.json"
      );

      // Act
      parseItemTxt(
        "outfit",
        "outfit",
        parseItemData,
        "/test/raw/outfits",
        "outfits",
        ["outfits.txt"]
      );

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "Parsing outfits to raw JSON..."
      );
      expect(parseItemData).toHaveBeenCalledWith(
        "outfit Test Outfit\n\tmass 10"
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

    it("When parsing multiple species, Then should write files for each species", () => {
      // Arrange
      const mockFiles = [
        { path: "ships.txt", content: "ship Ship1" },
        { path: "kestrel.txt", content: "ship Ship2" },
      ];
      const mockSpeciesMap = new Map([
        ["human", ["ship Ship1"]],
        ["pug", ["ship Ship2"]],
      ]);
      const parseItemData = jest
        .fn()
        .mockReturnValueOnce([{ name: "Ship1" }])
        .mockReturnValueOnce([{ name: "Ship2" }]);

      (retrieveGameData.readGameDataFiles as jest.Mock).mockReturnValue(
        mockFiles
      );
      (speciesUtils.groupFilesBySpecies as jest.Mock).mockReturnValue(
        mockSpeciesMap
      );
      (fileIo.getSpeciesFilePath as jest.Mock)
        .mockReturnValueOnce("/test/ships-human.json")
        .mockReturnValueOnce("/test/ships-pug.json");

      // Act
      parseItemTxt("ship", "ship", parseItemData, "/test/raw/ships", "ships", [
        "ships.txt",
      ]);

      // Assert
      expect(fileIo.writeJsonFile).toHaveBeenCalledTimes(2);
      expect(logger.success).toHaveBeenCalledWith(
        "Total: 2 ships across 2 species"
      );
    });
  });
});
