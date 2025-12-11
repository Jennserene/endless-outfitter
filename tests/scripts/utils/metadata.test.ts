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
    it("When creating metadata, Then should include all required properties", () => {
      // Act
      const result = createMetadata("human", 5);

      // Assert
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("schemaVersion");
      expect(result).toHaveProperty("species");
      expect(result).toHaveProperty("generatedAt");
      expect(result).toHaveProperty("itemCount");
    });

    it("When creating metadata, Then should set version from config", () => {
      // Act
      const result = createMetadata("human", 5);

      // Assert
      expect(result.version).toBe(GAME_VERSION);
    });

    it("When creating metadata, Then should set schemaVersion as combination", () => {
      // Act
      const result = createMetadata("human", 5);

      // Assert
      expect(result.schemaVersion).toBe(
        `${DATA_SCHEMA_FORMAT_VERSION}-${GAME_VERSION}`
      );
    });

    it("When creating metadata with species, Then should set species correctly", () => {
      // Act
      const result = createMetadata("pug", 10);

      // Assert
      expect(result.species).toBe("pug");
    });

    it("When creating metadata with item count, Then should set itemCount correctly", () => {
      // Act
      const result = createMetadata("human", 42);

      // Assert
      expect(result.itemCount).toBe(42);
    });

    it("When creating metadata, Then should set generatedAt as ISO string", () => {
      // Act
      const result = createMetadata("human", 5);

      // Assert
      expect(result.generatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("When item count is zero, Then should handle zero count", () => {
      // Act
      const result = createMetadata("human", 0);

      // Assert
      expect(result.itemCount).toBe(0);
    });

    it("When creating metadata for different species, Then should set species correctly", () => {
      // Act
      const result1 = createMetadata("human", 5);
      const result2 = createMetadata("pug", 5);

      // Assert
      expect(result1.species).toBe("human");
      expect(result2.species).toBe("pug");
    });
  });
});
