import {
  ensureDataDirectories,
  validateDataDirectories,
  wipeRawDataDirectory,
  cleanOutputDirectories,
} from "@scripts/utils/directories";
import { logger } from "@/lib/logger";
import * as fs from "fs";
import * as path from "path";
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
    info: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock path module
jest.mock("path", () => ({
  ...jest.requireActual("path"),
  relative: jest.fn(),
}));

// Mock paths
jest.mock("@scripts/utils/paths", () => ({
  DATA_DIR: "/test/data",
  SHIPS_DIR: "/test/data/ships",
  OUTFITS_DIR: "/test/data/outfits",
  IMAGES_DIR: "/test/src/assets/images",
  OUTFIT_IMAGES_DIR: "/test/src/assets/images/outfit",
  SHIP_IMAGES_DIR: "/test/src/assets/images/ship",
  THUMBNAIL_IMAGES_DIR: "/test/src/assets/images/thumbnail",
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
        .mockReturnValueOnce(false) // OUTFITS_DIR doesn't exist
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      ensureDataDirectories();

      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.SHIPS_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.OUTFITS_DIR, {
        recursive: true,
      });
    });

    it("should create DATA_DIR when it does not exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // DATA_DIR doesn't exist
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(false) // OUTFITS_DIR doesn't exist
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      ensureDataDirectories();

      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.DATA_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.SHIPS_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.OUTFITS_DIR, {
        recursive: true,
      });
    });

    it("should not create directories when they already exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true) // OUTFITS_DIR exists
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      ensureDataDirectories();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("should only create SHIPS_DIR if it is missing", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(true) // OUTFITS_DIR exists
        .mockReturnValueOnce(true); // IMAGES_DIR exists

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
        .mockReturnValueOnce(false) // OUTFITS_DIR doesn't exist
        .mockReturnValueOnce(true); // IMAGES_DIR exists

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

  describe("cleanOutputDirectories", () => {
    beforeEach(() => {
      // Mock process.cwd() for relative path calculation
      (path.relative as jest.Mock).mockImplementation((from, to) => {
        // Simple mock: return the path without the leading /test
        return to.replace("/test/", "");
      });
    });

    it("should clean all directories when they exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // OUTFIT_IMAGES_DIR exists
        .mockReturnValueOnce(true) // SHIP_IMAGES_DIR exists
        .mockReturnValueOnce(true); // THUMBNAIL_IMAGES_DIR exists

      cleanOutputDirectories();

      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      expect(path.relative).toHaveBeenCalledWith(process.cwd(), paths.DATA_DIR);
      expect(logger.info).toHaveBeenCalledWith("Removing contents of data");
      expect(fs.rmSync).toHaveBeenCalledWith(paths.DATA_DIR, {
        recursive: true,
        force: true,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Removing contents of outfit images directory"
      );
      expect(fs.rmSync).toHaveBeenCalledWith(paths.OUTFIT_IMAGES_DIR, {
        recursive: true,
        force: true,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Removing contents of ship images directory"
      );
      expect(fs.rmSync).toHaveBeenCalledWith(paths.SHIP_IMAGES_DIR, {
        recursive: true,
        force: true,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Removing contents of thumbnail images directory"
      );
      expect(fs.rmSync).toHaveBeenCalledWith(paths.THUMBNAIL_IMAGES_DIR, {
        recursive: true,
        force: true,
      });
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories cleaned successfully"
      );
    });

    it("should skip directories that do not exist", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // DATA_DIR doesn't exist
        .mockReturnValueOnce(false) // OUTFIT_IMAGES_DIR doesn't exist
        .mockReturnValueOnce(false) // SHIP_IMAGES_DIR doesn't exist
        .mockReturnValueOnce(false); // THUMBNAIL_IMAGES_DIR doesn't exist

      cleanOutputDirectories();

      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories cleaned successfully"
      );
    });

    it("should clean only existing directories", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // OUTFIT_IMAGES_DIR doesn't exist
        .mockReturnValueOnce(true) // SHIP_IMAGES_DIR exists
        .mockReturnValueOnce(false); // THUMBNAIL_IMAGES_DIR doesn't exist

      cleanOutputDirectories();

      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      expect(path.relative).toHaveBeenCalledWith(process.cwd(), paths.DATA_DIR);
      expect(logger.info).toHaveBeenCalledWith("Removing contents of data");
      expect(fs.rmSync).toHaveBeenCalledWith(paths.DATA_DIR, {
        recursive: true,
        force: true,
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Removing contents of ship images directory"
      );
      expect(fs.rmSync).toHaveBeenCalledWith(paths.SHIP_IMAGES_DIR, {
        recursive: true,
        force: true,
      });
      expect(fs.rmSync).not.toHaveBeenCalledWith(
        paths.OUTFIT_IMAGES_DIR,
        expect.any(Object)
      );
      expect(fs.rmSync).not.toHaveBeenCalledWith(
        paths.THUMBNAIL_IMAGES_DIR,
        expect.any(Object)
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories cleaned successfully"
      );
    });

    it("should log relative path for data directory", () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // OUTFIT_IMAGES_DIR doesn't exist
        .mockReturnValueOnce(false) // SHIP_IMAGES_DIR doesn't exist
        .mockReturnValueOnce(false); // THUMBNAIL_IMAGES_DIR doesn't exist

      (path.relative as jest.Mock).mockReturnValue("src/assets/data");

      cleanOutputDirectories();

      expect(path.relative).toHaveBeenCalledWith(process.cwd(), paths.DATA_DIR);
      expect(logger.info).toHaveBeenCalledWith(
        "Removing contents of src/assets/data"
      );
    });
  });
});
