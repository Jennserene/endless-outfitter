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
    it("should read and return files with content and species", () => {
      const mockFiles = [
        { path: "/test/data/human/ships.txt", species: "human" },
        { path: "/test/data/pug/ships.txt", species: "pug" },
      ];

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce("ship Ship1")
        .mockReturnValueOnce("ship Ship2");

      const result = readGameDataFiles(["ships.txt"]);

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

    it("should throw error when no files found", () => {
      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue([]);

      expect(() => {
        readGameDataFiles(["ships.txt"]);
      }).toThrow("No game data files found matching [ships.txt] in /test/data");
    });

    it("should handle multiple filenames", () => {
      const mockFiles = [
        { path: "/test/data/human/ships.txt", species: "human" },
        { path: "/test/data/human/kestrel.txt", species: "human" },
      ];

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce("ship Ship1")
        .mockReturnValueOnce("ship Ship2");

      const result = readGameDataFiles(["ships.txt", "kestrel.txt"]);

      expect(result).toHaveLength(2);
      expect(fileIo.findDataFiles).toHaveBeenCalledWith("/test/data", [
        "ships.txt",
        "kestrel.txt",
      ]);
    });

    it("should handle files with undefined species", () => {
      const mockFiles = [{ path: "/test/data/ships.txt", species: undefined }];

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock).mockReturnValue("ship Ship1");

      const result = readGameDataFiles(["ships.txt"]);

      expect(result).toHaveLength(1);
      expect(result[0].species).toBeUndefined();
    });

    it("should read file content correctly", () => {
      const mockFiles = [
        { path: "/test/data/human/ships.txt", species: "human" },
      ];
      const fileContent = "ship Test Ship\n\tmass 100";

      (paths.getGameDataPath as jest.Mock).mockReturnValue("/test/data");
      (fileIo.findDataFiles as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);

      const result = readGameDataFiles(["ships.txt"]);

      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/test/data/human/ships.txt",
        "utf-8"
      );
      expect(result[0].content).toBe(fileContent);
    });
  });

  describe("GameDataPaths", () => {
    it("should export GameDataPaths constant", () => {
      expect(GameDataPaths).toBeDefined();
      expect(GameDataPaths.SHIPS).toBeInstanceOf(Array);
      expect(GameDataPaths.OUTFITS).toBeInstanceOf(Array);
    });
  });
});
