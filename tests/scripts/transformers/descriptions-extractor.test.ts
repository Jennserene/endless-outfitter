import { DescriptionsExtractor } from "@scripts/transformers/descriptions-extractor";
import * as descriptionsUtils from "@scripts/utils/descriptions";
import { createMockShip } from "../__fixtures__/ships";

// Mock descriptions utils
jest.mock("@scripts/utils/descriptions", () => ({
  extractDescriptions: jest.fn(),
}));

describe("DescriptionsExtractor", () => {
  let extractor: DescriptionsExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    extractor = new DescriptionsExtractor();
  });

  describe("transform", () => {
    it("should extract descriptions and add to output", () => {
      const input = createMockShip({ description: "A test ship" });

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "A test ship",
      ]);

      const result = extractor.transform(input);

      expect(descriptionsUtils.extractDescriptions).toHaveBeenCalledWith(
        "A test ship"
      );
      expect(result).toEqual({
        name: "Test Ship",
        description: "A test ship",
        descriptions: ["A test ship"],
      });
    });

    it("should handle array descriptions", () => {
      const input = createMockShip({
        description: ["First line", "Second line"],
      });

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "First line",
        "Second line",
      ]);

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(result.descriptions).toEqual(["First line", "Second line"]);
    });

    it("should preserve other properties", () => {
      const input = createMockShip({
        sprite: "sprite.png",
        description: "A test ship",
      });

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "A test ship",
      ]);

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });

    it("should handle missing description", () => {
      const input = createMockShip();

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(result.descriptions).toEqual([]);
    });
  });
});
