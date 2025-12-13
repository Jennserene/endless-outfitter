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
    warn: jest.fn(),
    debug: jest.fn(),
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
  IMAGES_DIR: "/test/public/assets/images",
  OUTFIT_IMAGES_DIR: "/test/public/assets/images/outfit",
  SHIP_IMAGES_DIR: "/test/public/assets/images/ship",
  THUMBNAIL_IMAGES_DIR: "/test/public/assets/images/thumbnail",
  RAW_DATA_DIR: "/test/scripts/.data/raw",
  RAW_SHIP_DIR: "/test/scripts/.data/raw/ships",
  RAW_OUTFIT_DIR: "/test/scripts/.data/raw/outfits",
}));

describe("directories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ensureDataDirectories", () => {
    it("When DATA_DIR exists but SHIPS_DIR and OUTFITS_DIR are missing, Then should create missing directories", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(false) // OUTFITS_DIR doesn't exist
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      // Act
      ensureDataDirectories();

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.SHIPS_DIR, {
        recursive: true,
      });
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.OUTFITS_DIR, {
        recursive: true,
      });
    });

    it("When DATA_DIR does not exist, Then should create DATA_DIR and subdirectories", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // DATA_DIR doesn't exist
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(false) // OUTFITS_DIR doesn't exist
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      // Act
      ensureDataDirectories();

      // Assert
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

    it("When all directories already exist, Then should not create any directories", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true) // OUTFITS_DIR exists
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      // Act
      ensureDataDirectories();

      // Assert
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("When only SHIPS_DIR is missing, Then should create only SHIPS_DIR", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false) // SHIPS_DIR doesn't exist
        .mockReturnValueOnce(true) // OUTFITS_DIR exists
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      // Act
      ensureDataDirectories();

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.SHIPS_DIR, {
        recursive: true,
      });
    });

    it("When only OUTFITS_DIR is missing, Then should create only OUTFITS_DIR", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(false) // OUTFITS_DIR doesn't exist
        .mockReturnValueOnce(true); // IMAGES_DIR exists

      // Act
      ensureDataDirectories();

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
      expect(fs.mkdirSync).toHaveBeenCalledWith(paths.OUTFITS_DIR, {
        recursive: true,
      });
    });
  });

  describe("validateDataDirectories", () => {
    it("When all directories exist and contain JSON files, Then should succeed and log file counts", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(["ships-human.json", "ships-pug.json"]) // ship files
        .mockReturnValueOnce(["outfits-human.json"]); // outfit files

      // Act
      validateDataDirectories();

      // Assert
      expect(logger.success).toHaveBeenCalledWith(
        "Found 2 ships file(s) and 1 outfits file(s)"
      );
    });

    it("When DATA_DIR does not exist, Then should throw error", () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // DATA_DIR doesn't exist

      // Act & Assert
      expect(() => {
        validateDataDirectories();
      }).toThrow(`Data directory not found at ${paths.DATA_DIR}`);
    });

    it("When SHIPS_DIR does not exist, Then should throw error", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(false); // SHIPS_DIR doesn't exist

      // Act & Assert
      expect(() => {
        validateDataDirectories();
      }).toThrow(`Ships directory not found at ${paths.SHIPS_DIR}`);
    });

    it("When OUTFITS_DIR does not exist, Then should throw error", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(false); // OUTFITS_DIR doesn't exist

      // Act & Assert
      expect(() => {
        validateDataDirectories();
      }).toThrow(`Outfits directory not found at ${paths.OUTFITS_DIR}`);
    });

    it("When SHIPS_DIR is empty, Then should throw error", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce([]) // no ship files
        .mockReturnValueOnce(["outfits-human.json"]); // outfit files

      // Act & Assert
      expect(() => {
        validateDataDirectories();
      }).toThrow(`No ships data files found in ${paths.SHIPS_DIR}`);
    });

    it("When OUTFITS_DIR is empty, Then should throw error", () => {
      // Arrange
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true) // DATA_DIR exists
        .mockReturnValueOnce(true) // SHIPS_DIR exists
        .mockReturnValueOnce(true); // OUTFITS_DIR exists

      (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(["ships-human.json"]) // ship files
        .mockReturnValueOnce([]); // no outfit files

      // Act & Assert
      expect(() => {
        validateDataDirectories();
      }).toThrow(`No outfits data files found in ${paths.OUTFITS_DIR}`);
    });

    it("When directories contain non-JSON files, Then should filter them out", () => {
      // Arrange
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

      // Act
      validateDataDirectories();

      // Assert
      expect(logger.success).toHaveBeenCalledWith(
        "Found 2 ships file(s) and 1 outfits file(s)"
      );
    });
  });

  describe("wipeRawDataDirectory", () => {
    it("When RAW_DATA_DIR exists, Then should remove it and create new directories", () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true); // RAW_DATA_DIR exists

      // Act
      wipeRawDataDirectory();

      // Assert
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

    it("When RAW_DATA_DIR does not exist, Then should create directories without removing", () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false); // RAW_DATA_DIR doesn't exist

      // Act
      wipeRawDataDirectory();

      // Assert
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

    it("When all directories exist, Then should not clean image directories", () => {
      // Arrange
      // No setup needed - function doesn't access directories anymore

      // Act
      cleanOutputDirectories();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      // Note: Image directories are no longer cleaned - the image copier
      // checks file contents before overwriting
      expect(fs.readdirSync).not.toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories prepared for generation"
      );
    });

    it("When directories do not exist, Then should log success without cleaning", () => {
      // Arrange
      // No setup needed - function doesn't access directories anymore

      // Act
      cleanOutputDirectories();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      expect(fs.readdirSync).not.toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories prepared for generation"
      );
    });

    it("When some directories exist, Then should not clean any directories", () => {
      // Arrange
      // No setup needed - function doesn't access directories anymore

      // Act
      cleanOutputDirectories();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      // Note: Image directories are no longer cleaned - the image copier
      // checks file contents before overwriting
      expect(fs.readdirSync).not.toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories prepared for generation"
      );
    });

    it("When image directories exist, Then should not clean them", () => {
      // Arrange
      // No setup needed - function doesn't access directories anymore

      // Act
      cleanOutputDirectories();

      // Assert
      // Note: Image directories are no longer cleaned - the image copier
      // checks file contents before overwriting, so existing images are preserved
      expect(logger.info).toHaveBeenCalledWith(
        "Cleaning output directories..."
      );
      expect(fs.readdirSync).not.toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Output directories prepared for generation"
      );
    });
  });
});
