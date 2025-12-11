import { extractLicenses } from "@scripts/utils/licenses";

describe("licenses", () => {
  describe("extractLicenses", () => {
    it("should extract single string license", () => {
      const result = extractLicenses("GPL-3.0");
      expect(result).toEqual(["GPL-3.0"]);
    });

    it("should extract array of licenses", () => {
      const result = extractLicenses(["GPL-3.0", "MIT"]);
      expect(result).toEqual(["GPL-3.0", "MIT"]);
    });

    it("should return undefined for null", () => {
      const result = extractLicenses(null);
      expect(result).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
      const result = extractLicenses(undefined);
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty array", () => {
      const result = extractLicenses([]);
      expect(result).toBeUndefined();
    });

    it("should extract from objects with _value", () => {
      const result = extractLicenses([{ _value: "GPL-3.0" }]);
      expect(result).toEqual(["GPL-3.0"]);
    });

    it("should filter out non-string values", () => {
      const result = extractLicenses(["GPL-3.0", 100, "MIT", null]);
      expect(result).toEqual(["GPL-3.0", "MIT"]);
    });

    it("should return undefined when all values are filtered out", () => {
      const result = extractLicenses([100, null, undefined]);
      expect(result).toBeUndefined();
    });
  });
});
