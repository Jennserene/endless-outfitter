import { DataGenerationPipeline } from "@scripts/pipeline/data-generation-pipeline";
import { logger } from "@/lib/logger";
import * as retrieveRawData from "@scripts/parsers/retrieve-raw-data";
import * as directories from "@scripts/utils/directories";
import * as shipGenerator from "@scripts/generators/ship-generator";
import * as outfitGenerator from "@scripts/generators/outfit-generator";

// Mock dependencies
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@scripts/parsers/retrieve-raw-data", () => ({
  retrieveRawData: jest.fn(),
}));

jest.mock("@scripts/utils/directories", () => ({
  ensureDataDirectories: jest.fn(),
}));

jest.mock("@scripts/generators/ship-generator", () => ({
  generateShips: jest.fn(),
}));

jest.mock("@scripts/generators/outfit-generator", () => ({
  generateOutfits: jest.fn(),
}));

describe("DataGenerationPipeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create steps correctly with default logger", () => {
      const pipeline = new DataGenerationPipeline();
      const steps = pipeline.getSteps();

      expect(steps).toHaveLength(4);
      expect(steps[0].name).toBe("Retrieve raw data");
      expect(steps[1].name).toBe("Ensure data directories");
      expect(steps[2].name).toBe("Generate ships");
      expect(steps[3].name).toBe("Generate outfits");
    });

    it("should accept custom logger and use it for logging", () => {
      const customLogger = {
        info: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      const pipeline = new DataGenerationPipeline(customLogger);

      expect(pipeline.getSteps()).toHaveLength(4);

      // Verify custom logger is actually used
      pipeline.execute();

      expect(customLogger.info).toHaveBeenCalledWith(
        "Starting data generation pipeline...\n"
      );
      expect(customLogger.info).toHaveBeenCalledWith(
        "Executing step: Retrieve raw data..."
      );
      expect(customLogger.success).toHaveBeenCalledWith(
        "Data generation pipeline completed successfully!"
      );
    });
  });

  describe("getSteps", () => {
    it("should return steps array with correct structure", () => {
      const pipeline = new DataGenerationPipeline();
      const steps = pipeline.getSteps();

      expect(steps).toHaveLength(4);
      // Verify each step has the required structure
      steps.forEach((step) => {
        expect(step).toHaveProperty("name");
        expect(step).toHaveProperty("execute");
        expect(typeof step.name).toBe("string");
        expect(typeof step.execute).toBe("function");
      });
    });
  });

  describe("execute", () => {
    it("should run all steps in order", () => {
      const pipeline = new DataGenerationPipeline();

      pipeline.execute();

      expect(logger.info).toHaveBeenCalledWith(
        "Starting data generation pipeline...\n"
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Executing step: Retrieve raw data..."
      );
      expect(retrieveRawData.retrieveRawData).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Executing step: Ensure data directories..."
      );
      expect(directories.ensureDataDirectories).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Executing step: Generate ships..."
      );
      expect(shipGenerator.generateShips).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Executing step: Generate outfits..."
      );
      expect(outfitGenerator.generateOutfits).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Data generation pipeline completed successfully!"
      );
    });

    it("should handle step errors and throw with context", () => {
      const pipeline = new DataGenerationPipeline();
      const error = new Error("Step failed");
      (retrieveRawData.retrieveRawData as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => {
        pipeline.execute();
      }).toThrow('Pipeline failed at step "Retrieve raw data"');

      expect(logger.error).toHaveBeenCalledWith(
        'Step "Retrieve raw data" failed',
        error
      );
      expect(directories.ensureDataDirectories).not.toHaveBeenCalled();
      expect(shipGenerator.generateShips).not.toHaveBeenCalled();
      expect(outfitGenerator.generateOutfits).not.toHaveBeenCalled();
    });

    it("should handle errors in middle steps", () => {
      const pipeline = new DataGenerationPipeline();
      const error = new Error("Directory error");
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockImplementation(
        () => {
          throw error;
        }
      );

      expect(() => {
        pipeline.execute();
      }).toThrow('Pipeline failed at step "Ensure data directories"');

      expect(logger.error).toHaveBeenCalledWith(
        'Step "Ensure data directories" failed',
        error
      );
      expect(shipGenerator.generateShips).not.toHaveBeenCalled();
    });

    it("should handle errors in last step", () => {
      const pipeline = new DataGenerationPipeline();
      const error = new Error("Outfit generation error");
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (shipGenerator.generateShips as jest.Mock).mockReturnValue(undefined);
      (outfitGenerator.generateOutfits as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => {
        pipeline.execute();
      }).toThrow('Pipeline failed at step "Generate outfits"');

      expect(logger.error).toHaveBeenCalledWith(
        'Step "Generate outfits" failed',
        error
      );
    });
  });
});
