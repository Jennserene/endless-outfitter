import {
  handleScriptError,
  handleValidationError,
  ScriptError,
  ScriptErrorCode,
  createPipelineStepError,
} from "@scripts/utils/error-handling";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { TEST_ERROR_MESSAGES, TEST_SCRIPT_NAMES } from "../__fixtures__";

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock process.exit to prevent test termination
const mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit(${code})`);
});

describe("error-handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  describe("ScriptError", () => {
    it("When creating ScriptError with code and message, Then should set all properties correctly", () => {
      // Arrange & Act
      const error = new ScriptError(
        ScriptErrorCode.GENERIC_ERROR,
        TEST_ERROR_MESSAGES.GENERIC
      );

      // Assert
      expect(error.code).toBe(ScriptErrorCode.GENERIC_ERROR);
      expect(error.message).toBe(TEST_ERROR_MESSAGES.GENERIC);
      expect(error.name).toBe("ScriptError");
    });

    it("When creating ScriptError with actionable message, Then should set actionable property", () => {
      // Arrange & Act
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        TEST_ERROR_MESSAGES.PIPELINE_FAILED,
        "Check your configuration"
      );

      // Assert
      expect(error.actionable).toBe("Check your configuration");
    });

    it("When creating ScriptError with cause, Then should set cause property", () => {
      // Arrange
      const cause = new Error("Original error");

      // Act
      const error = new ScriptError(
        ScriptErrorCode.GENERIC_ERROR,
        "Wrapped error",
        undefined,
        cause
      );

      // Assert
      expect(error.cause).toBe(cause);
    });
  });

  describe("handleScriptError", () => {
    it("When handling ScriptError, Then should log error with code and actionable message and exit", () => {
      // Arrange
      const error = new ScriptError(
        ScriptErrorCode.PIPELINE_STEP_FAILED,
        TEST_ERROR_MESSAGES.PIPELINE_FAILED,
        "Check your configuration"
      );
      const scriptName = TEST_SCRIPT_NAMES.TEST_SCRIPT;

      // Act & Assert
      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("E4002"),
        error
      );
      expect(logger.error).toHaveBeenCalledWith("Check your configuration");
    });

    it("When handling Error object, Then should log error and exit with code 1", () => {
      // Arrange
      const error = new Error(TEST_ERROR_MESSAGES.GENERIC);
      const scriptName = TEST_SCRIPT_NAMES.TEST_SCRIPT;

      // Act & Assert
      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith(
        `${TEST_SCRIPT_NAMES.TEST_SCRIPT} failed`,
        error
      );
    });

    it("When handling error with custom exit code, Then should exit with that code", () => {
      // Arrange
      const error = new Error(TEST_ERROR_MESSAGES.GENERIC);
      const scriptName = TEST_SCRIPT_NAMES.TEST_SCRIPT;

      // Act & Assert
      expect(() => {
        handleScriptError(error, scriptName, 2);
      }).toThrow("process.exit(2)");
    });

    it("When handling string error, Then should log error and exit with code 1", () => {
      // Arrange
      const error = "String error";
      const scriptName = TEST_SCRIPT_NAMES.TEST_SCRIPT;

      // Act & Assert
      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith(
        `${TEST_SCRIPT_NAMES.TEST_SCRIPT} failed`,
        error
      );
    });

    it("When handling unknown error type, Then should log error and exit with code 1", () => {
      // Arrange
      const error = { custom: "error" };
      const scriptName = TEST_SCRIPT_NAMES.TEST_SCRIPT;

      // Act & Assert
      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith(
        `${TEST_SCRIPT_NAMES.TEST_SCRIPT} failed`,
        error
      );
    });
  });

  describe("createPipelineStepError", () => {
    it("When creating pipeline step error, Then should return ScriptError with correct code and properties", () => {
      // Arrange
      const cause = new Error(TEST_ERROR_MESSAGES.STEP_FAILED);

      // Act
      const error = createPipelineStepError("Test Step", cause);

      // Assert
      expect(error.code).toBe(ScriptErrorCode.PIPELINE_STEP_FAILED);
      expect(error.message).toContain("Test Step");
      expect(error.actionable).toBeDefined();
      expect(error.cause).toBe(cause);
    });
  });

  describe("handleValidationError", () => {
    it("When handling ZodError, Then should throw ScriptError with validation code", () => {
      // Arrange
      const zodError = z.object({ name: z.string() }).safeParse({ name: 123 });

      // Act & Assert
      if (!zodError.success) {
        expect(() => {
          handleValidationError(zodError.error, "TestItem", "ship");
        }).toThrow(ScriptError);
      }
    });

    it("When handling ZodError, Then should throw ScriptError with actionable message", () => {
      // Arrange
      const zodError = z.object({ name: z.string() }).safeParse({ name: 123 });

      // Act & Assert
      if (!zodError.success) {
        try {
          handleValidationError(zodError.error, "TestItem", "ship");
        } catch (error) {
          expect(error).toBeInstanceOf(ScriptError);
          if (error instanceof ScriptError) {
            expect(error.code).toBe(ScriptErrorCode.VALIDATION_ERROR);
            expect(error.message).toContain("TestItem");
            expect(error.actionable).toBeDefined();
          }
        }
      }
    });

    it("When handling ZodError with species, Then should include species prefix in error message", () => {
      // Arrange
      const zodError = z.object({ name: z.string() }).safeParse({ name: 123 });

      // Act & Assert
      if (!zodError.success) {
        try {
          handleValidationError(zodError.error, "TestItem", "ship", "human");
        } catch (error) {
          expect(error).toBeInstanceOf(ScriptError);
          if (error instanceof ScriptError) {
            expect(error.code).toBe(ScriptErrorCode.VALIDATION_ERROR);
            expect(error.message).toContain("[human]");
            expect(error.message).toContain("TestItem");
          }
        }
      }
    });

    it("When handling non-ZodError Error object, Then should throw ScriptError with validation code", () => {
      // Arrange
      const error = new Error(TEST_ERROR_MESSAGES.VALIDATION_ERROR);

      // Act & Assert
      try {
        handleValidationError(error, "TestItem", "outfit");
      } catch (thrownError) {
        expect(thrownError).toBeInstanceOf(ScriptError);
        if (thrownError instanceof ScriptError) {
          expect(thrownError.code).toBe(ScriptErrorCode.VALIDATION_ERROR);
          expect(thrownError.message).toContain("TestItem");
          expect(thrownError.message).toContain(
            TEST_ERROR_MESSAGES.VALIDATION_ERROR
          );
        }
      }
    });

    it("When handling non-ZodError Error object with species, Then should include species in error message", () => {
      // Arrange
      const error = new Error(TEST_ERROR_MESSAGES.VALIDATION_ERROR);

      // Act & Assert
      try {
        handleValidationError(error, "TestItem", "outfit", "pug");
      } catch (thrownError) {
        expect(thrownError).toBeInstanceOf(ScriptError);
        if (thrownError instanceof ScriptError) {
          expect(thrownError.code).toBe(ScriptErrorCode.VALIDATION_ERROR);
          expect(thrownError.message).toContain("[pug]");
        }
      }
    });

    it("When handling non-Error type, Then should throw ScriptError with validation code", () => {
      // Arrange
      const error = "String error";

      // Act & Assert
      try {
        handleValidationError(error, "TestItem", "ship");
      } catch (thrownError) {
        expect(thrownError).toBeInstanceOf(ScriptError);
        if (thrownError instanceof ScriptError) {
          expect(thrownError.code).toBe(ScriptErrorCode.VALIDATION_ERROR);
          expect(thrownError.message).toContain("String error");
        }
      }
    });

    it("When handling non-Error type with species, Then should include species in error message", () => {
      // Arrange
      const error = { custom: "error" };

      // Act & Assert
      try {
        handleValidationError(error, "TestItem", "outfit", "hai");
      } catch (thrownError) {
        expect(thrownError).toBeInstanceOf(ScriptError);
        if (thrownError instanceof ScriptError) {
          expect(thrownError.code).toBe(ScriptErrorCode.VALIDATION_ERROR);
          expect(thrownError.message).toContain("[hai]");
        }
      }
    });
  });
});
