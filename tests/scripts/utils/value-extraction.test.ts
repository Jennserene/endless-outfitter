import {
  extractStringValue,
  extractStringArray,
} from "@scripts/utils/value-extraction";

describe("value-extraction", () => {
  describe("extractStringValue", () => {
    it("should extract string value directly", () => {
      expect(extractStringValue("Test Ship")).toBe("Test Ship");
    });

    it("should extract string from array (first element)", () => {
      expect(extractStringValue(["First", "Second"])).toBe("First");
    });

    it("should return undefined for empty array", () => {
      expect(extractStringValue([])).toBeUndefined();
    });

    it("should extract _value from object", () => {
      expect(extractStringValue({ _value: "Test Ship" })).toBe("Test Ship");
    });

    it("should extract first string value from object", () => {
      expect(extractStringValue({ name: "Test Ship", other: 100 })).toBe(
        "Test Ship"
      );
    });

    it("should return undefined for non-string values", () => {
      expect(extractStringValue(100)).toBeUndefined();
      expect(extractStringValue(null)).toBeUndefined();
      expect(extractStringValue(undefined)).toBeUndefined();
    });

    it("should recursively extract from nested arrays", () => {
      expect(extractStringValue([["Nested", "Value"]])).toBe("Nested");
    });

    it("should handle object with no string values", () => {
      expect(extractStringValue({ num: 100, bool: true })).toBeUndefined();
    });
  });

  describe("extractStringArray", () => {
    it("should extract single string to array", () => {
      expect(extractStringArray("Test")).toEqual(["Test"]);
    });

    it("should extract array of strings", () => {
      expect(extractStringArray(["First", "Second"])).toEqual([
        "First",
        "Second",
      ]);
    });

    it("should extract strings from array of objects with _value", () => {
      expect(
        extractStringArray([{ _value: "First" }, { _value: "Second" }])
      ).toEqual(["First", "Second"]);
    });

    it("should extract strings from object values", () => {
      expect(extractStringArray({ key1: "First", key2: "Second" })).toEqual([
        "First",
        "Second",
      ]);
    });

    it("should return empty array for non-string values", () => {
      expect(extractStringArray(100)).toEqual([]);
      expect(extractStringArray(null)).toEqual([]);
      expect(extractStringArray({})).toEqual([]);
    });

    it("should filter out non-string values from array", () => {
      expect(extractStringArray(["Valid", 100, "Also Valid", null])).toEqual([
        "Valid",
        "Also Valid",
      ]);
    });

    it("should handle empty array", () => {
      expect(extractStringArray([])).toEqual([]);
    });

    it("should handle nested structures", () => {
      expect(
        extractStringArray([{ _value: "First" }, "Second", { name: "Third" }])
      ).toEqual(["First", "Second", "Third"]);
    });
  });
});
