import {
  extractStringValue,
  extractStringArray,
} from "@scripts/utils/value-extraction";

describe("value-extraction", () => {
  describe("extractStringValue", () => {
    it("When extracting string value directly, Then should return string", () => {
      // Assert
      expect(extractStringValue("Test Ship")).toBe("Test Ship");
    });

    it("When extracting from array, Then should return first element", () => {
      // Assert
      expect(extractStringValue(["First", "Second"])).toBe("First");
    });

    it("When array is empty, Then should return undefined", () => {
      // Assert
      expect(extractStringValue([])).toBeUndefined();
    });

    it("When extracting from object with _value, Then should return _value", () => {
      // Assert
      expect(extractStringValue({ _value: "Test Ship" })).toBe("Test Ship");
    });

    it("When extracting from object, Then should return first string value", () => {
      // Assert
      expect(extractStringValue({ name: "Test Ship", other: 100 })).toBe(
        "Test Ship"
      );
    });

    it("When input is non-string value, Then should return undefined", () => {
      // Assert
      expect(extractStringValue(100)).toBeUndefined();
      expect(extractStringValue(null)).toBeUndefined();
      expect(extractStringValue(undefined)).toBeUndefined();
    });

    it("When extracting from nested arrays, Then should recursively extract", () => {
      // Assert
      expect(extractStringValue([["Nested", "Value"]])).toBe("Nested");
    });

    it("When object has no string values, Then should return undefined", () => {
      // Assert
      expect(extractStringValue({ num: 100, bool: true })).toBeUndefined();
    });
  });

  describe("extractStringArray", () => {
    it("When extracting single string, Then should return array with one element", () => {
      // Assert
      expect(extractStringArray("Test")).toEqual(["Test"]);
    });

    it("When extracting array of strings, Then should return array", () => {
      // Assert
      expect(extractStringArray(["First", "Second"])).toEqual([
        "First",
        "Second",
      ]);
    });

    it("When extracting from array of objects with _value, Then should extract _value properties", () => {
      // Assert
      expect(
        extractStringArray([{ _value: "First" }, { _value: "Second" }])
      ).toEqual(["First", "Second"]);
    });

    it("When extracting from object values, Then should extract string values", () => {
      // Assert
      expect(extractStringArray({ key1: "First", key2: "Second" })).toEqual([
        "First",
        "Second",
      ]);
    });

    it("When input is non-string value, Then should return empty array", () => {
      // Assert
      expect(extractStringArray(100)).toEqual([]);
      expect(extractStringArray(null)).toEqual([]);
      expect(extractStringArray({})).toEqual([]);
    });

    it("When array contains non-string values, Then should filter them out", () => {
      // Assert
      expect(extractStringArray(["Valid", 100, "Also Valid", null])).toEqual([
        "Valid",
        "Also Valid",
      ]);
    });

    it("When input is empty array, Then should return empty array", () => {
      // Assert
      expect(extractStringArray([])).toEqual([]);
    });

    it("When extracting from nested structures, Then should handle all formats", () => {
      // Assert
      expect(
        extractStringArray([{ _value: "First" }, "Second", { name: "Third" }])
      ).toEqual(["First", "Second", "Third"]);
    });
  });
});
