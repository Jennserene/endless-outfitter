import {
  normalizeNumeric,
  normalizeNumericAttributes,
} from "@scripts/utils/numeric";

describe("numeric", () => {
  describe("normalizeNumeric", () => {
    it("should return number as-is when valid", () => {
      expect(normalizeNumeric(100)).toBe(100);
      expect(normalizeNumeric(0.5)).toBe(0.5);
      expect(normalizeNumeric(-10)).toBe(-10);
    });

    it("should convert string numbers to numbers", () => {
      expect(normalizeNumeric("100")).toBe(100);
      expect(normalizeNumeric("0.5")).toBe(0.5);
      expect(normalizeNumeric("-10")).toBe(-10);
    });

    it("should return undefined for NaN numbers", () => {
      expect(normalizeNumeric(NaN)).toBeUndefined();
    });

    it("should return undefined for Infinity numbers", () => {
      expect(normalizeNumeric(Infinity)).toBeUndefined();
      expect(normalizeNumeric(-Infinity)).toBeUndefined();
    });

    it("should return undefined for invalid string numbers", () => {
      expect(normalizeNumeric("not a number")).toBeUndefined();
      expect(normalizeNumeric("NaN")).toBeUndefined();
      expect(normalizeNumeric("Infinity")).toBeUndefined();
    });

    it("should extract and convert _value from objects", () => {
      expect(normalizeNumeric({ _value: "100" })).toBe(100);
      expect(normalizeNumeric({ _value: 200 })).toBe(200);
    });

    it("should return undefined for objects without _value", () => {
      expect(normalizeNumeric({ other: 100 })).toBeUndefined();
      expect(normalizeNumeric({})).toBeUndefined();
    });

    it("should return undefined for null", () => {
      expect(normalizeNumeric(null)).toBeUndefined();
    });

    it("should return undefined for other types", () => {
      expect(normalizeNumeric(true)).toBeUndefined();
      expect(normalizeNumeric([])).toBeUndefined();
    });
  });

  describe("normalizeNumericAttributes", () => {
    it("should normalize numeric string values to numbers", () => {
      const attributes = {
        mass: "100",
        drag: "0.5",
        cost: "1000",
      };

      const result = normalizeNumericAttributes(attributes, [
        "mass",
        "drag",
        "cost",
      ]);

      expect(result.mass).toBe(100);
      expect(result.drag).toBe(0.5);
      expect(result.cost).toBe(1000);
    });

    it("should leave non-numeric values as strings", () => {
      const attributes = {
        mass: "100",
        name: "Test Ship",
        description: "A test ship",
      };

      const result = normalizeNumericAttributes(attributes, ["mass"]);

      expect(result.mass).toBe(100);
      expect(result.name).toBe("Test Ship");
      expect(result.description).toBe("A test ship");
    });

    it("should handle decimal numbers", () => {
      const attributes = {
        drag: "0.123",
        heat: "1.5",
      };

      const result = normalizeNumericAttributes(attributes, ["drag", "heat"]);

      expect(result.drag).toBe(0.123);
      expect(result.heat).toBe(1.5);
    });

    it("should handle negative numbers", () => {
      const attributes = {
        value: "-100",
        offset: "-0.5",
      };

      const result = normalizeNumericAttributes(attributes, [
        "value",
        "offset",
      ]);

      expect(result.value).toBe(-100);
      expect(result.offset).toBe(-0.5);
    });

    it("should handle zero", () => {
      const attributes = {
        mass: "0",
        cost: "0",
      };

      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      expect(result.mass).toBe(0);
      expect(result.cost).toBe(0);
    });

    it("should leave non-numeric keys unchanged", () => {
      const attributes = {
        mass: "100",
        invalid: "not a number",
      };

      const result = normalizeNumericAttributes(attributes, ["mass"]);

      expect(result.mass).toBe(100);
      expect(result.invalid).toBe("not a number");
    });

    it("should handle empty string", () => {
      const attributes = {
        mass: "",
        cost: "100",
      };

      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      // Empty string converts to 0
      expect(result.mass).toBe(0);
      expect(result.cost).toBe(100);
    });

    it("should handle values that are already numbers", () => {
      const attributes = {
        mass: 100,
        cost: 1000,
      };

      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      expect(result.mass).toBe(100);
      expect(result.cost).toBe(1000);
    });

    it("should handle values not in numericKeys list", () => {
      const attributes = {
        mass: "100",
        other: "200",
      };

      const result = normalizeNumericAttributes(attributes, ["mass"]);

      expect(result.mass).toBe(100);
      expect(result.other).toBe("200");
    });

    it("should handle empty attributes object", () => {
      const result = normalizeNumericAttributes({}, ["mass", "cost"]);
      expect(result).toEqual({});
    });

    it("should remove invalid numeric values", () => {
      const attributes = {
        mass: "NaN",
        value: "Infinity",
        cost: "100",
      };

      const result = normalizeNumericAttributes(attributes, [
        "mass",
        "value",
        "cost",
      ]);

      // Invalid numeric values are removed
      expect(result.mass).toBeUndefined();
      expect(result.value).toBeUndefined();
      expect(result.cost).toBe(100);
    });

    it("should handle objects with _value property", () => {
      const attributes = {
        mass: { _value: "100" },
        cost: { _value: 200 },
      };

      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      expect(result.mass).toBe(100);
      expect(result.cost).toBe(200);
    });
  });
});
