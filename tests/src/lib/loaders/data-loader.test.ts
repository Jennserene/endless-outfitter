/**
 * @jest-environment node
 */

/**
 * Tests for src/lib/loaders/data-loader.ts
 * Tests data loading functions for ships and outfits
 */

// Mock fs module before any imports
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  existsSync: jest.fn(),
}));

import { readFileSync, readdirSync, existsSync } from "fs";
import {
  loadShips,
  loadOutfits,
  getShipsMetadata,
  getOutfitsMetadata,
} from "@/lib/loaders/data-loader";

// Get mocked functions
const mockReadFileSync = readFileSync as jest.MockedFunction<
  typeof readFileSync
>;
const mockReaddirSync = readdirSync as jest.MockedFunction<
  typeof readdirSync
> & {
  mockReturnValue: (value: string[]) => jest.Mock<string[], [string]>;
};
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

// Test constants
const TEST_METADATA = {
  version: "v0.10.16",
  schemaVersion: "1-v0.10.16",
  species: "human",
  generatedAt: "2025-12-12T16:01:44.881Z",
  itemCount: 2,
};

const TEST_METADATA_KAHET = {
  version: "v0.10.16",
  schemaVersion: "1-v0.10.16",
  species: "kahet",
  generatedAt: "2025-12-12T16:01:44.881Z",
  itemCount: 1,
};

function createShipDataFile(ships: unknown[], metadata = TEST_METADATA) {
  return {
    metadata,
    data: ships,
  };
}

function createOutfitDataFile(outfits: unknown[], metadata = TEST_METADATA) {
  return {
    metadata,
    data: outfits,
  };
}

function createValidShip() {
  return {
    name: "Test Ship",
    slug: "test-ship",
    attributes: {
      category: "ship",
      hull: 100,
    },
    outfits: [],
    descriptions: [],
  };
}

function createValidOutfit() {
  return {
    name: "Test Outfit",
    slug: "test-outfit",
    attributes: {},
    descriptions: [],
  };
}

describe("data-loader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadShips", () => {
    it("should load and return ships from multiple JSON files", () => {
      const ship1 = createValidShip();
      const ship2 = { ...createValidShip(), name: "Ship 2", slug: "ship-2" };
      const ship3 = { ...createValidShip(), name: "Ship 3", slug: "ship-3" };

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(["ships-human.json", "ships-kahet.json"]);
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(createShipDataFile([ship1, ship2])))
        .mockReturnValueOnce(JSON.stringify(createShipDataFile([ship3])));

      const result = loadShips();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Test Ship");
      expect(result[1].name).toBe("Ship 2");
      expect(result[2].name).toBe("Ship 3");
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining("ships")
      );
      expect(mockReaddirSync).toHaveBeenCalledWith(
        expect.stringContaining("ships")
      );
    });

    it("should filter out non-JSON files", () => {
      const ship1 = createValidShip();

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
        "readme.txt",
        "ships-kahet.json",
        ".gitkeep",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(createShipDataFile([ship1])))
        .mockReturnValueOnce(JSON.stringify(createShipDataFile([ship1])));

      const result = loadShips();

      expect(result).toHaveLength(2);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it("should throw error when ships directory does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => loadShips()).toThrow("Ships directory not found");
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockReaddirSync).not.toHaveBeenCalled();
    });

    it("should throw error when no JSON files found", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "readme.txt",
        ".gitkeep",
      ] as unknown as string[]);

      expect(() => loadShips()).toThrow("No ships data files found");
      expect(mockReaddirSync).toHaveBeenCalled();
    });

    it("should throw error when directory is empty", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as unknown as string[]);

      expect(() => loadShips()).toThrow("No ships data files found");
    });

    it("should throw error when JSON file is invalid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue("invalid json {");

      expect(() => loadShips()).toThrow("Failed to parse ships-human.json");
    });

    it("should throw error when ship data fails validation", () => {
      const invalidShip = { name: "Invalid" }; // Missing required fields

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue(
        JSON.stringify(createShipDataFile([invalidShip]))
      );

      expect(() => loadShips()).toThrow("Failed to validate ships-human.json");
    });

    it("should throw error when all files have empty data arrays", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(["ships-human.json", "ships-kahet.json"]);
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(createShipDataFile([])))
        .mockReturnValueOnce(JSON.stringify(createShipDataFile([])));

      expect(() => loadShips()).toThrow("No valid ships data found");
    });

    it("should handle multiple files with different species", () => {
      const humanShip = createValidShip();
      const kahetShip = {
        ...createValidShip(),
        name: "Kahet Ship",
        slug: "kahet-ship",
      };

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(["ships-human.json", "ships-kahet.json"]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(createShipDataFile([humanShip], TEST_METADATA))
        )
        .mockReturnValueOnce(
          JSON.stringify(createShipDataFile([kahetShip], TEST_METADATA_KAHET))
        );

      const result = loadShips();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Test Ship");
      expect(result[1].name).toBe("Kahet Ship");
    });

    it("should handle Error instances and rethrow them", () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error("Custom error");
      });

      expect(() => loadShips()).toThrow("Custom error");
    });

    it("should handle non-Error exceptions", () => {
      mockExistsSync.mockImplementation(() => {
        throw "String error";
      });

      expect(() => loadShips()).toThrow("Failed to load ships: String error");
    });

    it("should rethrow unexpected error types from JSON parsing", () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockImplementation(() => {
        throw new CustomError("Unexpected error");
      });

      expect(() => loadShips()).toThrow("Unexpected error");
    });
  });

  describe("loadOutfits", () => {
    it("should load and return outfits from multiple JSON files", () => {
      const outfit1 = createValidOutfit();
      const outfit2 = {
        ...createValidOutfit(),
        name: "Outfit 2",
        slug: "outfit-2",
      };
      const outfit3 = {
        ...createValidOutfit(),
        name: "Outfit 3",
        slug: "outfit-3",
      };

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
        "outfits-kahet.json",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(createOutfitDataFile([outfit1, outfit2]))
        )
        .mockReturnValueOnce(JSON.stringify(createOutfitDataFile([outfit3])));

      const result = loadOutfits();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Test Outfit");
      expect(result[1].name).toBe("Outfit 2");
      expect(result[2].name).toBe("Outfit 3");
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining("outfits")
      );
      expect(mockReaddirSync).toHaveBeenCalledWith(
        expect.stringContaining("outfits")
      );
    });

    it("should filter out non-JSON files", () => {
      const outfit1 = createValidOutfit();

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
        "readme.txt",
        "outfits-kahet.json",
        ".gitkeep",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(createOutfitDataFile([outfit1])))
        .mockReturnValueOnce(JSON.stringify(createOutfitDataFile([outfit1])));

      const result = loadOutfits();

      expect(result).toHaveLength(2);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it("should throw error when outfits directory does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => loadOutfits()).toThrow("Outfits directory not found");
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockReaddirSync).not.toHaveBeenCalled();
    });

    it("should throw error when no JSON files found", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "readme.txt",
        ".gitkeep",
      ] as unknown as string[]);

      expect(() => loadOutfits()).toThrow("No outfits data files found");
      expect(mockReaddirSync).toHaveBeenCalled();
    });

    it("should throw error when directory is empty", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([] as unknown as string[]);

      expect(() => loadOutfits()).toThrow("No outfits data files found");
    });

    it("should throw error when JSON file is invalid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue("invalid json {");

      expect(() => loadOutfits()).toThrow("Failed to parse outfits-human.json");
    });

    it("should throw error when outfit data fails validation", () => {
      const invalidOutfit = { name: "Invalid" }; // Missing required fields

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue(
        JSON.stringify(createOutfitDataFile([invalidOutfit]))
      );

      expect(() => loadOutfits()).toThrow(
        "Failed to validate outfits-human.json"
      );
    });

    it("should throw error when all files have empty data arrays", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
        "outfits-kahet.json",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(createOutfitDataFile([])))
        .mockReturnValueOnce(JSON.stringify(createOutfitDataFile([])));

      expect(() => loadOutfits()).toThrow("No valid outfits data found");
    });

    it("should handle multiple files with different species", () => {
      const humanOutfit = createValidOutfit();
      const kahetOutfit = {
        ...createValidOutfit(),
        name: "Kahet Outfit",
        slug: "kahet-outfit",
      };

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
        "outfits-kahet.json",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(createOutfitDataFile([humanOutfit], TEST_METADATA))
        )
        .mockReturnValueOnce(
          JSON.stringify(
            createOutfitDataFile([kahetOutfit], TEST_METADATA_KAHET)
          )
        );

      const result = loadOutfits();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Test Outfit");
      expect(result[1].name).toBe("Kahet Outfit");
    });

    it("should handle Error instances and rethrow them", () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error("Custom error");
      });

      expect(() => loadOutfits()).toThrow("Custom error");
    });

    it("should handle non-Error exceptions", () => {
      mockExistsSync.mockImplementation(() => {
        throw "String error";
      });

      expect(() => loadOutfits()).toThrow(
        "Failed to load outfits: String error"
      );
    });

    it("should rethrow unexpected error types from JSON parsing", () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockImplementation(() => {
        throw new CustomError("Unexpected error");
      });

      expect(() => loadOutfits()).toThrow("Unexpected error");
    });
  });

  describe("getShipsMetadata", () => {
    it("should return metadata from all ships JSON files", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(["ships-human.json", "ships-kahet.json"]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(createShipDataFile([createValidShip()], TEST_METADATA))
        )
        .mockReturnValueOnce(
          JSON.stringify(
            createShipDataFile([createValidShip()], TEST_METADATA_KAHET)
          )
        );

      const result = getShipsMetadata();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(TEST_METADATA);
      expect(result[1]).toEqual(TEST_METADATA_KAHET);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining("ships")
      );
      expect(mockReaddirSync).toHaveBeenCalledWith(
        expect.stringContaining("ships")
      );
    });

    it("should filter out non-JSON files", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
        "readme.txt",
        "ships-kahet.json",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(createShipDataFile([createValidShip()], TEST_METADATA))
        )
        .mockReturnValueOnce(
          JSON.stringify(
            createShipDataFile([createValidShip()], TEST_METADATA_KAHET)
          )
        );

      const result = getShipsMetadata();

      expect(result).toHaveLength(2);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it("should throw error when ships directory does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => getShipsMetadata()).toThrow("Ships directory not found");
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockReaddirSync).not.toHaveBeenCalled();
    });

    it("should return empty array when no JSON files found", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "readme.txt",
        ".gitkeep",
      ] as unknown as string[]);

      const result = getShipsMetadata();

      expect(result).toEqual([]);
    });

    it("should throw error when metadata validation fails", () => {
      const invalidMetadata = { version: "invalid" }; // Missing required fields
      const invalidData = {
        metadata: invalidMetadata,
        data: [createValidShip()],
      };

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue(JSON.stringify(invalidData));

      expect(() => getShipsMetadata()).toThrow("Failed to get ships metadata");
    });

    it("should throw error when JSON file is invalid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "ships-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue("invalid json {");

      expect(() => getShipsMetadata()).toThrow("Failed to get ships metadata");
    });

    it("should handle Error instances and rethrow them", () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error("Custom error");
      });

      expect(() => getShipsMetadata()).toThrow("Failed to get ships metadata");
    });
  });

  describe("getOutfitsMetadata", () => {
    it("should return metadata from all outfits JSON files", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
        "outfits-kahet.json",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(
            createOutfitDataFile([createValidOutfit()], TEST_METADATA)
          )
        )
        .mockReturnValueOnce(
          JSON.stringify(
            createOutfitDataFile([createValidOutfit()], TEST_METADATA_KAHET)
          )
        );

      const result = getOutfitsMetadata();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(TEST_METADATA);
      expect(result[1]).toEqual(TEST_METADATA_KAHET);
      expect(mockExistsSync).toHaveBeenCalledWith(
        expect.stringContaining("outfits")
      );
      expect(mockReaddirSync).toHaveBeenCalledWith(
        expect.stringContaining("outfits")
      );
    });

    it("should filter out non-JSON files", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
        "readme.txt",
        "outfits-kahet.json",
      ]);
      mockReadFileSync
        .mockReturnValueOnce(
          JSON.stringify(
            createOutfitDataFile([createValidOutfit()], TEST_METADATA)
          )
        )
        .mockReturnValueOnce(
          JSON.stringify(
            createOutfitDataFile([createValidOutfit()], TEST_METADATA_KAHET)
          )
        );

      const result = getOutfitsMetadata();

      expect(result).toHaveLength(2);
      expect(mockReadFileSync).toHaveBeenCalledTimes(2);
    });

    it("should throw error when outfits directory does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => getOutfitsMetadata()).toThrow("Outfits directory not found");
      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockReaddirSync).not.toHaveBeenCalled();
    });

    it("should return empty array when no JSON files found", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "readme.txt",
        ".gitkeep",
      ] as unknown as string[]);

      const result = getOutfitsMetadata();

      expect(result).toEqual([]);
    });

    it("should throw error when metadata validation fails", () => {
      const invalidMetadata = { version: "invalid" }; // Missing required fields
      const invalidData = {
        metadata: invalidMetadata,
        data: [createValidOutfit()],
      };

      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue(JSON.stringify(invalidData));

      expect(() => getOutfitsMetadata()).toThrow(
        "Failed to get outfits metadata"
      );
    });

    it("should throw error when JSON file is invalid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        "outfits-human.json",
      ] as unknown as string[]);
      mockReadFileSync.mockReturnValue("invalid json {");

      expect(() => getOutfitsMetadata()).toThrow(
        "Failed to get outfits metadata"
      );
    });

    it("should handle Error instances and rethrow them", () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error("Custom error");
      });

      expect(() => getOutfitsMetadata()).toThrow(
        "Failed to get outfits metadata"
      );
    });
  });
});
