import {
  getGameDataPath,
  DATA_DIR,
  SHIPS_DIR,
  OUTFITS_DIR,
  SEARCH_INDEX_PATH,
  IMAGES_DIR,
  OUTFIT_IMAGES_DIR,
  SHIP_IMAGES_DIR,
  THUMBNAIL_IMAGES_DIR,
  SUBMODULE_PATH,
  RAW_DATA_DIR,
  RAW_SHIP_DIR,
  RAW_OUTFIT_DIR,
  GameDataPaths,
} from "@scripts/utils/paths";
import { join } from "path";
import { GAME_REPO_PATH } from "@config/game-version";

// Mock path module
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

// Mock config
jest.mock("@config/game-version", () => ({
  GAME_REPO_PATH: "submodule/game-data",
}));

describe("paths", () => {
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.cwd = jest.fn(() => originalCwd);
  });

  describe("getGameDataPath", () => {
    it("When relative path is provided, Then should return full path joined with game data root", () => {
      // Arrange
      const relativePath = "ships/ship.txt";

      // Act
      const result = getGameDataPath(relativePath);

      // Assert
      expect(join).toHaveBeenCalledWith(
        expect.stringContaining(GAME_REPO_PATH),
        relativePath
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("When empty string is provided, Then should return game data root path", () => {
      // Arrange
      const relativePath = "";

      // Act
      const result = getGameDataPath(relativePath);

      // Assert
      expect(join).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("When nested path is provided, Then should join correctly", () => {
      // Arrange
      const relativePath = "data/ships/human/ship.txt";

      // Act
      const result = getGameDataPath(relativePath);

      // Assert
      expect(join).toHaveBeenCalledWith(
        expect.stringContaining(GAME_REPO_PATH),
        relativePath
      );
      expect(result).toBeDefined();
    });

    it("When path with special characters is provided, Then should handle correctly", () => {
      // Arrange
      const relativePath = "ships/test-ship_v2.txt";

      // Act
      const result = getGameDataPath(relativePath);

      // Assert
      expect(join).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("path constants", () => {
    it("When DATA_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(DATA_DIR).toBeDefined();
      expect(typeof DATA_DIR).toBe("string");
    });

    it("When SHIPS_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(SHIPS_DIR).toBeDefined();
      expect(typeof SHIPS_DIR).toBe("string");
    });

    it("When OUTFITS_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(OUTFITS_DIR).toBeDefined();
      expect(typeof OUTFITS_DIR).toBe("string");
    });

    it("When SEARCH_INDEX_PATH is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(SEARCH_INDEX_PATH).toBeDefined();
      expect(typeof SEARCH_INDEX_PATH).toBe("string");
    });

    it("When IMAGES_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(IMAGES_DIR).toBeDefined();
      expect(typeof IMAGES_DIR).toBe("string");
    });

    it("When OUTFIT_IMAGES_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(OUTFIT_IMAGES_DIR).toBeDefined();
      expect(typeof OUTFIT_IMAGES_DIR).toBe("string");
    });

    it("When SHIP_IMAGES_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(SHIP_IMAGES_DIR).toBeDefined();
      expect(typeof SHIP_IMAGES_DIR).toBe("string");
    });

    it("When THUMBNAIL_IMAGES_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(THUMBNAIL_IMAGES_DIR).toBeDefined();
      expect(typeof THUMBNAIL_IMAGES_DIR).toBe("string");
    });

    it("When SUBMODULE_PATH is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(SUBMODULE_PATH).toBeDefined();
      expect(typeof SUBMODULE_PATH).toBe("string");
    });

    it("When RAW_DATA_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(RAW_DATA_DIR).toBeDefined();
      expect(typeof RAW_DATA_DIR).toBe("string");
    });

    it("When RAW_SHIP_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(RAW_SHIP_DIR).toBeDefined();
      expect(typeof RAW_SHIP_DIR).toBe("string");
    });

    it("When RAW_OUTFIT_DIR is accessed, Then should be defined and be a string", () => {
      // Assert
      expect(RAW_OUTFIT_DIR).toBeDefined();
      expect(typeof RAW_OUTFIT_DIR).toBe("string");
    });
  });

  describe("GameDataPaths", () => {
    it("When GameDataPaths.SHIPS is accessed, Then should contain expected file names", () => {
      // Assert
      expect(GameDataPaths.SHIPS).toBeDefined();
      expect(Array.isArray(GameDataPaths.SHIPS)).toBe(true);
      expect(GameDataPaths.SHIPS).toContain("ships.txt");
      expect(GameDataPaths.SHIPS).toContain("kestrel.txt");
      expect(GameDataPaths.SHIPS).toContain("marauders.txt");
      expect(GameDataPaths.SHIPS).toContain("variants.txt");
    });

    it("When GameDataPaths.OUTFITS is accessed, Then should contain expected file names", () => {
      // Assert
      expect(GameDataPaths.OUTFITS).toBeDefined();
      expect(Array.isArray(GameDataPaths.OUTFITS)).toBe(true);
      expect(GameDataPaths.OUTFITS).toContain("outfits.txt");
      expect(GameDataPaths.OUTFITS).toContain("engines.txt");
      expect(GameDataPaths.OUTFITS).toContain("power.txt");
      expect(GameDataPaths.OUTFITS).toContain("weapons.txt");
    });

    it("When GameDataPaths is accessed, Then should be defined as const", () => {
      // Assert
      // GameDataPaths is defined with 'as const' which makes it readonly at the type level
      expect(GameDataPaths).toBeDefined();
      expect(typeof GameDataPaths).toBe("object");
    });
  });
});
