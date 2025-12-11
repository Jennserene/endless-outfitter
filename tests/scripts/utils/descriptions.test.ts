import { extractDescriptions } from "@scripts/utils/descriptions";

describe("descriptions", () => {
  describe("extractDescriptions", () => {
    it("should extract single string description", () => {
      const result = extractDescriptions("A test ship");
      expect(result).toEqual(["A test ship"]);
    });

    it("should extract array of string descriptions", () => {
      const result = extractDescriptions(["First line", "Second line"]);
      expect(result).toEqual(["First line", "Second line"]);
    });

    it("should extract from objects with _value", () => {
      const result = extractDescriptions([{ _value: "Description 1" }]);
      expect(result).toEqual(["Description 1"]);
    });

    it("should return empty array for null", () => {
      const result = extractDescriptions(null);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined", () => {
      const result = extractDescriptions(undefined);
      expect(result).toEqual([]);
    });

    it("should filter out non-string values", () => {
      const result = extractDescriptions([
        "Valid description",
        100,
        "Another valid",
        null,
      ]);
      expect(result).toEqual(["Valid description", "Another valid"]);
    });

    it("should handle mixed formats in array", () => {
      const result = extractDescriptions([
        "String description",
        { _value: "Object description" },
        { name: "Nested description" },
      ]);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle empty array", () => {
      const result = extractDescriptions([]);
      expect(result).toEqual([]);
    });
  });
});
