/**
 * @jest-environment node
 */

import {
  getOutfitByName,
  loadOutfitsByName,
  loadOutfitsFromShipOutfits,
} from "@/lib/utils/outfit-loader";
import type { Outfit } from "@/lib/schemas/outfit";

// Mock game-data module
jest.mock("@/lib/game-data", () => ({
  getOutfits: jest.fn(),
}));

import { getOutfits } from "@/lib/game-data";

const mockGetOutfits = getOutfits as jest.MockedFunction<typeof getOutfits>;

// Test constants
const TEST_OUTFIT_1: Outfit = {
  name: "Basic Thruster",
  slug: "basic-thruster",
  attributes: {
    thrust: 100,
  },
  descriptions: [],
};

const TEST_OUTFIT_2: Outfit = {
  name: "Shield Generator",
  slug: "shield-generator",
  attributes: {
    shields: 25,
  },
  descriptions: [],
};

const TEST_OUTFIT_3: Outfit = {
  name: "Steering",
  slug: "steering",
  attributes: {
    turn: 50,
  },
  descriptions: [],
};

describe("outfit-loader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOutfitByName", () => {
    it("should return outfit when found", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1, TEST_OUTFIT_2]);
      const result = getOutfitByName("Basic Thruster");
      expect(result).toEqual(TEST_OUTFIT_1);
    });

    it("should return undefined when not found", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1, TEST_OUTFIT_2]);
      const result = getOutfitByName("Non-existent");
      expect(result).toBeUndefined();
    });

    it("should handle empty outfits array", () => {
      mockGetOutfits.mockReturnValue([]);
      const result = getOutfitByName("Basic Thruster");
      expect(result).toBeUndefined();
    });

    it("should be case-sensitive", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = getOutfitByName("basic thruster");
      expect(result).toBeUndefined();
    });
  });

  describe("loadOutfitsByName", () => {
    it("should return all outfits when all found", () => {
      mockGetOutfits.mockReturnValue([
        TEST_OUTFIT_1,
        TEST_OUTFIT_2,
        TEST_OUTFIT_3,
      ]);
      const result = loadOutfitsByName(["Basic Thruster", "Shield Generator"]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
      expect(result[1]).toEqual(TEST_OUTFIT_2);
    });

    it("should return only found outfits when some missing", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1, TEST_OUTFIT_2]);
      const result = loadOutfitsByName([
        "Basic Thruster",
        "Non-existent",
        "Shield Generator",
      ]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
      expect(result[1]).toEqual(TEST_OUTFIT_2);
    });

    it("should return empty array when none found", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = loadOutfitsByName(["Non-existent 1", "Non-existent 2"]);
      expect(result).toHaveLength(0);
    });

    it("should handle empty names array", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = loadOutfitsByName([]);
      expect(result).toHaveLength(0);
    });

    it("should preserve order of names array", () => {
      mockGetOutfits.mockReturnValue([
        TEST_OUTFIT_1,
        TEST_OUTFIT_2,
        TEST_OUTFIT_3,
      ]);
      const result = loadOutfitsByName(["Shield Generator", "Basic Thruster"]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(TEST_OUTFIT_2);
      expect(result[1]).toEqual(TEST_OUTFIT_1);
    });
  });

  describe("loadOutfitsFromShipOutfits", () => {
    it("should load outfits with quantity 1", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1, TEST_OUTFIT_2]);
      const result = loadOutfitsFromShipOutfits([
        { name: "Basic Thruster", quantity: 1 },
        { name: "Shield Generator", quantity: 1 },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
      expect(result[1]).toEqual(TEST_OUTFIT_2);
    });

    it("should load multiple instances for quantity > 1", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = loadOutfitsFromShipOutfits([
        { name: "Basic Thruster", quantity: 3 },
      ]);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
      expect(result[1]).toEqual(TEST_OUTFIT_1);
      expect(result[2]).toEqual(TEST_OUTFIT_1);
    });

    it("should use default quantity of 1 when not specified", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = loadOutfitsFromShipOutfits([{ name: "Basic Thruster" }]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
    });

    it("should skip outfits not found", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = loadOutfitsFromShipOutfits([
        { name: "Basic Thruster", quantity: 1 },
        { name: "Non-existent", quantity: 2 },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
    });

    it("should handle empty array", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1]);
      const result = loadOutfitsFromShipOutfits([]);
      expect(result).toHaveLength(0);
    });

    it("should handle mixed quantities", () => {
      mockGetOutfits.mockReturnValue([TEST_OUTFIT_1, TEST_OUTFIT_2]);
      const result = loadOutfitsFromShipOutfits([
        { name: "Basic Thruster", quantity: 2 },
        { name: "Shield Generator", quantity: 1 },
      ]);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(TEST_OUTFIT_1);
      expect(result[1]).toEqual(TEST_OUTFIT_1);
      expect(result[2]).toEqual(TEST_OUTFIT_2);
    });
  });
});
