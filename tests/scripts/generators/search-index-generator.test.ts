import { SearchIndexGenerator } from "@scripts/generators/search-index-generator";
import { generateSearchIndex } from "@scripts/generators/search-index-generator";
import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import { writeJsonFile } from "@scripts/utils/file-io";
import { SEARCH_INDEX_PATH } from "@scripts/utils/paths";
import { logger } from "@/lib/logger";
import { GAME_VERSION } from "@config/game-version";
import { DATA_SCHEMA_FORMAT_VERSION } from "@config/data-schema-version";
import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";
import type { SearchIndex } from "@scripts/types/search-index";

// Mock dependencies
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("@/lib/loaders/data-loader", () => ({
  loadShips: jest.fn(),
  loadOutfits: jest.fn(),
}));

jest.mock("@scripts/utils/file-io", () => ({
  writeJsonFile: jest.fn(),
}));

jest.mock("@config/game-version", () => ({
  GAME_VERSION: "v0.10.16",
}));

jest.mock("@config/data-schema-version", () => ({
  DATA_SCHEMA_FORMAT_VERSION: "1",
}));

jest.mock("@scripts/utils/paths", () => ({
  SEARCH_INDEX_PATH: "/mock/search-index.json",
}));

describe("SearchIndexGenerator", () => {
  let generator: SearchIndexGenerator;
  const mockShips: Ship[] = [
    {
      name: "Kestrel",
      sprite: "ship/kestrel",
      thumbnail: "thumbnail/kestrel",
      slug: "kestrel",
      attributes: {
        category: "Light Warship",
        cost: 100000,
      },
      outfits: [],
      descriptions: [],
    },
    {
      name: "Heavy Warship",
      sprite: "ship/heavy",
      thumbnail: "thumbnail/heavy",
      slug: "heavy-warship",
      attributes: {
        category: "Heavy Warship",
        cost: 5000000,
      },
      outfits: [],
      descriptions: [],
    },
  ];

  const mockOutfits: Outfit[] = [
    {
      name: "Heavy Laser Turret",
      category: "Weapons",
      cost: 50000,
      slug: "heavy-laser-turret",
      descriptions: [],
      attributes: {},
    },
    {
      name: "R01 Skirmish Battery",
      category: "Weapons",
      cost: 100000,
      slug: "r01-skirmish-battery",
      descriptions: [],
      attributes: {},
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    generator = new SearchIndexGenerator(logger);
    (loadShips as jest.Mock).mockReturnValue(mockShips);
    (loadOutfits as jest.Mock).mockReturnValue(mockOutfits);
  });

  describe("execute", () => {
    it("When generating search index, Then should load ships and outfits", () => {
      // Act
      generator.execute();

      // Assert
      expect(loadShips).toHaveBeenCalledTimes(1);
      expect(loadOutfits).toHaveBeenCalledTimes(1);
    });

    it("When generating search index, Then should write index file", () => {
      // Act
      generator.execute();

      // Assert
      expect(writeJsonFile).toHaveBeenCalledTimes(1);
      expect(writeJsonFile).toHaveBeenCalledWith(
        SEARCH_INDEX_PATH,
        expect.any(Object)
      );
    });

    it("When generating search index, Then should create correct index structure", () => {
      // Act
      generator.execute();

      // Assert
      const callArgs = (writeJsonFile as jest.Mock).mock.calls[0];
      const searchIndex = callArgs[1] as SearchIndex;

      expect(searchIndex).toHaveProperty("metadata");
      expect(searchIndex).toHaveProperty("index");
    });

    it("When generating search index, Then should include correct metadata", () => {
      // Act
      generator.execute();

      // Assert
      const callArgs = (writeJsonFile as jest.Mock).mock.calls[0];
      const searchIndex = callArgs[1] as SearchIndex;

      expect(searchIndex.metadata.version).toBe(GAME_VERSION);
      expect(searchIndex.metadata.schemaVersion).toBe(
        `${DATA_SCHEMA_FORMAT_VERSION}-${GAME_VERSION}`
      );
      expect(searchIndex.metadata.shipCount).toBe(2);
      expect(searchIndex.metadata.outfitCount).toBe(2);
      expect(searchIndex.metadata.totalItems).toBe(4);
      expect(searchIndex.metadata.generatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("When generating search index, Then should index ships by normalized name", () => {
      // Act
      generator.execute();

      // Assert
      const callArgs = (writeJsonFile as jest.Mock).mock.calls[0];
      const searchIndex = callArgs[1] as SearchIndex;

      expect(searchIndex.index["kestrel"]).toBeDefined();
      expect(searchIndex.index["kestrel"][0].name).toBe("Kestrel");
      expect(searchIndex.index["kestrel"][0].type).toBe("ship");
      expect(searchIndex.index["kestrel"][0].slug).toBe("kestrel");
    });

    it("When generating search index, Then should index outfits by normalized name", () => {
      // Act
      generator.execute();

      // Assert
      const callArgs = (writeJsonFile as jest.Mock).mock.calls[0];
      const searchIndex = callArgs[1] as SearchIndex;

      expect(searchIndex.index["heavy laser turret"]).toBeDefined();
      expect(searchIndex.index["heavy laser turret"][0].name).toBe(
        "Heavy Laser Turret"
      );
      expect(searchIndex.index["heavy laser turret"][0].type).toBe("outfit");
      expect(searchIndex.index["heavy laser turret"][0].slug).toBe(
        "heavy-laser-turret"
      );
    });

    it("When generating search index with ship variants, Then should index variants separately", () => {
      // Arrange
      // Ships with variants have different names in the ship data
      const variantShips: Ship[] = [
        {
          name: "Kestrel",
          sprite: "ship/kestrel",
          thumbnail: "thumbnail/kestrel",
          slug: "kestrel",
          attributes: {
            category: "Light Warship",
            cost: 100000,
          },
          outfits: [],
          descriptions: [],
        },
        {
          name: "Kestrel (More Shields)",
          sprite: "ship/kestrels",
          thumbnail: "thumbnail/kestrels",
          slug: "kestrel-more-shields",
          attributes: {
            category: "Light Warship",
            cost: 120000,
          },
          outfits: [],
          descriptions: [],
        },
        {
          name: "Kestrel (More Engines)",
          sprite: "ship/kestrele",
          thumbnail: "thumbnail/kestrele",
          slug: "kestrel-more-engines",
          attributes: {
            category: "Light Warship",
            cost: 110000,
          },
          outfits: [],
          descriptions: [],
        },
      ];
      (loadShips as jest.Mock).mockReturnValue(variantShips);

      // Act
      generator.execute();

      // Assert
      const callArgs = (writeJsonFile as jest.Mock).mock.calls[0];
      const searchIndex = callArgs[1] as SearchIndex;

      // Base variant should be indexed under "kestrel"
      expect(searchIndex.index["kestrel"]).toBeDefined();
      expect(searchIndex.index["kestrel"]).toHaveLength(1);
      expect(searchIndex.index["kestrel"][0].name).toBe("Kestrel");
      expect(searchIndex.index["kestrel"][0].slug).toBe("kestrel");

      // Variants should be indexed separately with their full names
      expect(searchIndex.index["kestrel (more shields)"]).toBeDefined();
      expect(searchIndex.index["kestrel (more shields)"][0].name).toBe(
        "Kestrel (More Shields)"
      );
      expect(searchIndex.index["kestrel (more shields)"][0].slug).toBe(
        "kestrel-more-shields"
      );

      expect(searchIndex.index["kestrel (more engines)"]).toBeDefined();
      expect(searchIndex.index["kestrel (more engines)"][0].name).toBe(
        "Kestrel (More Engines)"
      );
      expect(searchIndex.index["kestrel (more engines)"][0].slug).toBe(
        "kestrel-more-engines"
      );

      // All slugs should be unique
      const allSlugs = [
        searchIndex.index["kestrel"][0].slug,
        searchIndex.index["kestrel (more shields)"][0].slug,
        searchIndex.index["kestrel (more engines)"][0].slug,
      ];
      expect(new Set(allSlugs).size).toBe(allSlugs.length);
    });

    it("When generating search index, Then should log success message", () => {
      // Act
      generator.execute();

      // Assert
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining("Generated search index")
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining("4 items")
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining("2 ships")
      );
      expect(logger.success).toHaveBeenCalledWith(
        expect.stringContaining("2 outfits")
      );
    });

    it("When generating search index with empty data, Then should handle empty arrays", () => {
      // Arrange
      (loadShips as jest.Mock).mockReturnValue([]);
      (loadOutfits as jest.Mock).mockReturnValue([]);

      // Act
      generator.execute();

      // Assert
      const callArgs = (writeJsonFile as jest.Mock).mock.calls[0];
      const searchIndex = callArgs[1] as SearchIndex;

      expect(searchIndex.metadata.shipCount).toBe(0);
      expect(searchIndex.metadata.outfitCount).toBe(0);
      expect(searchIndex.metadata.totalItems).toBe(0);
      expect(Object.keys(searchIndex.index)).toHaveLength(0);
    });
  });

  describe("generateSearchIndex", () => {
    it("When calling generateSearchIndex, Then should create generator and execute", () => {
      // Act
      generateSearchIndex();

      // Assert
      expect(loadShips).toHaveBeenCalledTimes(1);
      expect(loadOutfits).toHaveBeenCalledTimes(1);
      expect(writeJsonFile).toHaveBeenCalledTimes(1);
    });
  });
});
