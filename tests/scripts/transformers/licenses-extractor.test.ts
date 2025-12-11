import { LicensesExtractor } from "@scripts/transformers/licenses-extractor";
import * as licensesUtils from "@scripts/utils/licenses";
import {
  createMockShip,
  createMockShipWithAttributes,
} from "../__fixtures__/ships";

// Mock licenses utils
jest.mock("@scripts/utils/licenses", () => ({
  extractLicenses: jest.fn(),
}));

describe("LicensesExtractor", () => {
  let extractor: LicensesExtractor;

  beforeEach(() => {
    jest.clearAllMocks();
    extractor = new LicensesExtractor();
  });

  describe("transform", () => {
    it("When extracting licenses from attributes, Then should convert to array", () => {
      // Arrange
      const input = createMockShipWithAttributes({
        licenses: "GPL-3.0",
        mass: 100,
      });

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(licensesUtils.extractLicenses).toHaveBeenCalledWith("GPL-3.0");
      expect((result.attributes as Record<string, unknown>).licenses).toEqual([
        "GPL-3.0",
      ]);
    });

    it("When extraction returns undefined, Then should remove licenses property", () => {
      // Arrange
      const input = createMockShipWithAttributes({
        licenses: null,
        mass: 100,
      });

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(
        (result.attributes as Record<string, unknown>).licenses
      ).toBeUndefined();
    });

    it("When item has no attributes, Then should return item unchanged", () => {
      // Arrange
      const input = createMockShip({ attributes: undefined });

      // Act
      const result = extractor.transform(input);

      // Assert
      expect(licensesUtils.extractLicenses).not.toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it("When transforming item, Then should preserve other attribute properties", () => {
      // Arrange
      const input = createMockShipWithAttributes({
        licenses: "GPL-3.0",
        mass: 100,
        cost: 1000,
      });

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      const attributes = result.attributes as Record<string, unknown>;
      expect(attributes.mass).toBe(100);
      expect(attributes.cost).toBe(1000);
    });

    it("When transforming item, Then should preserve non-attribute properties", () => {
      // Arrange
      const input = createMockShipWithAttributes(
        { licenses: "GPL-3.0" },
        { sprite: "sprite.png" }
      );

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);

      // Act
      const result = extractor.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });
  });
});
