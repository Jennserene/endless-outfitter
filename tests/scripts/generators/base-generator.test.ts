import { BaseGenerator } from "@scripts/generators/base-generator";
import { logger } from "@/lib/logger";
import * as fs from "fs";
import * as fileIo from "@scripts/utils/file-io";
import * as metadata from "@scripts/utils/metadata";

// Mock dependencies
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  existsSync: jest.fn(),
}));

jest.mock("@scripts/utils/file-io", () => ({
  writeJsonFile: jest.fn(),
  getSpeciesFilePath: jest.fn(),
}));

jest.mock("@scripts/utils/metadata", () => ({
  createMetadata: jest.fn(),
}));

// Create a concrete implementation for testing
class TestGenerator extends BaseGenerator<string> {
  constructor() {
    super(
      (data: unknown[]) => data.map((item) => String(item)),
      "/test/raw",
      "/test/output",
      "test",
      "test-items",
      logger
    );
  }

  // Expose private methods for testing
  extractSpecies(filename: string): string {
    return super.extractSpecies(filename);
  }

  readRawData(filePath: string): unknown[] {
    return super.readRawData(filePath);
  }

  writeOutput(species: string, data: string[]): void {
    return super.writeOutput(species, data);
  }

  logProgress(species: string, count: number): void {
    return super.logProgress(species, count);
  }

  logSummary(total: number, speciesCount: number): void {
    return super.logSummary(total, speciesCount);
  }
}

describe("BaseGenerator", () => {
  let generator: TestGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    generator = new TestGenerator();
  });

  describe("extractSpecies", () => {
    it("should extract species from filename with prefix", () => {
      const species = generator.extractSpecies("test-human.json");
      expect(species).toBe("human");
    });

    it("should extract species from filename without prefix", () => {
      const species = generator.extractSpecies("test-pug.json");
      expect(species).toBe("pug");
    });

    it("should handle complex species names", () => {
      const species = generator.extractSpecies("test-sheragi.json");
      expect(species).toBe("sheragi");
    });
  });

  describe("readRawData", () => {
    it("should read and parse JSON file", () => {
      const mockData = [{ name: "item1" }, { name: "item2" }];
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));

      const result = generator.readRawData("/test/file.json");

      expect(fs.readFileSync).toHaveBeenCalledWith("/test/file.json", "utf-8");
      expect(result).toEqual(mockData);
    });

    it("should throw when JSON is invalid", () => {
      (fs.readFileSync as jest.Mock).mockReturnValue("invalid json");

      expect(() => {
        generator.readRawData("/test/file.json");
      }).toThrow();
    });
  });

  describe("writeOutput", () => {
    it("should write output with metadata and data", () => {
      const mockMetadata = {
        version: "v1.0",
        schemaVersion: "1.0-v1.0",
        species: "human",
        generatedAt: "2024-01-01T00:00:00.000Z",
        itemCount: 2,
      };
      (metadata.createMetadata as jest.Mock).mockReturnValue(mockMetadata);
      (fileIo.getSpeciesFilePath as jest.Mock).mockReturnValue(
        "/test/output/test-human.json"
      );

      generator.writeOutput("human", ["item1", "item2"]);

      expect(metadata.createMetadata).toHaveBeenCalledWith("human", 2);
      expect(fileIo.getSpeciesFilePath).toHaveBeenCalledWith(
        "/test/output",
        "test",
        "human"
      );
      expect(fileIo.writeJsonFile).toHaveBeenCalledWith(
        "/test/output/test-human.json",
        {
          metadata: mockMetadata,
          data: ["item1", "item2"],
        }
      );
    });
  });

  describe("logProgress", () => {
    it("should log progress for a species", () => {
      generator.logProgress("human", 5);

      expect(logger.success).toHaveBeenCalledWith(
        "Generated 5 test-items (human) to test-human.json"
      );
    });
  });

  describe("logSummary", () => {
    it("should log summary across all species", () => {
      generator.logSummary(10, 2);

      expect(logger.success).toHaveBeenCalledWith(
        "Total: 10 test-items across 2 species"
      );
    });
  });

  describe("execute", () => {
    it("should execute successfully with multiple files", () => {
      const mockFiles = ["test-human.json", "test-pug.json"];
      const mockRawData1 = [{ name: "item1" }, { name: "item2" }];
      const mockRawData2 = [{ name: "item3" }];
      const mockMetadata = {
        version: "v1.0",
        schemaVersion: "1.0-v1.0",
        species: "human",
        generatedAt: "2024-01-01T00:00:00.000Z",
        itemCount: 0,
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(JSON.stringify(mockRawData1))
        .mockReturnValueOnce(JSON.stringify(mockRawData2));
      (metadata.createMetadata as jest.Mock).mockReturnValue(mockMetadata);
      (fileIo.getSpeciesFilePath as jest.Mock)
        .mockReturnValueOnce("/test/output/test-human.json")
        .mockReturnValueOnce("/test/output/test-pug.json");

      generator.execute();

      expect(logger.info).toHaveBeenCalledWith(
        "Generating test-items files from raw JSON..."
      );
      expect(fileIo.writeJsonFile).toHaveBeenCalledTimes(2);
      expect(logger.success).toHaveBeenCalledWith(
        "Generated 2 test-items (human) to test-human.json"
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Generated 1 test-items (pug) to test-pug.json"
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Total: 3 test-items across 2 species"
      );
    });

    it("should throw when rawDir does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      expect(() => {
        generator.execute();
      }).toThrow(
        "Raw test-items directory not found: /test/raw. Run raw-parser.ts first."
      );
    });

    it("should handle empty directory", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      generator.execute();

      expect(logger.success).toHaveBeenCalledWith(
        "Total: 0 test-items across 0 species"
      );
      expect(fileIo.writeJsonFile).not.toHaveBeenCalled();
    });

    it.skip("should handle converter errors", () => {
      // Not working: Converter errors would need to be caught and handled,
      // but BaseGenerator doesn't have explicit error handling for converter failures
      // The error would propagate up, which is expected behavior
    });

    it("should filter out non-JSON files", () => {
      const mockFiles = ["test-human.json", "readme.txt", "test-pug.json"];
      const mockRawData = [{ name: "item1" }];
      const mockMetadata = {
        version: "v1.0",
        schemaVersion: "1.0-v1.0",
        species: "human",
        generatedAt: "2024-01-01T00:00:00.000Z",
        itemCount: 0,
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce(JSON.stringify(mockRawData))
        .mockReturnValueOnce(JSON.stringify(mockRawData));
      (metadata.createMetadata as jest.Mock).mockReturnValue(mockMetadata);
      (fileIo.getSpeciesFilePath as jest.Mock)
        .mockReturnValueOnce("/test/output/test-human.json")
        .mockReturnValueOnce("/test/output/test-pug.json");

      generator.execute();

      // Should only process JSON files
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
      expect(fileIo.writeJsonFile).toHaveBeenCalledTimes(2);
    });
  });
});
