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
    it("When extracting descriptions, Then should add descriptions array to output", () => {
      // Arrange
      const input = createMockShip({ description: "A test ship" });

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "A test ship",
      ]);

      // Act
      const result = extractor.transform(input);

      // Assert
      expect(descriptionsUtils.extractDescriptions).toHaveBeenCalledWith(
        "A test ship"
      );
      expect(result).toEqual({
        name: "Test Ship",
        description: "A test ship",
        descriptions: ["A test ship"],
      });
    });

    it("When description is array, Then should extract all description lines", () => {
      // Arrange
      const input = createMockShip({
        description: ["First line", "Second line"],
      });

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "First line",
        "Second line",
      ]);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.descriptions).toEqual(["First line", "Second line"]);
    });

    it("When transforming ship, Then should preserve other properties", () => {
      // Arrange
      const input = createMockShip({
        sprite: "sprite.png",
        description: "A test ship",
      });

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "A test ship",
      ]);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });

    it("When description is missing, Then should return empty descriptions array", () => {
      // Arrange
      const input = createMockShip();

      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.descriptions).toEqual([]);
    });
  });
});
