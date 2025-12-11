import { extractImagePaths } from "@scripts/utils/image-extractor";
import { createMockShip } from "../__fixtures__/ships";
import { createMockOutfit } from "../__fixtures__/outfits";
import { TEST_IMAGE_PATHS } from "../__fixtures__/images";
import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

describe("image-extractor", () => {
  describe("extractImagePaths", () => {
    it("When extracting from ships with sprite and thumbnail, Then should return both image paths", () => {
      // Arrange
      const ships = [
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE,
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
        }),
      ];
      const outfits: unknown[] = [];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(2);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
    });

    it("When extracting from outfits with thumbnail, Then should return thumbnail path", () => {
      // Arrange
      const ships: unknown[] = [];
      const outfits = [
        createMockOutfit({
          thumbnail: TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL,
        }),
      ];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(1);
      expect(result.has(TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL)).toBe(true);
    });

    it("When extracting from both ships and outfits, Then should return all unique image paths", () => {
      // Arrange
      const ships = [
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE,
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
        }),
      ];
      const outfits = [
        createMockOutfit({
          thumbnail: TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL,
        }),
      ];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(3);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL)).toBe(true);
    });

    it("When ships and outfits have missing image fields, Then should return empty set", () => {
      // Arrange
      const ships = [createMockShip()];
      const outfits = [createMockOutfit()];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(0);
    });

    it("When duplicate image paths exist, Then should deduplicate them", () => {
      // Arrange
      const ships = [
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE,
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
        }),
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE, // Duplicate
          thumbnail: TEST_IMAGE_PATHS.ANOTHER_THUMBNAIL,
        }),
      ];
      const outfits = [
        createMockOutfit({
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL, // Duplicate
        }),
      ];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(3);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.ANOTHER_THUMBNAIL)).toBe(true);
    });

    it("When arrays are empty, Then should return empty set", () => {
      // Act
      const result = extractImagePaths([], []);

      // Assert
      expect(result.size).toBe(0);
    });

    it("When ships have only sprite, Then should return sprite path", () => {
      // Arrange
      const ships = [
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE,
        }),
      ];
      const outfits: unknown[] = [];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(1);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
    });

    it("When ships have only thumbnail, Then should return thumbnail path", () => {
      // Arrange
      const ships = [
        createMockShip({
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
        }),
      ];
      const outfits: unknown[] = [];

      // Act
      const result = extractImagePaths(ships as Ship[], outfits as Outfit[]);

      // Assert
      expect(result.size).toBe(1);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
    });
  });
});
