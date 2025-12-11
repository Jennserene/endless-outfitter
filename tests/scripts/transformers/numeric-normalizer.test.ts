import { NumericNormalizer } from "@scripts/transformers/numeric-normalizer";
import * as numericUtils from "@scripts/utils/numeric";
import {
  createMockShip,
  createMockShipWithAttributes,
} from "../__fixtures__/ships";

// Mock numeric utils
jest.mock("@scripts/utils/numeric", () => ({
  normalizeNumericAttributes: jest.fn(),
}));

describe("NumericNormalizer", () => {
  let normalizer: NumericNormalizer;

  beforeEach(() => {
    jest.clearAllMocks();
    normalizer = new NumericNormalizer();
  });

  describe("transform", () => {
    it("should normalize numeric attributes", () => {
      const input = createMockShipWithAttributes({
        mass: "100",
        cost: "1000",
        drag: "0.5",
      });

      (numericUtils.normalizeNumericAttributes as jest.Mock).mockReturnValue({
        mass: 100,
        cost: 1000,
        drag: 0.5,
      });

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(numericUtils.normalizeNumericAttributes).toHaveBeenCalledWith(
        input.attributes,
        expect.arrayContaining(["mass", "cost", "drag"])
      );
      expect(result.name).toBe("Test Ship");
      const attributes = result.attributes as Record<string, unknown>;
      expect(attributes.mass).toBe(100);
      expect(attributes.cost).toBe(1000);
      expect(attributes.drag).toBe(0.5);
    });

    it("should return ship unchanged when no attributes", () => {
      const input = createMockShip();

      const result = normalizer.transform(input);

      expect(numericUtils.normalizeNumericAttributes).not.toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it("should preserve non-attribute fields", () => {
      const input = createMockShipWithAttributes(
        { mass: "100" },
        { sprite: "sprite.png" }
      );

      (numericUtils.normalizeNumericAttributes as jest.Mock).mockReturnValue({
        category: "Unknown",
        mass: 100,
      });

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });

    it("should handle empty attributes object", () => {
      const input = createMockShipWithAttributes({});

      (numericUtils.normalizeNumericAttributes as jest.Mock).mockReturnValue({
        category: "Unknown",
      });

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.attributes).toHaveProperty("category", "Unknown");
    });
  });
});
