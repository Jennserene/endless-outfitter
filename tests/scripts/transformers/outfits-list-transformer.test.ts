import { OutfitsListTransformer } from "@scripts/transformers/outfits-list-transformer";

describe("OutfitsListTransformer", () => {
  let transformer: OutfitsListTransformer;

  beforeEach(() => {
    transformer = new OutfitsListTransformer();
  });

  describe("transform", () => {
    it("When transforming outfits object, Then should convert to array format", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        outfits: {
          "Engine 1": 1,
          "Weapon 1": 2,
          Shield: 1,
        },
      };

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.outfits).toEqual([
        { name: "Engine 1", quantity: 1 },
        { name: "Weapon 1", quantity: 2 },
        { name: "Shield", quantity: 1 },
      ]);
    });

    it("When outfits have non-numeric values, Then should use quantity 1", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        outfits: {
          "Engine 1": "1",
          "Weapon 1": true,
          Shield: null,
        },
      };

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.outfits).toEqual([
        { name: "Engine 1", quantity: 1 },
        { name: "Weapon 1", quantity: 1 },
        { name: "Shield", quantity: 1 },
      ]);
    });

    it("When outfits is missing, Then should return empty array", () => {
      // Arrange
      const input = {
        name: "Test Ship",
      };

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.outfits).toEqual([]);
    });

    it("When outfits is null, Then should return empty array", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        outfits: null,
      };

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.outfits).toEqual([]);
    });

    it("When transforming ship, Then should preserve other properties", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        sprite: "sprite.png",
        outfits: {
          "Engine 1": 1,
        },
      };

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });

    it("When outfits object is empty, Then should return empty array", () => {
      // Arrange
      const input = {
        name: "Test Ship",
        outfits: {},
      };

      // Act
      const result = transformer.transform(input) as Record<string, unknown>;

      // Assert
      expect(result.outfits).toEqual([]);
    });
  });
});
