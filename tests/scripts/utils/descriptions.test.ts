import { extractDescriptions } from "@scripts/utils/descriptions";

describe("descriptions", () => {
  describe("extractDescriptions", () => {
    it("When extracting single string description, Then should return array with one element", () => {
      // Act
      const result = extractDescriptions("A test ship");

      // Assert
      expect(result).toEqual(["A test ship"]);
    });

    it("When extracting array of string descriptions, Then should return array", () => {
      // Act
      const result = extractDescriptions(["First line", "Second line"]);

      // Assert
      expect(result).toEqual(["First line", "Second line"]);
    });

    it("When extracting from objects with _value, Then should extract _value property", () => {
      // Act
      const result = extractDescriptions([{ _value: "Description 1" }]);

      // Assert
      expect(result).toEqual(["Description 1"]);
    });

    it("When input is null, Then should return empty array", () => {
      // Act
      const result = extractDescriptions(null);

      // Assert
      expect(result).toEqual([]);
    });

    it("When input is undefined, Then should return empty array", () => {
      // Act
      const result = extractDescriptions(undefined);

      // Assert
      expect(result).toEqual([]);
    });

    it("When array contains non-string values, Then should filter them out", () => {
      // Act
      const result = extractDescriptions([
        "Valid description",
        100,
        "Another valid",
        null,
      ]);

      // Assert
      expect(result).toEqual(["Valid description", "Another valid"]);
    });

    it("When array has mixed formats, Then should handle all formats", () => {
      // Act
      const result = extractDescriptions([
        "String description",
        { _value: "Object description" },
        { name: "Nested description" },
      ]);

      // Assert
      expect(result.length).toBeGreaterThan(0);
    });

    it("When input is empty array, Then should return empty array", () => {
      // Act
      const result = extractDescriptions([]);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
