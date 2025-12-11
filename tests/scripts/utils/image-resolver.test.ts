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
    it("should find image file with .png extension", () => {
      const basePath = "images/ship/kestrel";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === `${basePath}.png`;
      });

      const result = findImageFile(basePath);

      expect(result).toBe(`${basePath}.png`);
      expect(fs.existsSync).toHaveBeenCalledWith(`${basePath}.png`);
    });

    it("should try multiple extensions", () => {
      const basePath = "images/ship/kestrel";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === `${basePath}.jpg`;
      });

      const result = findImageFile(basePath);

      expect(result).toBe(`${basePath}.jpg`);
    });

    it("should return null if no file found", () => {
      const basePath = "images/ship/nonexistent";
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = findImageFile(basePath);

      expect(result).toBeNull();
    });

    it("should handle path with existing extension", () => {
      const pathWithExt = "images/ship/kestrel.png";
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = findImageFile(pathWithExt);

      expect(result).toBe(pathWithExt);
    });

    it("should try path as-is if no extension matches", () => {
      const basePath = "images/ship/kestrel";
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === basePath;
      });

      const result = findImageFile(basePath);

      expect(result).toBe(basePath);
    });
  });

  describe("resolveImagePath", () => {
    it("should resolve image path in images directory", () => {
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const expectedPath = `${TEST_GAME_REPO_PATH}/images/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === expectedPath;
      });

      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      expect(result).toBe(expectedPath);
    });

    it("should try images directory first", () => {
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const imagesPath = `${TEST_GAME_REPO_PATH}/images/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === imagesPath;
      });

      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      expect(result).toBe(imagesPath);
    });

    it("should try image directory if images doesn't exist", () => {
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const imagePathDir = `${TEST_GAME_REPO_PATH}/image/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === imagePathDir;
      });

      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      expect(result).toBe(imagePathDir);
    });

    it("should try root directory if other locations don't exist", () => {
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      const rootPath = `${TEST_GAME_REPO_PATH}/${imagePath}.png`;
      (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
        return path === rootPath;
      });

      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      expect(result).toBe(rootPath);
    });

    it("should return null if image not found", () => {
      const imagePath = TEST_IMAGE_PATHS.SHIP_SPRITE;
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = resolveImagePath(imagePath, TEST_GAME_REPO_PATH);

      expect(result).toBeNull();
    });

    it("should return null for empty image path", () => {
      const result = resolveImagePath("", TEST_GAME_REPO_PATH);

      expect(result).toBeNull();
    });

    it("should return null for empty game repo path", () => {
      const result = resolveImagePath(TEST_IMAGE_PATHS.SHIP_SPRITE, "");

      expect(result).toBeNull();
    });
  });
});
