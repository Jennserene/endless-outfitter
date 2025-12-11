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
    it("When normalizing numeric attributes, Then should convert string numbers to numbers", () => {
      // Arrange
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

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
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

    it("When ship has no attributes, Then should return ship unchanged", () => {
      // Arrange
      const input = createMockShip({ attributes: undefined });

      // Act
      const result = normalizer.transform(input);

      // Assert
      expect(numericUtils.normalizeNumericAttributes).not.toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it("When transforming ship, Then should preserve non-attribute fields", () => {
      // Arrange
      const input = createMockShipWithAttributes(
        { mass: "100" },
        { sprite: "sprite.png" }
      );

      (numericUtils.normalizeNumericAttributes as jest.Mock).mockReturnValue({
        category: "Unknown",
        mass: 100,
      });

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });

    it("When attributes object is empty, Then should handle empty attributes", () => {
      // Arrange
      const input = createMockShipWithAttributes({});

      (numericUtils.normalizeNumericAttributes as jest.Mock).mockReturnValue({
        category: "Unknown",
      });

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toHaveProperty("category", "Unknown");
    });
  });
});
