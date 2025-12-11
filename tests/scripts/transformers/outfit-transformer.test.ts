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
    it("should transform basic outfit data", () => {
      const input = {
        name: "Test Outfit",
        plural: "Test Outfits",
        category: "Engine",
        cost: 1000,
        mass: 10,
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Outfit");
      expect(result.plural).toBe("Test Outfits");
      expect(result.category).toBe("Engine");
      expect(result.cost).toBe(1000);
      expect(result.mass).toBe(10);
    });

    it("should extract licenses to attributes", () => {
      const input = {
        name: "Test Outfit",
        licenses: "GPL-3.0",
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      const result = transformer.transform(input) as Record<string, unknown>;

      expect((result as Record<string, unknown>).attributes).toEqual({
        licenses: ["GPL-3.0"],
      });
    });

    it("should extract descriptions", () => {
      const input = {
        name: "Test Outfit",
        description: "A test outfit",
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([
        "A test outfit",
      ]);

      const result = transformer.transform(input) as Record<string, unknown>;

      expect((result as Record<string, unknown>).descriptions).toEqual([
        "A test outfit",
      ]);
    });

    it("should extract thumbnail using extractStringValue when not string", () => {
      const input = {
        name: "Test Outfit",
        thumbnail: { _value: "thumbnail.png" },
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);
      (valueExtraction.extractStringValue as jest.Mock).mockReturnValue(
        "thumbnail.png"
      );

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(valueExtraction.extractStringValue).toHaveBeenCalledWith({
        _value: "thumbnail.png",
      });
      expect((result as Record<string, unknown>).thumbnail).toBe(
        "thumbnail.png"
      );
    });

    it("should move unknown fields to attributes", () => {
      const input = {
        name: "Test Outfit",
        "unknown field": "value",
        "another field": 100,
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      const result = transformer.transform(input) as Record<string, unknown>;

      const resultAttributes = (result as Record<string, unknown>)
        .attributes as Record<string, unknown>;
      expect(resultAttributes["unknown field"]).toBe("value");
      expect(resultAttributes["another field"]).toBe(100);
    });

    it("should handle numeric index", () => {
      const input = {
        name: "Test Outfit",
        index: 5,
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      const result = transformer.transform(input) as Record<string, unknown>;

      expect((result as Record<string, unknown>).index).toBe(5);
    });

    it("should set index to undefined when not a number", () => {
      const input = {
        name: "Test Outfit",
        index: "not a number",
      };

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);
      (descriptionsUtils.extractDescriptions as jest.Mock).mockReturnValue([]);

      const result = transformer.transform(input) as Record<string, unknown>;

      expect((result as Record<string, unknown>).index).toBeUndefined();
    });
  });
});
