import { DataGenerationPipeline } from "@scripts/pipeline/data-generation-pipeline";
import { logger } from "@/lib/logger";
import * as retrieveRawData from "@scripts/parsers/retrieve-raw-data";
import * as directories from "@scripts/utils/directories";
import * as shipGenerator from "@scripts/generators/ship-generator";
import * as outfitGenerator from "@scripts/generators/outfit-generator";
import * as dataLoader from "@/lib/loaders/data-loader";
import { ImageRetrievalService } from "@scripts/services/image-retrieval-service";
import { TEST_STEP_NAMES, TEST_ERROR_MESSAGES } from "../__fixtures__";

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
  cleanOutputDirectories: jest.fn(),
  backupExistingFiles: jest.fn(),
  deleteBackupFiles: jest.fn(),
  restoreBackupFiles: jest.fn(),
}));

jest.mock("@scripts/generators/ship-generator", () => ({
  generateShips: jest.fn(),
}));

jest.mock("@scripts/generators/outfit-generator", () => ({
  generateOutfits: jest.fn(),
}));

jest.mock("@/lib/loaders/data-loader", () => ({
  loadShips: jest.fn(),
  loadOutfits: jest.fn(),
}));

jest.mock("@scripts/services/image-retrieval-service", () => ({
  ImageRetrievalService: jest.fn().mockImplementation(() => ({
    retrieveImages: jest.fn(),
  })),
}));

describe("DataGenerationPipeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mocks for successful pipeline execution
    (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
    (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);
    (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
    (directories.cleanOutputDirectories as jest.Mock).mockReturnValue(
      undefined
    );
    (directories.deleteBackupFiles as jest.Mock).mockReturnValue(undefined);
    // Reset ImageRetrievalService mock to default successful behavior
    (ImageRetrievalService as jest.Mock).mockImplementation(() => ({
      retrieveImages: jest.fn(),
    }));
  });

  describe("constructor", () => {
    it("When creating pipeline with default logger, Then should create all steps correctly", () => {
      // Act
      const pipeline = new DataGenerationPipeline();
      const steps = pipeline.getSteps();

      // Assert
      expect(steps).toHaveLength(9);
      expect(steps[0].name).toBe(TEST_STEP_NAMES[0]);
      expect(steps[1].name).toBe(TEST_STEP_NAMES[1]);
      expect(steps[2].name).toBe(TEST_STEP_NAMES[2]);
      expect(steps[3].name).toBe(TEST_STEP_NAMES[3]);
      expect(steps[4].name).toBe(TEST_STEP_NAMES[4]);
      expect(steps[5].name).toBe(TEST_STEP_NAMES[5]);
      expect(steps[6].name).toBe(TEST_STEP_NAMES[6]);
      expect(steps[7].name).toBe(TEST_STEP_NAMES[7]);
      expect(steps[8].name).toBe(TEST_STEP_NAMES[8]);
    });

    it("When creating pipeline with custom logger, Then should use custom logger for logging", () => {
      // Arrange
      const customLogger = {
        info: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      const pipeline = new DataGenerationPipeline(customLogger);

      // Act
      pipeline.execute();

      // Assert
      expect(pipeline.getSteps()).toHaveLength(9);
      expect(customLogger.info).toHaveBeenCalledWith(
        "Starting data generation pipeline...\n"
      );
      expect(customLogger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[0]}...`
      );
      expect(customLogger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[1]}...`
      );
      expect(customLogger.success).toHaveBeenCalledWith(
        "Data generation pipeline completed successfully!"
      );
    });
  });

  describe("getSteps", () => {
    it("When getting steps, Then should return array with correct structure", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();

      // Act
      const steps = pipeline.getSteps();

      // Assert
      expect(steps).toHaveLength(9);
      steps.forEach((step) => {
        expect(step).toHaveProperty("name");
        expect(step).toHaveProperty("execute");
        expect(typeof step.name).toBe("string");
        expect(typeof step.execute).toBe("function");
      });
    });
  });

  describe("execute", () => {
    it("When executing pipeline, Then should run all steps in order", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();

      // Act
      pipeline.execute();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "Starting data generation pipeline...\n"
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[0]}...`
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[1]}...`
      );
      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[2]}...`
      );
      expect(directories.cleanOutputDirectories).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[3]}...`
      );
      expect(retrieveRawData.retrieveRawData).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[4]}...`
      );
      expect(directories.ensureDataDirectories).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[5]}...`
      );
      expect(shipGenerator.generateShips).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[6]}...`
      );
      expect(outfitGenerator.generateOutfits).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[7]}...`
      );
      expect(dataLoader.loadShips).toHaveBeenCalled();
      expect(dataLoader.loadOutfits).toHaveBeenCalled();
      expect(ImageRetrievalService).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Executing step: ${TEST_STEP_NAMES[8]}...`
      );
      expect(directories.deleteBackupFiles).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Data generation pipeline completed successfully!"
      );
    });

    it("When first step fails, Then should throw error with context and not execute subsequent steps", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();
      const error = new Error(TEST_ERROR_MESSAGES.STEP_FAILED);
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.backupExistingFiles as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => {
        pipeline.execute();
      }).toThrow(`Pipeline failed at step "${TEST_STEP_NAMES[1]}"`);

      expect(logger.error).toHaveBeenCalledWith(
        `Step "${TEST_STEP_NAMES[1]}" failed`,
        error
      );
      expect(directories.restoreBackupFiles).toHaveBeenCalled();
      expect(directories.cleanOutputDirectories).not.toHaveBeenCalled();
      expect(retrieveRawData.retrieveRawData).not.toHaveBeenCalled();
      expect(directories.ensureDataDirectories).not.toHaveBeenCalled();
      expect(shipGenerator.generateShips).not.toHaveBeenCalled();
      expect(outfitGenerator.generateOutfits).not.toHaveBeenCalled();
      expect(dataLoader.loadShips).not.toHaveBeenCalled();
    });

    it("When middle step fails, Then should throw error and not execute subsequent steps", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();
      const error = new Error(TEST_ERROR_MESSAGES.DIRECTORY_ERROR);
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.cleanOutputDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockImplementation(
        () => {
          throw error;
        }
      );

      // Act & Assert
      expect(() => {
        pipeline.execute();
      }).toThrow(`Pipeline failed at step "${TEST_STEP_NAMES[4]}"`);

      expect(logger.error).toHaveBeenCalledWith(
        `Step "${TEST_STEP_NAMES[4]}" failed`,
        error
      );
      expect(directories.restoreBackupFiles).toHaveBeenCalled();
      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(directories.cleanOutputDirectories).toHaveBeenCalled();
      expect(retrieveRawData.retrieveRawData).toHaveBeenCalled();
      expect(shipGenerator.generateShips).not.toHaveBeenCalled();
      expect(dataLoader.loadShips).not.toHaveBeenCalled();
    });

    it("When last step fails, Then should throw error with context", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();
      const error = new Error(TEST_ERROR_MESSAGES.IMAGE_RETRIEVAL_ERROR);
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.cleanOutputDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (shipGenerator.generateShips as jest.Mock).mockReturnValue(undefined);
      (outfitGenerator.generateOutfits as jest.Mock).mockReturnValue(undefined);
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);
      const mockService = {
        retrieveImages: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };
      (ImageRetrievalService as jest.Mock).mockImplementation(
        () => mockService
      );

      // Act & Assert
      expect(() => {
        pipeline.execute();
      }).toThrow(`Pipeline failed at step "${TEST_STEP_NAMES[7]}"`);

      expect(logger.error).toHaveBeenCalledWith(
        `Step "${TEST_STEP_NAMES[7]}" failed`,
        error
      );
      expect(directories.restoreBackupFiles).toHaveBeenCalled();
    });

    it("When pipeline executes successfully, Then should delete backup files", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());

      // Act
      pipeline.execute();

      // Assert
      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(directories.deleteBackupFiles).toHaveBeenCalled();
      expect(directories.restoreBackupFiles).not.toHaveBeenCalled();
    });

    it("When pipeline fails, Then should restore backup files", () => {
      // Arrange
      const pipeline = new DataGenerationPipeline();
      const error = new Error(TEST_ERROR_MESSAGES.STEP_FAILED);
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.cleanOutputDirectories as jest.Mock).mockImplementation(
        () => {
          throw error;
        }
      );

      // Act & Assert
      expect(() => {
        pipeline.execute();
      }).toThrow(`Pipeline failed at step "${TEST_STEP_NAMES[2]}"`);

      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(directories.restoreBackupFiles).toHaveBeenCalled();
      expect(directories.deleteBackupFiles).not.toHaveBeenCalled();
    });
  });
});
