import {
  normalizeNumeric,
  normalizeNumericAttributes,
} from "@scripts/utils/numeric";

describe("numeric", () => {
  describe("normalizeNumeric", () => {
    it("When input is valid number, Then should return number as-is", () => {
      // Assert
      expect(normalizeNumeric(100)).toBe(100);
      expect(normalizeNumeric(0.5)).toBe(0.5);
      expect(normalizeNumeric(-10)).toBe(-10);
    });

    it("When input is string number, Then should convert to number", () => {
      // Assert
      expect(normalizeNumeric("100")).toBe(100);
      expect(normalizeNumeric("0.5")).toBe(0.5);
      expect(normalizeNumeric("-10")).toBe(-10);
    });

    it("When input is NaN, Then should return undefined", () => {
      // Assert
      expect(normalizeNumeric(NaN)).toBeUndefined();
    });

    it("When input is Infinity, Then should return undefined", () => {
      // Assert
      expect(normalizeNumeric(Infinity)).toBeUndefined();
      expect(normalizeNumeric(-Infinity)).toBeUndefined();
    });

    it("When input is invalid string number, Then should return undefined", () => {
      // Assert
      expect(normalizeNumeric("not a number")).toBeUndefined();
      expect(normalizeNumeric("NaN")).toBeUndefined();
      expect(normalizeNumeric("Infinity")).toBeUndefined();
    });

    it("When input is object with _value, Then should extract and convert _value", () => {
      // Assert
      expect(normalizeNumeric({ _value: "100" })).toBe(100);
      expect(normalizeNumeric({ _value: 200 })).toBe(200);
    });

    it("When input is object without _value, Then should return undefined", () => {
      // Assert
      expect(normalizeNumeric({ other: 100 })).toBeUndefined();
      expect(normalizeNumeric({})).toBeUndefined();
    });

    it("When input is null, Then should return undefined", () => {
      // Assert
      expect(normalizeNumeric(null)).toBeUndefined();
    });

    it("When input is other types, Then should return undefined", () => {
      // Assert
      expect(normalizeNumeric(true)).toBeUndefined();
      expect(normalizeNumeric([])).toBeUndefined();
    });
  });

  describe("normalizeNumericAttributes", () => {
    it("When normalizing numeric string values, Then should convert to numbers", () => {
      // Arrange
      const attributes = {
        mass: "100",
        drag: "0.5",
        cost: "1000",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, [
        "mass",
        "drag",
        "cost",
      ]);

      // Assert
      expect(result.mass).toBe(100);
      expect(result.drag).toBe(0.5);
      expect(result.cost).toBe(1000);
    });

    it("When normalizing attributes, Then should leave non-numeric values as strings", () => {
      // Arrange
      const attributes = {
        mass: "100",
        name: "Test Ship",
        description: "A test ship",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass"]);

      // Assert
      expect(result.mass).toBe(100);
      expect(result.name).toBe("Test Ship");
      expect(result.description).toBe("A test ship");
    });

    it("When normalizing decimal numbers, Then should handle decimals correctly", () => {
      // Arrange
      const attributes = {
        drag: "0.123",
        heat: "1.5",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["drag", "heat"]);

      // Assert
      expect(result.drag).toBe(0.123);
      expect(result.heat).toBe(1.5);
    });

    it("When normalizing negative numbers, Then should handle negatives correctly", () => {
      // Arrange
      const attributes = {
        value: "-100",
        offset: "-0.5",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, [
        "value",
        "offset",
      ]);

      // Assert
      expect(result.value).toBe(-100);
      expect(result.offset).toBe(-0.5);
    });

    it("When normalizing zero, Then should handle zero correctly", () => {
      // Arrange
      const attributes = {
        mass: "0",
        cost: "0",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      // Assert
      expect(result.mass).toBe(0);
      expect(result.cost).toBe(0);
    });

    it("When normalizing attributes, Then should leave non-numeric keys unchanged", () => {
      // Arrange
      const attributes = {
        mass: "100",
        invalid: "not a number",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass"]);

      // Assert
      expect(result.mass).toBe(100);
      expect(result.invalid).toBe("not a number");
    });

    it("When normalizing empty string, Then should convert to zero", () => {
      // Arrange
      const attributes = {
        mass: "",
        cost: "100",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      // Assert
      // Empty string converts to 0
      expect(result.mass).toBe(0);
      expect(result.cost).toBe(100);
    });

    it("When values are already numbers, Then should preserve them", () => {
      // Arrange
      const attributes = {
        mass: 100,
        cost: 1000,
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      // Assert
      expect(result.mass).toBe(100);
      expect(result.cost).toBe(1000);
    });

    it("When values are not in numericKeys list, Then should leave unchanged", () => {
      // Arrange
      const attributes = {
        mass: "100",
        other: "200",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass"]);

      // Assert
      expect(result.mass).toBe(100);
      expect(result.other).toBe("200");
    });

    it("When attributes object is empty, Then should return empty object", () => {
      // Act
      const result = normalizeNumericAttributes({}, ["mass", "cost"]);

      // Assert
      expect(result).toEqual({});
    });

    it("When normalizing invalid numeric values, Then should remove them", () => {
      // Arrange
      const attributes = {
        mass: "NaN",
        value: "Infinity",
        cost: "100",
      };

      // Act
      const result = normalizeNumericAttributes(attributes, [
        "mass",
        "value",
        "cost",
      ]);

      // Assert
      // Invalid numeric values are removed
      expect(result.mass).toBeUndefined();
      expect(result.value).toBeUndefined();
      expect(result.cost).toBe(100);
    });

    it("When attributes contain objects with _value, Then should extract and normalize", () => {
      // Arrange
      const attributes = {
        mass: { _value: "100" },
        cost: { _value: 200 },
      };

      // Act
      const result = normalizeNumericAttributes(attributes, ["mass", "cost"]);

      // Assert
      expect(result.mass).toBe(100);
      expect(result.cost).toBe(200);
    });
  });
});
