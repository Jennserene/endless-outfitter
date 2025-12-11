import { copyImageFile, copyImagesToAssets } from "@scripts/utils/image-copier";
import * as fs from "fs";
import * as imageResolver from "@scripts/utils/image-resolver";
import { logger } from "@/lib/logger";
import {
  TEST_IMAGE_PATHS,
  TEST_GAME_REPO_PATH,
  TEST_ASSETS_DIR,
} from "../__fixtures__/images";

// Mock fs module
jest.mock("fs", () => ({
  copyFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock image-resolver
jest.mock("@scripts/utils/image-resolver", () => ({
  resolveImagePath: jest.fn(),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

describe("image-copier", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("copyImageFile", () => {
    it("When copying file, Then should create destination directory if needed", () => {
      // Arrange
      const sourcePath = "/source/image.png";
      const destPath = "/dest/subdir/image.png";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath; // source exists, directory doesn't
      });

      // Act
      copyImageFile(sourcePath, destPath);

      // Assert
      expect(fs.existsSync).toHaveBeenCalledWith(sourcePath);
      expect(fs.existsSync).toHaveBeenCalledWith("/dest/subdir");
      expect(fs.mkdirSync).toHaveBeenCalledWith("/dest/subdir", {
        recursive: true,
      });
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });

    it("When destination directory exists, Then should not create directory", () => {
      // Arrange
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath || path === "/dest";
      });

      // Act
      copyImageFile(sourcePath, destPath);

      // Assert
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });

    it("When source file doesn't exist, Then should throw error", () => {
      // Arrange
      const sourcePath = "/source/nonexistent.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Act & Assert
      expect(() => {
        copyImageFile(sourcePath, destPath);
      }).toThrow(`Source image file not found: ${sourcePath}`);
    });

    it("When copy operation fails, Then should throw error", () => {
      // Arrange
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.copyFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Permission denied");
      });

      // Act & Assert
      expect(() => {
        copyImageFile(sourcePath, destPath);
      }).toThrow(`Failed to copy image from ${sourcePath} to ${destPath}`);
    });

    it("When destination file exists with same contents, Then should skip copying and return false", () => {
      // Arrange
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      const sameContent = Buffer.from("same image content");
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath || path === destPath;
      });
      (fs.readFileSync as jest.Mock).mockReturnValue(sameContent);

      // Act
      const result = copyImageFile(sourcePath, destPath);

      // Assert
      expect(result).toBe(false);
      expect(fs.readFileSync).toHaveBeenCalledWith(sourcePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(destPath);
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });

    it("When destination file exists with different contents, Then should overwrite and return true", () => {
      // Arrange
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      const sourceContent = Buffer.from("new image content");
      const destContent = Buffer.from("old image content");
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath || path === destPath;
      });
      (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath ? sourceContent : destContent;
      });

      // Act
      const result = copyImageFile(sourcePath, destPath);

      // Assert
      expect(result).toBe(true);
      expect(fs.readFileSync).toHaveBeenCalledWith(sourcePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(destPath);
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });

    it("When destination file doesn't exist, Then should copy and return true", () => {
      // Arrange
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath; // Only source exists
      });

      // Act
      const result = copyImageFile(sourcePath, destPath);

      // Assert
      expect(result).toBe(true);
      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });
  });

  describe("copyImagesToAssets", () => {
    it("When copying all images, Then should copy successfully and return counts", () => {
      // Arrange
      const imagePaths = new Set([
        TEST_IMAGE_PATHS.SHIP_SPRITE,
        TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
      ]);
      const sourcePath1 = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const sourcePath2 = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_THUMBNAIL}.png`;
      const destPath1 = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const destPath2 = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_THUMBNAIL}.png`;

      // Mock resolveImagePath to return source paths in sequence
      (imageResolver.resolveImagePath as jest.Mock)
        .mockReturnValueOnce(sourcePath1)
        .mockReturnValueOnce(sourcePath2);
      // Source files exist, destination directories don't (so they'll be created)
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        // Return true for source files
        if (path === sourcePath1 || path === sourcePath2) {
          return true;
        }
        // Return false for destination directories (dirname of dest paths)
        return false;
      });

      // Act
      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      // Assert
      expect(result.copied).toBe(2);
      expect(result.failed).toBe(0);
      // copyImageFile is called, which may skip if files are identical
      // But in this test, destination files don't exist, so they should be copied
      expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath1, destPath1);
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath2, destPath2);
    });

    it("When image paths are unresolved, Then should mark as failed and log warnings", () => {
      // Arrange
      const imagePaths = new Set([
        TEST_IMAGE_PATHS.SHIP_SPRITE,
        TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
      ]);

      (imageResolver.resolveImagePath as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      // Act
      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      // Assert
      expect(result.copied).toBe(0);
      expect(result.failed).toBe(2);
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it("When copy errors occur, Then should handle gracefully and return failure count", () => {
      // Arrange
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);
      const sourcePath = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;

      (imageResolver.resolveImagePath as jest.Mock).mockReturnValue(sourcePath);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.copyFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Copy failed");
      });

      // Act
      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      // Assert
      expect(result.copied).toBe(0);
      expect(result.failed).toBe(1);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("When copying images, Then should maintain directory structure in destination", () => {
      // Arrange
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);
      const sourcePath = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      // The implementation adds the extension from sourcePath if imagePath doesn't have one
      const expectedDestPath = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;

      (imageResolver.resolveImagePath as jest.Mock).mockReturnValue(sourcePath);
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath; // source file exists, directory doesn't
      });

      // Act
      copyImagesToAssets(imagePaths, TEST_GAME_REPO_PATH, TEST_ASSETS_DIR);

      // Assert
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        sourcePath,
        expectedDestPath
      );
    });

    it("When image paths set is empty, Then should return zero counts", () => {
      // Arrange
      const imagePaths = new Set<string>();

      // Act
      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      // Assert
      expect(result.copied).toBe(0);
      expect(result.failed).toBe(0);
    });

    it("When destination image exists with same contents, Then should skip copying", () => {
      // Arrange
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);
      const sourcePath = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const destPath = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const sameContent = Buffer.from("same image content");

      (imageResolver.resolveImagePath as jest.Mock).mockReturnValue(sourcePath);
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath || path === destPath;
      });
      (fs.readFileSync as jest.Mock).mockReturnValue(sameContent);

      // Act
      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      // Assert
      expect(result.copied).toBe(0);
      expect(result.failed).toBe(0);
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });

    it("When destination image exists with different contents, Then should overwrite", () => {
      // Arrange
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);
      const sourcePath = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const destPath = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const sourceContent = Buffer.from("new image content");
      const destContent = Buffer.from("old image content");

      (imageResolver.resolveImagePath as jest.Mock).mockReturnValue(sourcePath);
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath || path === destPath;
      });
      (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath ? sourceContent : destContent;
      });

      // Act
      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      // Assert
      expect(result.copied).toBe(1);
      expect(result.failed).toBe(0);
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });
  });
});
