import { MetadataService } from "@scripts/services/metadata-service";
import { createMockPipelineConfig } from "../__fixtures__/config";

describe("MetadataService", () => {
  const mockConfig = createMockPipelineConfig();

  describe("createMetadata", () => {
    it("When creating metadata, Then should include all required properties", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("human", 5);

      // Assert
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("schemaVersion");
      expect(result).toHaveProperty("species");
      expect(result).toHaveProperty("generatedAt");
      expect(result).toHaveProperty("itemCount");
    });

    it("When creating metadata, Then should set version from config", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("human", 5);

      // Assert
      expect(result.version).toBe(mockConfig.gameVersion);
    });

    it("When creating metadata, Then should set schemaVersion as combination", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("human", 5);

      // Assert
      expect(result.schemaVersion).toBe(
        `${mockConfig.schemaVersion}-${mockConfig.gameVersion}`
      );
    });

    it("When creating metadata with species, Then should set species correctly", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("pug", 10);

      // Assert
      expect(result.species).toBe("pug");
    });

    it("When creating metadata with item count, Then should set itemCount correctly", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("human", 42);

      // Assert
      expect(result.itemCount).toBe(42);
    });

    it("When creating metadata, Then should set generatedAt as ISO string", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("human", 5);

      // Assert
      expect(result.generatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("When item count is zero, Then should handle zero count", () => {
      // Arrange
      const service = new MetadataService(mockConfig);

      // Act
      const result = service.createMetadata("human", 0);

      // Assert
      expect(result.itemCount).toBe(0);
    });
  });
});
