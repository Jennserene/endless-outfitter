import {
  readGameDataFiles,
  GameDataPaths,
} from "@scripts/parsers/retrieve-game-data";
import * as fs from "fs";
import * as paths from "@scripts/utils/paths";
import * as fileIo from "@scripts/utils/file-io";

// Mock dependencies
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.mock("@scripts/utils/paths", () => ({
  getGameDataPath: jest.fn(),
  GameDataPaths: {
    SHIPS: ["ships.txt", "kestrel.txt"],
    OUTFITS: ["outfits.txt", "engines.txt"],
  },
}));

jest.mock("@scripts/utils/file-io", () => ({
  findDataFiles: jest.fn(),
}));

describe("retrieve-game-data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readGameDataFiles", () => {
    it("When reading game data files, Then should return files with content and species", () => {
      // Arrange
      const mockFiles = [
        { path: "/test/data/human/ships.txt", species: "human" },
        { path: "/test/data/pug/ships.txt", species: "pug" },
      ];

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce("ship Ship1")
        .mockReturnValueOnce("ship Ship2");

      // Act
      const result = readGameDataFiles(["ships.txt"]);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        content: "ship Ship1",
        species: "human",
      });
      expect(result[1]).toEqual({
        content: "ship Ship2",
        species: "pug",
      });
    });

    it("When no files are found, Then should throw error", () => {
      // Arrange
      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue([]);

      // Act & Assert
      expect(() => {
        readGameDataFiles(["ships.txt"]);
      }).toThrow("No game data files found matching [ships.txt] in /test/data");
    });

    it("When handling multiple filenames, Then should find all matching files", () => {
      // Arrange
      const mockFiles = [
        { path: "/test/data/human/ships.txt", species: "human" },
        { path: "/test/data/human/kestrel.txt", species: "human" },
      ];

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce("ship Ship1")
        .mockReturnValueOnce("ship Ship2");

      // Act
      const result = readGameDataFiles(["ships.txt", "kestrel.txt"]);

      // Assert
      expect(result).toHaveLength(2);
      expect(fileIo.findDataFiles).toHaveBeenCalledWith("/test/data", [
        "ships.txt",
        "kestrel.txt",
      ]);
    });

    it("When files have undefined species, Then should preserve undefined species", () => {
      // Arrange
      const mockFiles = [{ path: "/test/data/ships.txt", species: undefined }];

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock).mockReturnValue("ship Ship1");

      // Act
      const result = readGameDataFiles(["ships.txt"]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].species).toBeUndefined();
    });

    it("When reading file content, Then should read and return content correctly", () => {
      // Arrange
      const mockFiles = [
        { path: "/test/data/human/ships.txt", species: "human" },
      ];
      const fileContent = "ship Test Ship\n\tmass 100";

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);

      // Act
      const result = readGameDataFiles(["ships.txt"]);

      // Assert
      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/test/data/human/ships.txt",
        "utf-8"
      );
      expect(result[0].content).toBe(fileContent);
    });
  });

  describe("GameDataPaths", () => {
    it("When accessing GameDataPaths, Then should export constant with arrays", () => {
      // Assert
      expect(GameDataPaths).toBeDefined();
      expect(GameDataPaths.SHIPS).toBeInstanceOf(Array);
      expect(GameDataPaths.OUTFITS).toBeInstanceOf(Array);
    });
  });
});
