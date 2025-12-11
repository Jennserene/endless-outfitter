import { createPipelineConfig } from "@scripts/config/pipeline-config";
import { GAME_VERSION, GAME_REPO_PATH } from "@config/game-version";
import { DATA_SCHEMA_FORMAT_VERSION } from "@config/data-schema-version";
import {
  DATA_DIR,
  SHIPS_DIR,
  OUTFITS_DIR,
  RAW_DATA_DIR,
  RAW_SHIP_DIR,
  RAW_OUTFIT_DIR,
  GameDataPaths,
} from "@scripts/utils/paths";
import { join } from "path";

// Mock config
jest.mock("@config/game-version", () => ({
  GAME_VERSION: "v0.10.16",
  GAME_REPO_PATH: "vendor/endless-sky",
}));

jest.mock("@config/data-schema-version", () => ({
  DATA_SCHEMA_FORMAT_VERSION: "1.0",
}));

describe("pipeline-config", () => {
  describe("createPipelineConfig", () => {
    it("When creating pipeline config, Then should include all required properties", () => {
      // Act
      const config = createPipelineConfig();

      // Assert
      expect(config).toHaveProperty("gameVersion");
      expect(config).toHaveProperty("gameRepoPath");
      expect(config).toHaveProperty("schemaVersion");
      expect(config).toHaveProperty("filePatterns");
      expect(config).toHaveProperty("paths");
    });

    it("When creating pipeline config, Then should set gameVersion from config", () => {
      // Act
      const config = createPipelineConfig();

      // Assert
      expect(config.gameVersion).toBe(GAME_VERSION);
    });

    it("When creating pipeline config, Then should set gameRepoPath from config", () => {
      // Act
      const config = createPipelineConfig();

      // Assert
      expect(config.gameRepoPath).toBe(GAME_REPO_PATH);
    });

    it("When creating pipeline config, Then should set schemaVersion from config", () => {
      // Act
      const config = createPipelineConfig();

      // Assert
      expect(config.schemaVersion).toBe(DATA_SCHEMA_FORMAT_VERSION);
    });

    it("When creating pipeline config, Then should set filePatterns from GameDataPaths", () => {
      // Act
      const config = createPipelineConfig();

      // Assert
      expect(config.filePatterns.ships).toEqual(GameDataPaths.SHIPS);
      expect(config.filePatterns.outfits).toEqual(GameDataPaths.OUTFITS);
    });

    it("When creating pipeline config, Then should set all path values correctly", () => {
      // Act
      const config = createPipelineConfig();

      // Assert
      expect(config.paths.dataDir).toBe(DATA_DIR);
      expect(config.paths.shipsDir).toBe(SHIPS_DIR);
      expect(config.paths.outfitsDir).toBe(OUTFITS_DIR);
      expect(config.paths.rawDataDir).toBe(RAW_DATA_DIR);
      expect(config.paths.rawShipsDir).toBe(RAW_SHIP_DIR);
      expect(config.paths.rawOutfitsDir).toBe(RAW_OUTFIT_DIR);
      expect(config.paths.gameDataRoot).toBe(
        join(process.cwd(), GAME_REPO_PATH)
      );
    });
  });
});
