import { extractImagePaths } from "@scripts/utils/image-extractor";
import { createMockShip } from "../__fixtures__/ships";
import { createMockOutfit } from "../__fixtures__/outfits";
import { TEST_IMAGE_PATHS } from "../__fixtures__/images";

describe("image-extractor", () => {
  describe("extractImagePaths", () => {
    it("should extract sprite and thumbnail from ships", () => {
      const ships = [
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE,
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
        }),
      ];
      const outfits: unknown[] = [];

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(2);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
    });

    it("should extract thumbnail from outfits", () => {
      const ships: unknown[] = [];
      const outfits = [
        createMockOutfit({
          thumbnail: TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL,
        }),
      ];

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(1);
      expect(result.has(TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL)).toBe(true);
    });

    it("should extract images from both ships and outfits", () => {
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

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(3);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL)).toBe(true);
    });

    it("should handle missing sprite and thumbnail fields", () => {
      const ships = [createMockShip()];
      const outfits = [createMockOutfit()];

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(0);
    });

    it("should deduplicate image paths", () => {
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

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(3);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
      expect(result.has(TEST_IMAGE_PATHS.ANOTHER_THUMBNAIL)).toBe(true);
    });

    it("should handle empty arrays", () => {
      const result = extractImagePaths([], []);

      expect(result.size).toBe(0);
    });

    it("should handle ships with only sprite", () => {
      const ships = [
        createMockShip({
          sprite: TEST_IMAGE_PATHS.SHIP_SPRITE,
        }),
      ];
      const outfits: unknown[] = [];

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(1);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_SPRITE)).toBe(true);
    });

    it("should handle ships with only thumbnail", () => {
      const ships = [
        createMockShip({
          thumbnail: TEST_IMAGE_PATHS.SHIP_THUMBNAIL,
        }),
      ];
      const outfits: unknown[] = [];

      const result = extractImagePaths(ships, outfits);

      expect(result.size).toBe(1);
      expect(result.has(TEST_IMAGE_PATHS.SHIP_THUMBNAIL)).toBe(true);
    });
  });
});
