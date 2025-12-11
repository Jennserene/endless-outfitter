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
