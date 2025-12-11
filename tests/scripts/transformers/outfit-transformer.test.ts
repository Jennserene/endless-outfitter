import { OutfitTransformer } from "@scripts/transformers/outfit-transformer";
import * as licensesUtils from "@scripts/utils/licenses";
import * as descriptionsUtils from "@scripts/utils/descriptions";
import * as valueExtraction from "@scripts/utils/value-extraction";

// Mock dependencies
jest.mock("@scripts/utils/licenses", () => ({
  extractLicenses: jest.fn(),
}));

jest.mock("@scripts/utils/descriptions", () => ({
  extractDescriptions: jest.fn(),
}));

jest.mock("@scripts/utils/value-extraction", () => ({
  extractStringValue: jest.fn(),
}));

describe("OutfitTransformer", () => {
  let transformer: OutfitTransformer;

  beforeEach(() => {
    jest.clearAllMocks();
    transformer = new OutfitTransformer();
  });

  describe("transform", () => {
    it("When transforming basic outfit data, Then should preserve all fields", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        plural: "Test Outfits",
        category: "Engine",
        cost: 1000,
        mass: 10,
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Outfit");
      expect(result.plural).toBe("Test Outfits");
      expect(result.category).toBe("Engine");
      expect(result.cost).toBe(1000);
      expect(result.mass).toBe(10);
    });

    it("When extracting licenses, Then should move to attributes", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        licenses: "GPL-3.0",
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result as Record<string, unknown>).attributes).toEqual({
        licenses: ["GPL-3.0"],
      });
    });

    it("When extracting descriptions, Then should add descriptions array", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        description: "A test outfit",
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "A test outfit",
      ]);

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result as Record<string, unknown>).descriptions).toEqual([
        "A test outfit",
      ]);
    });

    it("When thumbnail is not string, Then should extract using extractStringValue", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        thumbnail: { _value: "thumbnail.png" },
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);
      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        "thumbnail.png"
      );

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(valueExtraction.extractStringValue).toHaveBeenCalledWith({
        _value: "thumbnail.png",
      });
      expect((result as Record<string, unknown>).thumbnail).toBe(
        "thumbnail.png"
      );
    });

    it("When unknown fields exist, Then should move them to attributes", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        "unknown field": "value",
        "another field": 100,
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      const resultAttributes = (result as Record<string, unknown>)
        .attributes as Record<string, unknown>;
      expect(resultAttributes["unknown field"]).toBe("value");
      expect(resultAttributes["another field"]).toBe(100);
    });

    it("When index is numeric, Then should preserve index", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        index: 5,
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result as Record<string, unknown>).index).toBe(5);
    });

    it("When index is not a number, Then should set to undefined", () => {
      // Arrange
      const input = {
        name: "Test Outfit",
        index: "not a number",
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result as Record<string, unknown>).index).toBeUndefined();
    });
  });
});
