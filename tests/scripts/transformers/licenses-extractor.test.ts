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
    it("should extract licenses from attributes", () => {
      const input = createMockShipWithAttributes({
        licenses: "GPL-3.0",
        mass: 100,
      });

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(licensesUtils.extractLicenses).toHaveBeenCalledWith("GPL-3.0");
      expect((result.attributes as Record<string, unknown>).licenses).toEqual([
        "GPL-3.0",
      ]);
    });

    it("should remove licenses when extraction returns undefined", () => {
      const input = createMockShipWithAttributes({
        licenses: null,
        mass: 100,
      });

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(undefined);

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(
        (result.attributes as Record<string, unknown>).licenses
      ).toBeUndefined();
    });

    it("should return item unchanged when no attributes", () => {
      const input = createMockShip();

      const result = extractor.transform(input);

      expect(licensesUtils.extractLicenses).not.toHaveBeenCalled();
      expect(result).toEqual(input);
    });

    it("should preserve other attribute properties", () => {
      const input = createMockShipWithAttributes({
        licenses: "GPL-3.0",
        mass: 100,
        cost: 1000,
      });

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);

      const result = extractor.transform(input) as Record<string, unknown>;

      const attributes = result.attributes as Record<string, unknown>;
      expect(attributes.mass).toBe(100);
      expect(attributes.cost).toBe(1000);
    });

    it("should preserve non-attribute properties", () => {
      const input = createMockShipWithAttributes(
        { licenses: "GPL-3.0" },
        { sprite: "sprite.png" }
      );

      (licensesUtils.extractLicenses as jest.Mock).mockReturnValue(["GPL-3.0"]);

      const result = extractor.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });
  });
});
