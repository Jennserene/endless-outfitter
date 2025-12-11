import { main, executeValidation } from "@scripts/validate-data";
import {
  parseCliArgs,
  displayHelp,
  displayVersion,
} from "@scripts/utils/cli-args";
import { ScriptError, ScriptErrorCode } from "@scripts/utils/error-handling";
import * as dataLoader from "@/lib/loaders/data-loader";
import * as directories from "@scripts/utils/directories";

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

jest.mock("@/lib/loaders/data-loader", () => ({
  loadShips: jest.fn(),
  loadOutfits: jest.fn(),
}));

jest.mock("@scripts/utils/directories", () => ({
  validateDataDirectories: jest.fn(),
}));

jest.mock("@scripts/utils/error-handling", () => ({
  handleScriptError: jest.fn(),
  ScriptError: jest.requireActual("@scripts/utils/error-handling").ScriptError,
  ScriptErrorCode: jest.requireActual("@scripts/utils/error-handling")
    .ScriptErrorCode,
}));

jest.mock("@scripts/utils/cli-args", () => ({
  parseCliArgs: jest.fn(),
  displayHelp: jest.fn(),
  displayVersion: jest.fn(),
  isMainModule: jest.fn(() => false), // Prevent module-level execution
}));

describe("validate-data CLI", () => {
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

  describe("executeValidation", () => {
    it("When validation succeeds, Then should return success result with validation counts", async () => {
      // Arrange
      (directories.validateDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (dataLoader.loadShips as jest.Mock).mockReturnValue([
        { name: "Ship1" },
        { name: "Ship2" },
      ]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([
        { name: "Outfit1" },
      ]);

      // Act
      const result = await executeValidation();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Data validation completed successfully");
      expect(result.results).toHaveLength(2);
      expect(result.results?.[0]).toEqual({
        type: "ships",
        count: 2,
        success: true,
      });
      expect(result.results?.[1]).toEqual({
        type: "outfits",
        count: 1,
        success: true,
      });
    });

    it("When debug option is true, Then should set DEBUG environment variable", async () => {
      // Arrange
      (directories.validateDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);
      delete process.env.DEBUG;

      // Act
      await executeValidation({
        debug: true,
        help: false,
        json: false,
        version: false,
      });

      // Assert
      expect(process.env.DEBUG).toBe("1");
    });

    it("When validation fails with ScriptError, Then should return error result with error code", async () => {
      // Arrange
      const error = new ScriptError(
        ScriptErrorCode.VALIDATION_ERROR,
        "Validation failed"
      );
      (directories.validateDataDirectories as jest.Mock).mockImplementation(
        () => {
          throw error;
        }
      );

      // Act
      const result = await executeValidation();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(ScriptErrorCode.VALIDATION_ERROR);
      expect(result.message).toBe("Validation failed");
    });

    it("When validation fails with generic error, Then should return generic error result", async () => {
      // Arrange
      const error = new Error("Generic error");
      (directories.validateDataDirectories as jest.Mock).mockImplementation(
        () => {
          throw error;
        }
      );

      // Act
      const result = await executeValidation();

      // Assert
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe(ScriptErrorCode.VALIDATION_ERROR);
      expect(result.message).toBe("Generic error");
    });
  });

  describe("main", () => {
    it("When version flag is provided, Then should display version and return exit code 0", async () => {
      // Arrange
      (parseCliArgs as jest.Mock).mockReturnValue({
        version: true,
        help: false,
        json: false,
        debug: false,
      });

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
      expect(displayVersion).toHaveBeenCalledWith("validate-data");
    });

    it("When help flag is provided, Then should display help and return exit code 0", async () => {
      // Arrange
      (parseCliArgs as jest.Mock).mockReturnValue({
        version: false,
        help: true,
        json: false,
        debug: false,
      });

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
      expect(displayHelp).toHaveBeenCalledWith("validate-data");
    });

    it("When validation succeeds, Then should return exit code 0", async () => {
      // Arrange
      (parseCliArgs as jest.Mock).mockReturnValue({
        version: false,
        help: false,
        json: false,
        debug: false,
      });
      (directories.validateDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
    });

    it("When validation succeeds with json flag, Then should output JSON result", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      (parseCliArgs as jest.Mock).mockReturnValue({
        version: false,
        help: false,
        json: true,
        debug: false,
      });
      (directories.validateDataDirectories as jest.Mock).mockReturnValue(
        undefined
      );
      (dataLoader.loadShips as jest.Mock).mockReturnValue([]);
      (dataLoader.loadOutfits as jest.Mock).mockReturnValue([]);

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();
      const jsonOutput = consoleSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(jsonOutput);
      expect(parsed.success).toBe(true);
      expect(parsed.results).toBeDefined();
      consoleSpy.mockRestore();
    });

    it("When validation fails, Then should return exit code 1", async () => {
      // Arrange
      (parseCliArgs as jest.Mock).mockReturnValue({
        version: false,
        help: false,
        json: false,
        debug: false,
      });
      const error = new ScriptError(
        ScriptErrorCode.VALIDATION_ERROR,
        "Validation failed"
      );
      (directories.validateDataDirectories as jest.Mock).mockImplementation(
        () => {
          throw error;
        }
      );

      // Act
      const exitCode = await main();

      // Assert
      expect(exitCode).toBe(1);
    });
  });
});
