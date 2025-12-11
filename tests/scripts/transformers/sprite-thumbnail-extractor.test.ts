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
    it("should extract string sprite and thumbnail", () => {
      const input = createMockShip({
        sprite: "sprite.png",
        thumbnail: "thumbnail.png",
      });

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(valueExtraction.extractStringValue).not.toHaveBeenCalled();
      expect(result.sprite).toBe("sprite.png");
      expect(result.thumbnail).toBe("thumbnail.png");
    });

    it("should extract sprite from object using extractStringValue", () => {
      const input = createMockShip({
        sprite: { _value: "sprite.png" } as unknown as string,
        thumbnail: "thumbnail.png",
      });

      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        "sprite.png"
      );

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(valueExtraction.extractStringValue).toHaveBeenCalledWith({
        _value: "sprite.png",
      });
      expect(result.sprite).toBe("sprite.png");
    });

    it("should extract thumbnail from object using extractStringValue", () => {
      const input = createMockShip({
        sprite: "sprite.png",
        thumbnail: { _value: "thumbnail.png" } as unknown as string,
      });

      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        "thumbnail.png"
      );

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(valueExtraction.extractStringValue).toHaveBeenCalledWith({
        _value: "thumbnail.png",
      });
      expect(result.thumbnail).toBe("thumbnail.png");
    });

    it("should handle undefined sprite and thumbnail", () => {
      const input = createMockShip();

      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        undefined
      );

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(result.sprite).toBeUndefined();
      expect(result.thumbnail).toBeUndefined();
    });

    it("should preserve other properties", () => {
      const input = createMockShip({
        sprite: "sprite.png",
        thumbnail: "thumbnail.png",
        mass: 100,
      });

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Ship");
      expect(result.mass).toBe(100);
    });
  });
});
