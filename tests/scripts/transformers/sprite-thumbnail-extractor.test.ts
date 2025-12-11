import { SpriteThumbnailExtractor } from "@scripts/transformers/sprite-thumbnail-extractor";
import * as valueExtraction from "@scripts/utils/value-extraction";
import { createMockShip } from "../__fixtures__/ships";

// Mock value extraction
jest.mock("@scripts/utils/value-extraction", () => ({
  extractStringValue: jest.fn(),
}));

describe("SpriteThumbnailExtractor", () => {
  let extractor: SpriteThumbnailExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    extractor = new SpriteThumbnailExtractor();
  });

  describe("transform", () => {
    it("When sprite and thumbnail are strings, Then should preserve them", () => {
      // Arrange
      const input = createMockShip({
        sprite: "sprite.png",
        thumbnail: "thumbnail.png",
      });

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(valueExtraction.extractStringValue).not.toHaveBeenCalled();
      expect(result.sprite).toBe("sprite.png");
      expect(result.thumbnail).toBe("thumbnail.png");
    });

    it("When sprite is object, Then should extract using extractStringValue", () => {
      // Arrange
      const input = createMockShip({
        sprite: { _value: "sprite.png" } as unknown as string,
        thumbnail: "thumbnail.png",
      });

      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        "sprite.png"
      );

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(valueExtraction.extractStringValue).toHaveBeenCalledWith({
        _value: "sprite.png",
      });
      expect(result.sprite).toBe("sprite.png");
    });

    it("When thumbnail is object, Then should extract using extractStringValue", () => {
      // Arrange
      const input = createMockShip({
        sprite: "sprite.png",
        thumbnail: { _value: "thumbnail.png" } as unknown as string,
      });

      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        "thumbnail.png"
      );

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(valueExtraction.extractStringValue).toHaveBeenCalledWith({
        _value: "thumbnail.png",
      });
      expect(result.thumbnail).toBe("thumbnail.png");
    });

    it("When sprite and thumbnail are undefined, Then should preserve undefined", () => {
      // Arrange
      const input = createMockShip();

      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        undefined
      );

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.sprite).toBeUndefined();
      expect(result.thumbnail).toBeUndefined();
    });

    it("When transforming ship, Then should preserve other properties", () => {
      // Arrange
      const input = createMockShip({
        sprite: "sprite.png",
        thumbnail: "thumbnail.png",
        mass: 100,
      });

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Ship");
      expect(result.mass).toBe(100);
    });
  });
});
