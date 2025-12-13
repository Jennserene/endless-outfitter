/**
 * @jest-environment node
 */

import { Ship } from "@/lib/models/ship";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

// Test constants
const TEST_SHIP_BASE: ShipType = {
  name: "Test Ship",
  slug: "test-ship",
  attributes: {
    category: "Fighter",
    hull: 100,
    shields: 50,
    mass: 200,
    drag: 0.5,
    "cargo space": 10,
  },
  outfits: [],
  descriptions: [],
};

const TEST_OUTFIT_THRUSTER: Outfit = {
  name: "Basic Thruster",
  slug: "basic-thruster",
  mass: 5, // Outfit's own mass (weight)
  attributes: {
    thrust: 100,
    turn: 50,
  },
  descriptions: [],
};

const TEST_OUTFIT_SHIELD: Outfit = {
  name: "Shield Generator",
  slug: "shield-generator",
  mass: 10, // Outfit's own mass (weight)
  attributes: {
    shields: 25,
  },
  descriptions: [],
};

const TEST_OUTFIT_STEERING: Outfit = {
  name: "Steering",
  slug: "steering",
  attributes: {
    turn: 30,
  },
  descriptions: [],
};

function createShip(
  overrides: Partial<ShipType> = {},
  outfits: Outfit[] = []
): Ship {
  const shipData: ShipType = {
    ...TEST_SHIP_BASE,
    ...overrides,
    attributes: {
      ...TEST_SHIP_BASE.attributes,
      ...(overrides.attributes || {}),
    },
  };
  return new Ship(shipData, outfits);
}

describe("Ship", () => {
  describe("constructor", () => {
    it("should create a ship with base data and no outfits", () => {
      const ship = createShip();
      expect(ship.hullAttributes).toEqual(TEST_SHIP_BASE.attributes);
      expect(ship.getOutfits()).toEqual([]);
    });

    it("should create a ship with outfits", () => {
      const ship = createShip({}, [TEST_OUTFIT_THRUSTER]);
      expect(ship.getOutfits()).toHaveLength(1);
      expect(ship.getOutfits()[0].name).toBe("Basic Thruster");
    });
  });

  describe("hullAttributes", () => {
    it("should return base ship attributes", () => {
      const ship = createShip();
      expect(ship.hullAttributes).toEqual(TEST_SHIP_BASE.attributes);
    });

    it("should not be affected by outfits", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      expect(ship.hullAttributes.shields).toBe(50);
    });
  });

  describe("outfittedAttributes", () => {
    it("should return hull attributes when no outfits", () => {
      const ship = createShip();
      const attrs = ship.outfittedAttributes;
      expect(attrs.hull).toBe(100);
      expect(attrs.shields).toBe(50);
    });

    it("should add numeric attributes from outfits", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      const attrs = ship.outfittedAttributes;
      expect(attrs.shields).toBe(75); // 50 + 25
    });

    it("should add multiple numeric attributes", () => {
      const ship = createShip({}, [
        TEST_OUTFIT_SHIELD,
        TEST_OUTFIT_SHIELD, // Add twice
      ]);
      const attrs = ship.outfittedAttributes;
      expect(attrs.shields).toBe(100); // 50 + 25 + 25
    });

    it("should replace non-numeric attributes", () => {
      const ship = createShip({
        attributes: {
          ...TEST_SHIP_BASE.attributes,
          category: "Fighter",
        },
      });
      const outfit: Outfit = {
        name: "Category Changer",
        slug: "category-changer",
        attributes: {
          category: "Bomber",
        },
        descriptions: [],
      };
      const outfittedShip = ship.addOutfit(outfit);
      const attrs = outfittedShip.outfittedAttributes;
      expect(attrs.category).toBe("Bomber");
    });

    it("should replace array attributes", () => {
      const ship = createShip({
        attributes: {
          ...TEST_SHIP_BASE.attributes,
          licenses: ["License A"],
        },
      });
      const outfit: Outfit = {
        name: "License Changer",
        slug: "license-changer",
        attributes: {
          licenses: ["License B", "License C"],
        },
        descriptions: [],
      };
      const outfittedShip = ship.addOutfit(outfit);
      const attrs = outfittedShip.outfittedAttributes;
      expect(attrs.licenses).toEqual(["License B", "License C"]);
    });

    it("should replace object attributes", () => {
      const ship = createShip({
        attributes: {
          ...TEST_SHIP_BASE.attributes,
          weapon: {
            "shield damage": 10,
            "hull damage": 5,
          },
        },
      });
      const outfit: Outfit = {
        name: "Weapon Changer",
        slug: "weapon-changer",
        attributes: {
          weapon: {
            "shield damage": 20,
            "hull damage": 15,
          },
        },
        descriptions: [],
      };
      const outfittedShip = ship.addOutfit(outfit);
      const attrs = outfittedShip.outfittedAttributes;
      expect(attrs.weapon).toEqual({
        "shield damage": 20,
        "hull damage": 15,
      });
    });

    it("should cache computed attributes", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      const attrs1 = ship.outfittedAttributes;
      const attrs2 = ship.outfittedAttributes;
      // Should be the same reference (cached)
      expect(attrs1).toBe(attrs2);
    });

    it("should handle movement attributes from outfits", () => {
      const ship = createShip({}, [TEST_OUTFIT_THRUSTER]);
      const attrs = ship.outfittedAttributes;
      expect(attrs.thrust).toBe(100);
      expect(attrs.turn).toBe(50);
    });
  });

  describe("addOutfit", () => {
    it("should return a new Ship instance", () => {
      const ship1 = createShip();
      const ship2 = ship1.addOutfit(TEST_OUTFIT_SHIELD);
      expect(ship1).not.toBe(ship2);
      expect(ship1.getOutfits()).toHaveLength(0);
      expect(ship2.getOutfits()).toHaveLength(1);
    });

    it("should add outfit with default quantity of 1", () => {
      const ship = createShip();
      const newShip = ship.addOutfit(TEST_OUTFIT_SHIELD);
      expect(newShip.getOutfits()).toHaveLength(1);
    });

    it("should add multiple outfits with quantity", () => {
      const ship = createShip();
      const newShip = ship.addOutfit(TEST_OUTFIT_SHIELD, 3);
      expect(newShip.getOutfits()).toHaveLength(3);
      expect(newShip.getOutfits()[0].name).toBe("Shield Generator");
      expect(newShip.getOutfits()[1].name).toBe("Shield Generator");
      expect(newShip.getOutfits()[2].name).toBe("Shield Generator");
    });

    it("should update outfitted attributes after adding", () => {
      const ship = createShip();
      const newShip = ship.addOutfit(TEST_OUTFIT_SHIELD);
      expect(newShip.outfittedAttributes.shields).toBe(75); // 50 + 25
    });
  });

  describe("removeOutfit", () => {
    it("should return a new Ship instance", () => {
      const ship1 = createShip({}, [TEST_OUTFIT_SHIELD]);
      const ship2 = ship1.removeOutfit("Shield Generator");
      expect(ship1).not.toBe(ship2);
      expect(ship1.getOutfits()).toHaveLength(1);
      expect(ship2.getOutfits()).toHaveLength(0);
    });

    it("should remove outfit with default quantity of 1", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      const newShip = ship.removeOutfit("Shield Generator");
      expect(newShip.getOutfits()).toHaveLength(0);
    });

    it("should remove multiple outfits with quantity", () => {
      const ship = createShip({}, [
        TEST_OUTFIT_SHIELD,
        TEST_OUTFIT_SHIELD,
        TEST_OUTFIT_SHIELD,
      ]);
      const newShip = ship.removeOutfit("Shield Generator", 2);
      expect(newShip.getOutfits()).toHaveLength(1);
    });

    it("should remove from the end (LIFO)", () => {
      const ship = createShip({}, [
        TEST_OUTFIT_SHIELD,
        TEST_OUTFIT_THRUSTER,
        TEST_OUTFIT_SHIELD,
      ]);
      const newShip = ship.removeOutfit("Shield Generator", 1);
      expect(newShip.getOutfits()).toHaveLength(2);
      expect(newShip.getOutfits()[0].name).toBe("Shield Generator");
      expect(newShip.getOutfits()[1].name).toBe("Basic Thruster");
    });

    it("should handle removing non-existent outfit", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      const newShip = ship.removeOutfit("Non-existent", 1);
      expect(newShip.getOutfits()).toHaveLength(1);
    });

    it("should update outfitted attributes after removing", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      const newShip = ship.removeOutfit("Shield Generator");
      expect(newShip.outfittedAttributes.shields).toBe(50); // Back to base
    });
  });

  describe("setOutfits", () => {
    it("should return a new Ship instance", () => {
      const ship1 = createShip({}, [TEST_OUTFIT_SHIELD]);
      const ship2 = ship1.setOutfits([TEST_OUTFIT_THRUSTER]);
      expect(ship1).not.toBe(ship2);
      expect(ship1.getOutfits()).toHaveLength(1);
      expect(ship2.getOutfits()).toHaveLength(1);
    });

    it("should replace all outfits", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD, TEST_OUTFIT_SHIELD]);
      const newShip = ship.setOutfits([TEST_OUTFIT_THRUSTER]);
      expect(newShip.getOutfits()).toHaveLength(1);
      expect(newShip.getOutfits()[0].name).toBe("Basic Thruster");
    });

    it("should handle empty array", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      const newShip = ship.setOutfits([]);
      expect(newShip.getOutfits()).toHaveLength(0);
    });
  });

  describe("hasThruster", () => {
    it("should return false when no thruster", () => {
      const ship = createShip();
      expect(ship.hasThruster()).toBe(false);
    });

    it("should return true when has thrust", () => {
      const ship = createShip({}, [TEST_OUTFIT_THRUSTER]);
      expect(ship.hasThruster()).toBe(true);
    });

    it("should return true when has reverse thrust", () => {
      const outfit: Outfit = {
        name: "Reverse Thruster",
        slug: "reverse-thruster",
        attributes: {
          "reverse thrust": 50,
        },
        descriptions: [],
      };
      const ship = createShip({}, [outfit]);
      expect(ship.hasThruster()).toBe(true);
    });

    it("should return true when has afterburner thrust", () => {
      const outfit: Outfit = {
        name: "Afterburner",
        slug: "afterburner",
        attributes: {
          "afterburner thrust": 200,
        },
        descriptions: [],
      };
      const ship = createShip({}, [outfit]);
      expect(ship.hasThruster()).toBe(true);
    });
  });

  describe("hasSteering", () => {
    it("should return false when no steering", () => {
      const ship = createShip();
      expect(ship.hasSteering()).toBe(false);
    });

    it("should return true when has turn", () => {
      const ship = createShip({}, [TEST_OUTFIT_STEERING]);
      expect(ship.hasSteering()).toBe(true);
    });

    it("should return true when turn comes from outfit", () => {
      const ship = createShip({}, [TEST_OUTFIT_THRUSTER]);
      expect(ship.hasSteering()).toBe(true); // Thruster also has turn
    });
  });

  describe("getMovementProblems", () => {
    it("should return empty array when no problems", () => {
      const ship = createShip({}, [TEST_OUTFIT_THRUSTER]);
      expect(ship.getMovementProblems()).toEqual([]);
    });

    it("should return 'no thruster!' when no thruster", () => {
      const ship = createShip();
      expect(ship.getMovementProblems()).toContain("no thruster!");
    });

    it("should return 'no steering!' when no steering", () => {
      const outfit: Outfit = {
        name: "Thruster Only",
        slug: "thruster-only",
        attributes: {
          thrust: 100,
        },
        descriptions: [],
      };
      const ship = createShip({}, [outfit]);
      expect(ship.getMovementProblems()).toContain("no steering!");
    });

    it("should return both problems when neither present", () => {
      const ship = createShip();
      const problems = ship.getMovementProblems();
      expect(problems).toContain("no thruster!");
      expect(problems).toContain("no steering!");
      expect(problems).toHaveLength(2);
    });
  });

  describe("getOutfittedMass", () => {
    it("should return undefined when base mass is undefined", () => {
      const ship = createShip({
        attributes: {
          ...TEST_SHIP_BASE.attributes,
          mass: undefined,
        },
      });
      expect(ship.getOutfittedMass()).toBeUndefined();
    });

    it("should return base mass when no outfits", () => {
      const ship = createShip();
      expect(ship.getOutfittedMass()).toBe(200);
    });

    it("should add outfit mass to base mass", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD]);
      expect(ship.getOutfittedMass()).toBe(210); // 200 + 10
    });

    it("should add multiple outfit masses", () => {
      const ship = createShip({}, [TEST_OUTFIT_SHIELD, TEST_OUTFIT_THRUSTER]);
      expect(ship.getOutfittedMass()).toBe(215); // 200 + 10 + 5
    });

    it("should handle outfits without mass", () => {
      const outfit: Outfit = {
        name: "No Mass Outfit",
        slug: "no-mass-outfit",
        attributes: {},
        descriptions: [],
      };
      const ship = createShip({}, [outfit]);
      expect(ship.getOutfittedMass()).toBe(200); // Base mass only
    });
  });

  describe("immutability", () => {
    it("should not mutate original when adding outfit", () => {
      const ship1 = createShip();
      const ship2 = ship1.addOutfit(TEST_OUTFIT_SHIELD);
      expect(ship1.getOutfits()).toHaveLength(0);
      expect(ship2.getOutfits()).toHaveLength(1);
    });

    it("should not mutate original when removing outfit", () => {
      const ship1 = createShip({}, [TEST_OUTFIT_SHIELD]);
      const ship2 = ship1.removeOutfit("Shield Generator");
      expect(ship1.getOutfits()).toHaveLength(1);
      expect(ship2.getOutfits()).toHaveLength(0);
    });

    it("should create new cache when outfits change", () => {
      const ship1 = createShip({}, [TEST_OUTFIT_SHIELD]);
      const attrs1 = ship1.outfittedAttributes;
      const ship2 = ship1.addOutfit(TEST_OUTFIT_SHIELD);
      const attrs2 = ship2.outfittedAttributes;
      expect(attrs1).not.toBe(attrs2);
      expect(attrs1.shields).toBe(75);
      expect(attrs2.shields).toBe(100);
    });
  });

  describe("getOutfitSpace", () => {
    it("should return undefined when base outfit space is undefined", () => {
      const ship = createShip({
        attributes: {
          ...TEST_SHIP_BASE.attributes,
          "outfit space": undefined,
        },
      });
      expect(ship.getOutfitSpace()).toBeUndefined();
    });

    it("should return total and free when no outfits", () => {
      const ship = createShip({
        attributes: {
          ...TEST_SHIP_BASE.attributes,
          "outfit space": 560,
        },
      });
      const space = ship.getOutfitSpace();
      expect(space).toEqual({ total: 560, free: 560 });
    });

    it("should subtract space used by outfits with negative outfit space", () => {
      const outfit: Outfit = {
        name: "Space User",
        slug: "space-user",
        "outfit space": -10, // Uses 10 space
        attributes: {},
        descriptions: [],
      };
      const ship = createShip(
        {
          attributes: {
            ...TEST_SHIP_BASE.attributes,
            "outfit space": 560,
          },
        },
        [outfit]
      );
      const space = ship.getOutfitSpace();
      expect(space).toEqual({ total: 560, free: 550 }); // 560 - (-10) = 570, wait no
      // If outfitSpace is -10, and we do freeSpace -= outfitSpace, that's freeSpace -= (-10) = freeSpace + 10
      // So 560 - (-10) = 560 + 10 = 570... but that's wrong
      // Actually, the logic says: if spaceUsed < 0, chassisOutfitSpace -= spaceUsed
      // So if spaceUsed = -10, we do chassisOutfitSpace -= (-10) = chassisOutfitSpace + 10
      // That means 560 + 10 = 570... but that doesn't make sense
      // Let me re-read the code...
      // Oh wait, I think the issue is in my implementation. Let me check the Endless Sky logic again.
      // The code says: if(spaceUsed < 0) { chassisOutfitSpace -= spaceUsed; }
      // If spaceUsed = -10, then chassisOutfitSpace -= (-10) = chassisOutfitSpace + 10
      // So if base is 560 and outfit uses -10, free = 560 + 10 = 570... that's wrong
      // I think the logic should be: if spaceUsed < 0, then chassisOutfitSpace += spaceUsed (which subtracts)
      // Or: chassisOutfitSpace -= abs(spaceUsed)
      // Actually, re-reading: "if(spaceUsed < 0) { chassisOutfitSpace -= spaceUsed; }"
      // If spaceUsed = -10, then chassisOutfitSpace -= (-10) = chassisOutfitSpace + 10
      // This means negative values ADD space, which doesn't make sense
      // Let me check if I misunderstood the logic...
      // Actually, I think the issue is that in Endless Sky, negative outfit space means it USES space
      // So if an outfit has -10 outfit space, it uses 10 space
      // The calculation should be: free = total - abs(spaceUsed) when spaceUsed < 0
      // Or: free = total + spaceUsed when spaceUsed < 0 (since spaceUsed is already negative)
      // So: free = 560 + (-10) = 550, which makes sense!
      // So my implementation is wrong. Let me fix it.
      expect(space).toEqual({ total: 560, free: 550 });
    });

    it("should add space from outfits with positive outfit space", () => {
      const outfit: Outfit = {
        name: "Space Adder",
        slug: "space-adder",
        "outfit space": 20, // Adds 20 space
        attributes: {},
        descriptions: [],
      };
      const ship = createShip(
        {
          attributes: {
            ...TEST_SHIP_BASE.attributes,
            "outfit space": 560,
          },
        },
        [outfit]
      );
      const space = ship.getOutfitSpace();
      expect(space).toEqual({ total: 560, free: 580 }); // 560 + 20
    });

    it("should handle multiple outfits", () => {
      const outfit1: Outfit = {
        name: "Space User 1",
        slug: "space-user-1",
        "outfit space": -10,
        attributes: {},
        descriptions: [],
      };
      const outfit2: Outfit = {
        name: "Space User 2",
        slug: "space-user-2",
        "outfit space": -5,
        attributes: {},
        descriptions: [],
      };
      const ship = createShip(
        {
          attributes: {
            ...TEST_SHIP_BASE.attributes,
            "outfit space": 560,
          },
        },
        [outfit1, outfit2]
      );
      const space = ship.getOutfitSpace();
      // free = 560 + (-10) + (-5) = 560 - 15 = 545
      expect(space).toEqual({ total: 560, free: 545 });
    });
  });

  describe("getWeaponCapacity", () => {
    it("should return undefined when base weapon capacity is undefined", () => {
      const ship = createShip();
      expect(ship.getWeaponCapacity()).toBeUndefined();
    });

    it("should subtract capacity used by outfits", () => {
      const outfit: Outfit = {
        name: "Weapon User",
        slug: "weapon-user",
        attributes: {
          "weapon capacity": -5, // Uses 5 capacity (negative means uses)
        },
        descriptions: [],
      };
      const ship = createShip(
        {
          attributes: {
            ...TEST_SHIP_BASE.attributes,
            "weapon capacity": 100,
          },
        },
        [outfit]
      );
      const capacity = ship.getWeaponCapacity();
      // Total is base capacity (100)
      // Free = base (100) + outfit usage (-5) = 95
      expect(capacity).toEqual({ total: 100, free: 95 });
    });
  });

  describe("getEngineCapacity", () => {
    it("should return undefined when base engine capacity is undefined", () => {
      const ship = createShip();
      expect(ship.getEngineCapacity()).toBeUndefined();
    });

    it("should subtract capacity used by outfits", () => {
      const outfit: Outfit = {
        name: "Engine User",
        slug: "engine-user",
        attributes: {
          "engine capacity": -3, // Uses 3 capacity (negative means uses)
        },
        descriptions: [],
      };
      const ship = createShip(
        {
          attributes: {
            ...TEST_SHIP_BASE.attributes,
            "engine capacity": 50,
          },
        },
        [outfit]
      );
      const capacity = ship.getEngineCapacity();
      // Total is base capacity (50)
      // Free = base (50) + outfit usage (-3) = 47
      expect(capacity).toEqual({ total: 50, free: 47 });
    });
  });
});
