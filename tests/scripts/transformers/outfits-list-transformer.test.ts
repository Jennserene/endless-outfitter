import { OutfitsListTransformer } from "@scripts/transformers/outfits-list-transformer";

describe("OutfitsListTransformer", () => {
  let transformer: OutfitsListTransformer;

  beforeEach(() => {
    transformer = new OutfitsListTransformer();
  });

  describe("transform", () => {
    it("should transform outfits object to array", () => {
      const input = {
        name: "Test Ship",
        outfits: {
          "Engine 1": 1,
          "Weapon 1": 2,
          Shield: 1,
        },
      };

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.outfits).toEqual([
        { name: "Engine 1", quantity: 1 },
        { name: "Weapon 1", quantity: 2 },
        { name: "Shield", quantity: 1 },
      ]);
    });

    it("should use quantity 1 for non-numeric values", () => {
      const input = {
        name: "Test Ship",
        outfits: {
          "Engine 1": "1",
          "Weapon 1": true,
          Shield: null,
        },
      };

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.outfits).toEqual([
        { name: "Engine 1", quantity: 1 },
        { name: "Weapon 1", quantity: 1 },
        { name: "Shield", quantity: 1 },
      ]);
    });

    it("should return empty array when outfits is missing", () => {
      const input = {
        name: "Test Ship",
      };

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.outfits).toEqual([]);
    });

    it("should return empty array when outfits is null", () => {
      const input = {
        name: "Test Ship",
        outfits: null,
      };

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.outfits).toEqual([]);
    });

    it("should preserve other ship properties", () => {
      const input = {
        name: "Test Ship",
        sprite: "sprite.png",
        outfits: {
          "Engine 1": 1,
        },
      };

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.name).toBe("Test Ship");
      expect(result.sprite).toBe("sprite.png");
    });

    it("should handle empty outfits object", () => {
      const input = {
        name: "Test Ship",
        outfits: {},
      };

      const result = transformer.transform(input) as Record<string, unknown>;

      expect(result.outfits).toEqual([]);
    });
  });
});
