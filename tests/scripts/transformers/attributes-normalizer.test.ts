import { AttributesNormalizer } from "@scripts/transformers/attributes-normalizer";

describe("AttributesNormalizer", () => {
  let normalizer: AttributesNormalizer;

  beforeEach(() => {
    normalizer = new AttributesNormalizer();
  });

  describe("transform", () => {
    it("should normalize attributes from object", () => {
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
          cost: 1000,
        },
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.attributes).toEqual({
        mass: 100,
        cost: 1000,
        category: "Unknown",
      });
    });

    it("should create empty attributes when attributes is true", () => {
      const input = {
        name: "Test Ship",
        attributes: true,
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.attributes).toEqual({
        category: "Unknown",
      });
    });

    it("should create empty attributes when attributes is undefined", () => {
      const input = {
        name: "Test Ship",
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.attributes).toEqual({
        category: "Unknown",
      });
    });

    it("should merge add attributes into attributes", () => {
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

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.attributes).toEqual({
        mass: 100,
        cost: 1000,
        drag: 0.5,
        category: "Unknown",
      });
    });

    it("should copy category from top level to attributes", () => {
      const input = {
        name: "Test Ship",
        category: "Fighter",
        attributes: {
          mass: 100,
        },
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect((result.attributes as Record<string, unknown>).category).toBe(
        "Fighter"
      );
      // Category is copied, not moved, so it remains at top level
      expect(result.category).toBe("Fighter");
    });

    it("should use existing category in attributes if present", () => {
      const input = {
        name: "Test Ship",
        category: "Fighter",
        attributes: {
          category: "Bomber",
          mass: 100,
        },
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect((result.attributes as Record<string, unknown>).category).toBe(
        "Bomber"
      );
    });

    it("should set default category when missing", () => {
      const input = {
        name: "Test Ship",
        attributes: {
          mass: 100,
        },
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect((result.attributes as Record<string, unknown>).category).toBe(
        "Unknown"
      );
    });

    it("should preserve other ship properties", () => {
      const input = {
        name: "Test Ship",
        sprite: "sprite.png",
        attributes: {
          mass: 100,
        },
      };

      const result = normalizer.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });
  });
});
