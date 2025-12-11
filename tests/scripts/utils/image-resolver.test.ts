import { resolveImagePath, findImageFile } from "@scripts/utils/image-resolver";
import * as fs from "fs";
import { TEST_IMAGE_PATHS, TEST_GAME_REPO_PATH } from "../__fixtures__/images";

// Mock fs module
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

describe("image-resolver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findImageFile", () => {
    it("When finding image file, Then should check .png extension first", () => {
      // Arrange
      const basePath = "images/ship/kestrel";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === `${basePath}.png`;
      });

      // Act
      const result = findImageFile(basePath);

      // Assert
      expect(result).toBe(`${basePath}.png`);
      expect(fs.existsSync).toHaveBeenCalledWith(`${basePath}.png`);
    });

    it("When .png not found, Then should try multiple extensions", () => {
      // Arrange
      const basePath = "images/ship/kestrel";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === `${basePath}.jpg`;
      });

      // Act
      const result = findImageFile(basePath);

      // Assert
      expect(result).toBe(`${basePath}.jpg`);
    });

    it("When no file found with any extension, Then should return null", () => {
      // Arrange
      const basePath = "images/ship/nonexistent";
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Act
      const result = findImageFile(basePath);

      // Assert
      expect(result).toBeNull();
    });

    it("When path has existing extension, Then should use path as-is", () => {
      // Arrange
      const pathWithExt = "images/ship/kestrel.png";
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Act
      const result = findImageFile(pathWithExt);

      // Assert
      expect(result).toBe(pathWithExt);
    });

    it("When no extension matches, Then should try path as-is", () => {
      // Arrange
      const basePath = "images/ship/kestrel";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === basePath;
      });

      // Act
      const result = findImageFile(basePath);

      // Assert
      expect(result).toBe(basePath);
    });
  });

  describe("resolveImagePath", () => {
    it("When resolving image path, Then should check images directory", () => {
      // Arrange
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const expectedPath = `${TEST_GAME_REPO_PATH}/images/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === expectedPath;
      });

      // Act
      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      // Assert
      expect(result).toBe(expectedPath);
    });

    it("When resolving image path, Then should try images directory first", () => {
      // Arrange
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const imagesPath = `${TEST_GAME_REPO_PATH}/images/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === imagesPath;
      });

      // Act
      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      // Assert
      expect(result).toBe(imagesPath);
    });

    it("When images directory doesn't exist, Then should try image directory", () => {
      // Arrange
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const imagePathDir = `${TEST_GAME_REPO_PATH}/image/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === imagePathDir;
      });

      // Act
      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      // Assert
      expect(result).toBe(imagePathDir);
    });

    it("When other locations don't exist, Then should try root directory", () => {
      // Arrange
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const rootPath = `${TEST_GAME_REPO_PATH}/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === rootPath;
      });

      // Act
      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      // Assert
      expect(result).toBe(rootPath);
    });

    it("When image not found in any location, Then should return null", () => {
      // Arrange
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Act
      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      // Assert
      expect(result).toBeNull();
    });

    it("When image path is empty, Then should return null", () => {
      // Act
      const result = resolveImagePath("", TEST_GAME_REPO_PATH);

      // Assert
      expect(result).toBeNull();
    });

    it("When game repo path is empty, Then should return null", () => {
      // Act
      const result = resolveImagePath(TEST_IMAGE_PATHS.SHIP_SPRITE, "");

      // Assert
      expect(result).toBeNull();
    });
  });
});
