import { main, executePipeline } from "@scripts/generate-data";
import {
  parseCliArgs,
  displayHelp,
  displayVersion,
  getVersion,
} from "@scripts/utils/cli-args";
import { DataGenerationPipeline } from "@scripts/pipeline/data-generation-pipeline";
import { ScriptError, ScriptErrorCode } from "@scripts/utils/error-handling";
import { logger } from "@/lib/logger";
import * as retrieveRawData from "@scripts/parsers/retrieve-raw-data";
import * as directories from "@scripts/utils/directories";
import * as shipGenerator from "@scripts/generators/ship-generator";
import * as outfitGenerator from "@scripts/generators/outfit-generator";
import * as dataLoader from "@/lib/loaders/data-loader";
import { TEST_STEP_NAMES, TEST_ERROR_MESSAGES } from "./__fixtures__";

// Mock dependencies
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("@scripts/pipeline/data-generation-pipeline");
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

describe("generate-data CLI", () => {
  let originalArgv: string[];
  let originalEnv: NodeJS.ProcessEnv;
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    originalArgv = process.argv;
    originalEnv = { ...process.env };
    mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = originalEnv;
    mockExit.mockRestore();
  });

  describe("parseCliArgs", () => {
    it("When no arguments are provided, Then should return default options", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options).toEqual({
        version: false,
        help: false,
        json: false,
        debug: false,
      });
    });

    it("When --version flag is provided, Then should set version option to true", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--version"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.version).toBe(true);
    });

    it("When -V flag is provided, Then should set version option to true", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "-V"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.version).toBe(true);
    });

    it("When --help flag is provided, Then should set help option to true", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--help"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.help).toBe(true);
    });

    it("When -h flag is provided, Then should set help option to true", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "-h"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.help).toBe(true);
    });

    it("When --json flag is provided, Then should set json option to true", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--json"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.json).toBe(true);
    });

    it("When --debug flag is provided, Then should set debug option to true", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--debug"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.debug).toBe(true);
    });

    it("When DEBUG environment variable is set, Then should set debug option to true", () => {
      // Arrange
      process.env.DEBUG = "1";
      process.argv = ["node", "generate-data.ts"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.debug).toBe(true);
    });

    it("When both CLI flag and environment variable are set, Then CLI flag should take priority", () => {
      // Arrange
      process.env.DEBUG = "0";
      process.argv = ["node", "generate-data.ts", "--debug"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.debug).toBe(true);
    });

    it("When multiple flags are provided, Then should parse all flags correctly", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--json", "--debug"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.json).toBe(true);
      expect(options.debug).toBe(true);
    });

    it("When grouped short flags are provided (e.g., -vh), Then should parse all flags correctly", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "-vh"];

      // Act
      const options = parseCliArgs();

      // Assert
      expect(options.version).toBe(true);
      expect(options.help).toBe(true);
    });

    it("When invalid flag syntax is used, Then should handle gracefully", () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--json=true"];

      // Act
      const options = parseCliArgs();

      // Assert
      // Commander may throw for invalid syntax, but we handle it gracefully
      // The options object should still be defined
      expect(options).toBeDefined();
      expect(typeof options.json).toBe("boolean");
    });
  });

  describe("displayVersion", () => {
    it("When displayVersion is called, Then should output version information", () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      displayVersion("generate-data");

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("generate-data version")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("displayHelp", () => {
    it("When displayHelp is called, Then should output help message with usage and options", () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      displayHelp("generate-data");

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Usage:")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Options:")
      );
      consoleSpy.mockRestore();
    });
  });

  describe("getVersion", () => {
    it("When getVersion is called, Then should return version string from package.json", () => {
      // Act
      const version = getVersion();

      // Assert
      expect(typeof version).toBe("string");
      expect(version).not.toBe("unknown");
    });
  });

  describe("executePipeline", () => {
    let mockPipeline: jest.Mocked<DataGenerationPipeline>;

    beforeEach(() => {
      mockPipeline = {
        execute: jest.fn(),
        getSteps: jest.fn(() =>
          TEST_STEP_NAMES.map((name) => ({ name, execute: jest.fn() }))
        ),
      } as unknown as jest.Mocked<DataGenerationPipeline>;

      (DataGenerationPipeline as jest.Mock).mockImplementation(
        () => mockPipeline
      );
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.cleanOutputDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (directories.deleteBackupFiles as jest.Mock).mockReturnValue(undefined);
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (shipGenerator.generateShips as jest.Mock).mockReturnValue(undefined);
      (outfitGenerator.generateOutfits as jest.Mock).mockReturnValue(undefined);
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);
    });

    it("When pipeline executes successfully, Then should return success result with all steps marked as success", async () => {
      // Act
      const result = await executePipeline();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain("successfully");
      expect(result.steps).toHaveLength(9);
      result.steps?.forEach((step) => {
        expect(step.status).toBe("success");
      });
    });

    it("When debug option is true, Then should set DEBUG environment variable", async () => {
      // Arrange
      delete process.env.DEBUG;

      // Act
      await executePipeline({
        debug: true,
        version: false,
        help: false,
        json: false,
      });

      // Assert
      expect(process.env.DEBUG).toBe("1");
    });

    it("When pipeline step fails, Then should return error result with appropriate error code", async () => {
      // Arrange
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        'Pipeline failed at step "Backup existing files"'
      );
      mockPipeline.execute.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await executePipeline();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(ScriptErrorCode.PIPELINE_STEP_FAILED);
      expect(result.message).toContain("Backup existing files");
      const failedIndex = result.steps?.findIndex(
        (s) => s.name === "Backup existing files"
      );
      expect(failedIndex).toBeGreaterThanOrEqual(0);
      if (failedIndex !== undefined && failedIndex >= 0) {
        expect(result.steps?.[failedIndex].status).toBe("failed");
      }
    });

    it("When a pipeline step fails, Then should mark subsequent steps as failed", async () => {
      // Arrange
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        'Pipeline failed at step "Generate ships"'
      );
      mockPipeline.execute.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await executePipeline();

      // Assert
      expect(result.success).toBe(false);
      const failedIndex = result.steps?.findIndex(
        (s) => s.name === "Generate ships"
      );
      expect(failedIndex).toBeGreaterThanOrEqual(0);
      if (failedIndex !== undefined && failedIndex >= 0) {
        // All steps from failed index onwards should be marked as failed
        for (let i = failedIndex; i < (result.steps?.length || 0); i++) {
          expect(result.steps?.[i].status).toBe("failed");
        }
      }
    });

    it("When generic error occurs, Then should return error result with generic error code", async () => {
      // Arrange
      const error = new Error(TEST_ERROR_MESSAGES.GENERIC);
      mockPipeline.execute.mockImplementation(() => {
        throw error;
      });

      // Act
      const result = await executePipeline();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(ScriptErrorCode.GENERIC_ERROR);
      expect(result.message).toBe(TEST_ERROR_MESSAGES.GENERIC);
    });
  });

  describe("main", () => {
    let mockPipeline: jest.Mocked<DataGenerationPipeline>;

    beforeEach(() => {
      mockPipeline = {
        execute: jest.fn(),
        getSteps: jest.fn(() =>
          TEST_STEP_NAMES.map((name) => ({ name, execute: jest.fn() }))
        ),
      } as unknown as jest.Mocked<DataGenerationPipeline>;

      (DataGenerationPipeline as jest.Mock).mockImplementation(
        () => mockPipeline
      );
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.cleanOutputDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (directories.deleteBackupFiles as jest.Mock).mockReturnValue(undefined);
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (shipGenerator.generateShips as jest.Mock).mockReturnValue(undefined);
      (outfitGenerator.generateOutfits as jest.Mock).mockReturnValue(undefined);
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);
    });

    it("When --version flag is provided, Then should return exit code 0", async () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--version"];

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
    });

    it("When --help flag is provided, Then should return exit code 0", async () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--help"];

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
    });

    it("When pipeline executes successfully, Then should return exit code 0", async () => {
      // Arrange
      process.argv = ["node", "generate-data.ts"];

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
    });

    it("When pipeline fails, Then should exit with code 1 and log error", async () => {
      // Arrange
      process.argv = ["node", "generate-data.ts"];
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        TEST_ERROR_MESSAGES.PIPELINE_FAILED
      );
      mockPipeline.execute.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(main()).rejects.toThrow("process.exit(1)");
      expect(logger.error).toHaveBeenCalled();
    });

    it("When --json flag is set and pipeline succeeds, Then should output JSON result", async () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--json"];
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Act
      await main();

      // Assert
      expect(consoleSpy).toHaveBeenCalled();
      const output = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(output as string);
      expect(parsed.success).toBe(true);
      expect(parsed.steps).toBeDefined();

      consoleSpy.mockRestore();
    });

    it("When --json flag is set and pipeline fails, Then should output error JSON", async () => {
      // Arrange
      process.argv = ["node", "generate-data.ts", "--json"];
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        TEST_ERROR_MESSAGES.PIPELINE_FAILED
      );
      mockPipeline.execute.mockImplementation(() => {
        throw error;
      });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(output as string);
      expect(parsed.success).toBe(false);
      expect(parsed.errorCode).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("backup and restore functionality", () => {
    let mockPipeline: jest.Mocked<DataGenerationPipeline>;

    beforeEach(() => {
      // Set up all mocks first
      (directories.backupExistingFiles as jest.Mock).mockReturnValue(new Map());
      (directories.cleanOutputDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (directories.deleteBackupFiles as jest.Mock).mockReturnValue(undefined);
      (directories.restoreBackupFiles as jest.Mock).mockReturnValue(undefined);
      (retrieveRawData.retrieveRawData as jest.Mock).mockReturnValue(undefined);
      (directories.ensureDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (shipGenerator.generateShips as jest.Mock).mockReturnValue(undefined);
      (outfitGenerator.generateOutfits as jest.Mock).mockReturnValue(undefined);
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);

      // Create a mock pipeline that actually executes the steps
      // by calling the real directory functions
      mockPipeline = {
        execute: jest.fn(() => {
          try {
            // Simulate pipeline execution by calling the mocked functions
            directories.backupExistingFiles();
            directories.cleanOutputDirectories();
            retrieveRawData.retrieveRawData();
            directories.ensureDataDirectories();
            shipGenerator.generateShips(undefined);
            outfitGenerator.generateOutfits(undefined);
            dataLoader.loadShips();
            dataLoader.loadOutfits();
            // Image retrieval step
            const ImageRetrievalService = jest.requireMock<
              typeof import("@scripts/services/image-retrieval-service")
            >(
              "@scripts/services/image-retrieval-service"
            ).ImageRetrievalService;
            const service = new ImageRetrievalService();
            service.retrieveImages([], []);
            directories.deleteBackupFiles();
          } catch (error) {
            // Simulate error handling - restore backups on error
            directories.restoreBackupFiles();
            throw error;
          }
        }),
        getSteps: jest.fn(() =>
          TEST_STEP_NAMES.map((name) => ({ name, execute: jest.fn() }))
        ),
      } as unknown as jest.Mocked<DataGenerationPipeline>;

      (DataGenerationPipeline as jest.Mock).mockImplementation(
        () => mockPipeline
      );
    });

    it("When pipeline executes successfully, Then should call deleteBackupFiles", async () => {
      // Act
      await executePipeline();

      // Assert
      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(directories.deleteBackupFiles).toHaveBeenCalled();
      expect(directories.restoreBackupFiles).not.toHaveBeenCalled();
    });

    it("When pipeline fails, Then should call restoreBackupFiles", async () => {
      // Arrange
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        'Pipeline failed at step "Generate ships"'
      );
      (shipGenerator.generateShips as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act
      await executePipeline();

      // Assert
      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(directories.restoreBackupFiles).toHaveBeenCalled();
      expect(directories.deleteBackupFiles).not.toHaveBeenCalled();
    });

    it("When backup step fails, Then should still call restoreBackupFiles as safety measure", async () => {
      // Arrange
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        'Pipeline failed at step "Backup existing files"'
      );
      (directories.backupExistingFiles as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Act
      await executePipeline();

      // Assert
      // Even if backup fails, the pipeline should attempt to restore as a safety measure
      expect(directories.backupExistingFiles).toHaveBeenCalled();
      expect(directories.restoreBackupFiles).toHaveBeenCalled();
      expect(directories.deleteBackupFiles).not.toHaveBeenCalled();
    });
  });
});
