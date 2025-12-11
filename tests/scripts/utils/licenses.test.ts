import { extractLicenses } from "@scripts/utils/licenses";

describe("licenses", () => {
  describe("extractLicenses", () => {
    it("When extracting single string license, Then should return array", () => {
      // Act
      const result = extractLicenses("GPL-3.0");

      // Assert
      expect(result).toEqual(["GPL-3.0"]);
    });

    it("When extracting array of licenses, Then should return array", () => {
      // Act
      const result = extractLicenses(["GPL-3.0", "MIT"]);

      // Assert
      expect(result).toEqual(["GPL-3.0", "MIT"]);
    });

    it("When input is null, Then should return undefined", () => {
      // Act
      const result = extractLicenses(null);

      // Assert
      expect(result).toBeUndefined();
    });

    it("When input is undefined, Then should return undefined", () => {
      // Act
      const result = extractLicenses(undefined);

      // Assert
      expect(result).toBeUndefined();
    });

    it("When input is empty array, Then should return undefined", () => {
      // Act
      const result = extractLicenses([]);

      // Assert
      expect(result).toBeUndefined();
    });

    it("When extracting from objects with _value, Then should extract _value property", () => {
      // Act
      const result = extractLicenses([{ _value: "GPL-3.0" }]);

      // Assert
      expect(result).toEqual(["GPL-3.0"]);
    });

    it("When array contains non-string values, Then should filter them out", () => {
      // Act
      const result = extractLicenses(["GPL-3.0", 100, "MIT", null]);

      // Assert
      expect(result).toEqual(["GPL-3.0", "MIT"]);
    });

    it("When all values are filtered out, Then should return undefined", () => {
      // Act
      const result = extractLicenses([100, null, undefined]);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
