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
    it("should copy file and create destination directory", () => {
      const sourcePath = "/source/image.png";
      const destPath = "/dest/subdir/image.png";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath; // source exists, directory doesn't
      });

      copyImageFile(sourcePath, destPath);

      expect(fs.existsSync).toHaveBeenCalledWith(sourcePath);
      expect(fs.existsSync).toHaveBeenCalledWith("/dest/subdir");
      expect(fs.mkdirSync).toHaveBeenCalledWith("/dest/subdir", {
        recursive: true,
      });
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });

    it("should not create directory if it already exists", () => {
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath || path === "/dest";
      });

      copyImageFile(sourcePath, destPath);

      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath, destPath);
    });

    it("should throw error if source file doesn't exist", () => {
      const sourcePath = "/source/nonexistent.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => {
        copyImageFile(sourcePath, destPath);
      }).toThrow(`Source image file not found: ${sourcePath}`);
    });

    it("should throw error if copy fails", () => {
      const sourcePath = "/source/image.png";
      const destPath = "/dest/image.png";
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.copyFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Permission denied");
      });

      expect(() => {
        copyImageFile(sourcePath, destPath);
      }).toThrow(`Failed to copy image from ${sourcePath} to ${destPath}`);
    });
  });

  describe("copyImagesToAssets", () => {
    it("should copy all images successfully", () => {
      const imagePaths = new Set([
        TEST_IMAGE_PATHS.SHIP_SPRITE,
        TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
      ]);
      const sourcePath1 = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const sourcePath2 = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_THUMBNAIL}.png`;
      const destPath1 = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      const destPath2 = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_THUMBNAIL}.png`;
      const destDir1 = `${TEST_ASSETS_DIR}/ship`;
      const destDir2 = `${TEST_ASSETS_DIR}/thumbnail`;

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

      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      expect(result.copied).toBe(2);
      expect(result.failed).toBe(0);
      expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath1, destPath1);
      expect(fs.copyFileSync).toHaveBeenCalledWith(sourcePath2, destPath2);
    });

    it("should handle unresolved image paths", () => {
      const imagePaths = new Set([
        TEST_IMAGE_PATHS.SHIP_SPRITE,
        TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
      ]);

      (imageResolver.resolveImagePath as jest.Mock)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      expect(result.copied).toBe(0);
      expect(result.failed).toBe(2);
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it("should handle copy errors gracefully", () => {
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);
      const sourcePath = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;

      (imageResolver.resolveImagePath as jest.Mock).mockReturnValue(sourcePath);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.copyFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Copy failed");
      });

      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      expect(result.copied).toBe(0);
      expect(result.failed).toBe(1);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should maintain directory structure in destination", () => {
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);
      const sourcePath = `${TEST_GAME_REPO_PATH}/images/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;
      // The implementation adds the extension from sourcePath if imagePath doesn't have one
      const expectedDestPath = `${TEST_ASSETS_DIR}/${TEST_IMAGE_PATHS.SHIP_SPRITE}.png`;

      (imageResolver.resolveImagePath as jest.Mock).mockReturnValue(sourcePath);
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === sourcePath; // source file exists, directory doesn't
      });

      copyImagesToAssets(imagePaths, TEST_GAME_REPO_PATH, TEST_ASSETS_DIR);

      expect(fs.copyFileSync).toHaveBeenCalledWith(
        sourcePath,
        expectedDestPath
      );
    });

    it("should handle empty image paths set", () => {
      const imagePaths = new Set<string>();

      const result = copyImagesToAssets(
        imagePaths,
        TEST_GAME_REPO_PATH,
        TEST_ASSETS_DIR
      );

      expect(result.copied).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});
