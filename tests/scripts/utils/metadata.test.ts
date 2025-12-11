import { createMetadata } from "@scripts/utils/metadata";
import { GAME_VERSION } from "@config/game-version";
import { DATA_SCHEMA_FORMAT_VERSION } from "@config/data-schema-version";

// Mock config
jest.mock("@config/game-version", () => ({
  GAME_VERSION: "v0.10.16",
}));

jest.mock("@config/data-schema-version", () => ({
  DATA_SCHEMA_FORMAT_VERSION: "1.0",
}));

describe("metadata", () => {
  describe("createMetadata", () => {
    it("should create metadata with correct structure", () => {
      const result = createMetadata("human", 5);

      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("schemaVersion");
      expect(result).toHaveProperty("species");
      expect(result).toHaveProperty("generatedAt");
      expect(result).toHaveProperty("itemCount");
    });

    it("should set version from config", () => {
      const result = createMetadata("human", 5);
      expect(result.version).toBe(GAME_VERSION);
    });

    it("should set schemaVersion as combination", () => {
      const result = createMetadata("human", 5);
      expect(result.schemaVersion).toBe(
        `${DATA_SCHEMA_FORMAT_VERSION}-${GAME_VERSION}`
      );
    });

    it("should set species correctly", () => {
      const result = createMetadata("pug", 10);
      expect(result.species).toBe("pug");
    });

    it("should set itemCount correctly", () => {
      const result = createMetadata("human", 42);
      expect(result.itemCount).toBe(42);
    });

    it("should set generatedAt as ISO string", () => {
      const result = createMetadata("human", 5);
      expect(result.generatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("should handle zero item count", () => {
      const result = createMetadata("human", 0);
      expect(result.itemCount).toBe(0);
    });

    it("should handle different species", () => {
      const result1 = createMetadata("human", 5);
      const result2 = createMetadata("pug", 5);

      expect(result1.species).toBe("human");
      expect(result2.species).toBe("pug");
    });
  });
});
