import { AttributesNormalizer } from "@scripts/transformers/attributes-normalizer";

describe("AttributesNormalizer", () => {
  let normalizer: AttributesNormalizer;

  beforeEach(() => {
    normalizer = new AttributesNormalizer();
  });

  describe("transform", () => {
    it("When normalizing attributes from object, Then should preserve attributes and add category", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
          cost: 1000,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toEqual({
        mass: 100,
        cost: 1000,
        category: "Unknown",
      });
    });

    it("When attributes is true, Then should create empty attributes with category", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        attributes: true,
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toEqual({
        category: "Unknown",
      });
    });

    it("When attributes is undefined, Then should create empty attributes with category", () => {
      // Arrange
      const input = {
        name: "Test Ship",
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toEqual({
        category: "Unknown",
      });
    });

    it("When merging add attributes, Then should combine with existing attributes", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
        },
        "add attributes": {
          cost: 1000,
          drag: 0.5,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toEqual({
        mass: 100,
        cost: 1000,
        drag: 0.5,
        category: "Unknown",
      });
    });

    it("When merging add block with _value attributes (variant format), Then should combine with existing attributes", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
          cost: 500,
        },
        add: {
          _value: "attributes",
          cost: 1000,
          drag: 0.5,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toEqual({
        mass: 100,
        cost: 1500, // 500 + 1000 (numeric addition)
        drag: 0.5,
        category: "Unknown",
      });
    });

    it("When merging add block with numeric values, Then should add numeric values", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
          shields: 50,
        },
        add: {
          _value: "attributes",
          mass: 20, // Should add: 100 + 20 = 120
          shields: 30, // Should add: 50 + 30 = 80
          cost: 1000, // Should replace (not a number in base)
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.attributes).toEqual({
        mass: 120,
        shields: 80,
        cost: 1000,
        category: "Unknown",
      });
    });

    it("When category exists at top level, Then should copy to attributes", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        category: "Fighter",
        attributes: {
          mass: 100,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result.attributes as Record<string, unknown>).category).toBe(
        "Fighter"
      );
      // Category is copied, not moved, so it remains at top level
      expect(result.category).toBe("Fighter");
    });

    it("When category exists in attributes, Then should use existing category", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        category: "Fighter",
        attributes: {
          category: "Bomber",
          mass: 100,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result.attributes as Record<string, unknown>).category).toBe(
        "Bomber"
      );
    });

    it("When category is missing, Then should set default category", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect((result.attributes as Record<string, unknown>).category).toBe(
        "Unknown"
      );
    });

    it("When transforming input, Then should preserve other properties", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        sprite: "sprite.png",
        attributes: {
          mass: 100,
        },
      };

      // Act
      const result = normalizer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });
  });
});
