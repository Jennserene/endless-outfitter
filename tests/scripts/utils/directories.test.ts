import {
  ensureDataDirectories,
  validateDataDirectories,
  wipeRawDataDirectory,
} from "@scripts/utils/directories";
import { logger } from "@/lib/logger";
import * as fs from "fs";
import * as paths from "@scripts/utils/paths";

// Mock fs module
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  rmSync: jest.fn(),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    success: jest.fn(),
  },
}));

// Mock paths
jest.mock("@scripts/utils/paths", () => ({
  DATA_DIR: "/test/data",
  SHIPS_DIR: "/test/data/ships",
  OUTFITS_DIR: "/test/data/outfits",
  RAW_DATA_DIR: "/test/scripts/.data/raw",
  RAW_SHIP_DIR: "/test/scripts/.data/raw/ships",
  RAW_OUTFIT_DIR: "/test/scripts/.data/raw/outfits",
}));

describe("directories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ensureDataDirectories", () => {
    it("should create missing SHIPS_DIR and OUTFITS_DIR when DATA_DIR exists", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(false); // OUTFITS_DIR doesn't exist

      ensureDataDirectories();

      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.SHIPS_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.OUTFITS_DIR, {
        recursive: true,
      });
    });

    it("should throw when DATA_DIR does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // DATA_DIR doesn't exist

      expect(() => {
        ensureDataDirectories();
      }).toThrow(`Data directory does not exist: ${paths.DATA_DIR}`);
    });

    it("should not create directories when they already exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      ensureDataDirectories();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("should only create SHIPS_DIR if it is missing", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      ensureDataDirectories();

      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.SHIPS_DIR, {
        recursive: true,
      });
    });

    it("should only create OUTFITS_DIR if it is missing", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(false); // OUTFITS_DIR doesn't exist

      ensureDataDirectories();

      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.OUTFITS_DIR, {
        recursive: true,
      });
    });
  });

  describe("validateDataDirectories", () => {
    it("should succeed when all directories exist and contain JSON files", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(["ships-human.json", "ships-pug.json"]) // ship files
        .mockReturnValueOnce(["outfits-human.json"]); // outfit files

      validateDataDirectories();

      expect(logger.success).toHaveBeenCalledWith(
        "Found 2 ships file(s) and 1 outfits file(s)"
      );
    });

    it("should throw when DATA_DIR does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // DATA_DIR doesn't exist

      expect(() => {
        validateDataDirectories();
      }).toThrow(`Data directory not found at ${paths.DATA_DIR}`);
    });

    it("should throw when SHIPS_DIR does not exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false); // SHIPS_DIR doesn't exist

      expect(() => {
        validateDataDirectories();
      }).toThrow(`Ships directory not found at ${paths.SHIPS_DIR}`);
    });

    it("should throw when OUTFITS_DIR does not exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(false); // OUTFITS_DIR doesn't exist

      expect(() => {
        validateDataDirectories();
      }).toThrow(`Outfits directory not found at ${paths.OUTFITS_DIR}`);
    });

    it("should throw when SHIPS_DIR is empty", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce([]) // no ship files
        .mockReturnValueOnce(["outfits-human.json"]); // outfit files

      expect(() => {
        validateDataDirectories();
      }).toThrow(`No ships data files found in ${paths.SHIPS_DIR}`);
    });

    it("should throw when OUTFITS_DIR is empty", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(["ships-human.json"]) // ship files
        .mockReturnValueOnce([]); // no outfit files

      expect(() => {
        validateDataDirectories();
      }).toThrow(`No outfits data files found in ${paths.OUTFITS_DIR}`);
    });

    it("should filter out non-JSON files", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce([
          "ships-human.json",
          "readme.txt",
          "ships-pug.json",
        ]) // ship files with non-JSON
        .mockReturnValueOnce(["outfits-human.json", "config.js"]); // outfit files with non-JSON

      validateDataDirectories();

      expect(logger.success).toHaveBeenCalledWith(
        "Found 2 ships file(s) and 1 outfits file(s)"
      );
    });
  });

  describe("wipeRawDataDirectory", () => {
    it("should remove existing RAW_DATA_DIR and create new directories", () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true); // RAW_DATA_DIR exists

      wipeRawDataDirectory();

      expect(fs.rmSync).toHaveBeenCalledWith(paths.RAW_DATA_DIR, {
        recursive: true,
        force: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.RAW_SHIP_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.RAW_OUTFIT_DIR, {
        recursive: true,
      });
    });

    it("should create directories when RAW_DATA_DIR does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // RAW_DATA_DIR doesn't exist

      wipeRawDataDirectory();

      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.RAW_SHIP_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.RAW_OUTFIT_DIR, {
        recursive: true,
      });
    });
  });
});
