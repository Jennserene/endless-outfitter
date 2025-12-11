import { MetadataService } from "@scripts/services/metadata-service";
import { createMockPipelineConfig } from "../__fixtures__/config";

describe("MetadataService", () => {
  const mockConfig = createMockPipelineConfig();

  describe("createMetadata", () => {
    it("should create metadata with correct structure", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("human", 5);

      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("schemaVersion");
      expect(result).toHaveProperty("species");
      expect(result).toHaveProperty("generatedAt");
      expect(result).toHaveProperty("itemCount");
    });

    it("should set version from config", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("human", 5);

      expect(result.version).toBe(mockConfig.gameVersion);
    });

    it("should set schemaVersion as combination", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("human", 5);

      expect(result.schemaVersion).toBe(
        `${mockConfig.schemaVersion}-${mockConfig.gameVersion}`
      );
    });

    it("should set species correctly", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("pug", 10);

      expect(result.species).toBe("pug");
    });

    it("should set itemCount correctly", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("human", 42);

      expect(result.itemCount).toBe(42);
    });

    it("should set generatedAt as ISO string", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("human", 5);

      expect(result.generatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it("should handle zero item count", () => {
      const service = new MetadataService(mockConfig);
      const result = service.createMetadata("human", 0);

      expect(result.itemCount).toBe(0);
    });
  });
});
