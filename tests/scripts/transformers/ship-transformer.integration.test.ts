import { ShipTransformer } from "@scripts/transformers/ship-transformer";

describe("ShipTransformer Integration Tests", () => {
  describe("gun ports and turret mounts", () => {
    it("should add gun ports and turret mounts to attributes from gun and turret arrays", () => {
      const transformer = new ShipTransformer();

      const rawShip = {
        name: "Test Ship",
        sprite: "ship/test",
        thumbnail: "thumbnail/test",
        attributes: {
          category: "Warship",
          cost: 1000000,
        },
        gun: [
          { _value: -10, _values: [-10, -50, "Weapon"] },
          { _value: 10, _values: [10, -50, "Weapon"] },
          { _value: -20, _values: [-20, -40, "Weapon"] },
        ],
        turret: [
          { _value: 0, _values: [0, 10, "Turret"] },
          { _value: -30, _values: [-30, 20, "Turret"] },
        ],
        outfits: {},
        descriptions: [],
      };

      const result = transformer.transform(rawShip) as {
        name: string;
        attributes: Record<string, unknown>;
      };

      expect(result.attributes["gun ports"]).toBe(3);
      expect(result.attributes["turret mounts"]).toBe(2);
    });

    it("should handle ships without gun or turret arrays", () => {
      const transformer = new ShipTransformer();

      const rawShip = {
        name: "Test Ship",
        sprite: "ship/test",
        thumbnail: "thumbnail/test",
        attributes: {
          category: "Warship",
          cost: 1000000,
        },
        outfits: {},
        descriptions: [],
      };

      const result = transformer.transform(rawShip) as {
        name: string;
        attributes: Record<string, unknown>;
      };

      expect(result.attributes["gun ports"]).toBeUndefined();
      expect(result.attributes["turret mounts"]).toBeUndefined();
    });

    it("should handle ships with only gun ports", () => {
      const transformer = new ShipTransformer();

      const rawShip = {
        name: "Test Ship",
        sprite: "ship/test",
        thumbnail: "thumbnail/test",
        attributes: {
          category: "Warship",
          cost: 1000000,
        },
        gun: [
          { _value: -10, _values: [-10, -50, "Weapon"] },
          { _value: 10, _values: [10, -50, "Weapon"] },
        ],
        outfits: {},
        descriptions: [],
      };

      const result = transformer.transform(rawShip) as {
        name: string;
        attributes: Record<string, unknown>;
      };

      expect(result.attributes["gun ports"]).toBe(2);
      expect(result.attributes["turret mounts"]).toBeUndefined();
    });

    it("should handle ships with only turret mounts", () => {
      const transformer = new ShipTransformer();

      const rawShip = {
        name: "Test Ship",
        sprite: "ship/test",
        thumbnail: "thumbnail/test",
        attributes: {
          category: "Warship",
          cost: 1000000,
        },
        turret: [{ _value: 0, _values: [0, 10, "Turret"] }],
        outfits: {},
        descriptions: [],
      };

      const result = transformer.transform(rawShip) as {
        name: string;
        attributes: Record<string, unknown>;
      };

      expect(result.attributes["gun ports"]).toBeUndefined();
      expect(result.attributes["turret mounts"]).toBe(1);
    });

    it("should preserve existing attributes when adding gun ports and turret mounts", () => {
      const transformer = new ShipTransformer();

      const rawShip = {
        name: "Test Ship",
        sprite: "ship/test",
        thumbnail: "thumbnail/test",
        attributes: {
          category: "Warship",
          cost: 1000000,
          shields: 5000,
        },
        gun: [{ _value: -10, _values: [-10, -50, "Weapon"] }],
        turret: [{ _value: 0, _values: [0, 10, "Turret"] }],
        outfits: {},
        descriptions: [],
      };

      const result = transformer.transform(rawShip) as {
        name: string;
        attributes: Record<string, unknown>;
      };

      expect(result.attributes.category).toBe("Warship");
      expect(result.attributes.cost).toBe(1000000);
      expect(result.attributes.shields).toBe(5000);
      expect(result.attributes["gun ports"]).toBe(1);
      expect(result.attributes["turret mounts"]).toBe(1);
    });

    it("should work with real Falcon ship data structure", () => {
      const transformer = new ShipTransformer();

      // Simulate the actual structure from raw data
      const rawShip = {
        name: "Falcon",
        sprite: "ship/falcon",
        thumbnail: "thumbnail/falcon",
        attributes: {
          category: "Heavy Warship",
          cost: 10900000,
          shields: 12800,
          hull: 3700,
          "required crew": 52,
          bunks: 91,
          mass: 1260,
          drag: 11.4,
          "heat dissipation": 0.42,
          "fuel capacity": 600,
          "cargo space": 130,
          "outfit space": 560,
          "weapon capacity": 250,
          "engine capacity": 150,
        },
        gun: [
          { _value: -16, _values: [-16, -86.5, "Plasma Cannon"] },
          { _value: 16, _values: [16, -86.5, "Plasma Cannon"] },
          { _value: -19, _values: [-19, -76.5, "Torpedo Launcher"] },
          { _value: 19, _values: [19, -76.5, "Torpedo Launcher"] },
        ],
        turret: [
          { _value: -16, _values: [-16, -29, "Heavy Anti-Missile Turret"] },
          { _value: 16, _values: [16, -29, "Quad Blaster Turret"] },
          { _value: -50, _values: [-50, 39.5, "Quad Blaster Turret"] },
          { _value: 50, _values: [50, 39.5, "Quad Blaster Turret"] },
        ],
        outfits: {},
        descriptions: [],
      };

      const result = transformer.transform(rawShip) as {
        name: string;
        attributes: Record<string, unknown>;
      };

      expect(result.attributes["gun ports"]).toBe(4);
      expect(result.attributes["turret mounts"]).toBe(4);
      expect(result.attributes.shields).toBe(12800);
      expect(result.attributes["outfit space"]).toBe(560);
    });
  });
});
