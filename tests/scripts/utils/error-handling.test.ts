import {
  handleScriptError,
  handleValidationError,
} from "@scripts/utils/error-handling";
import { logger } from "@/lib/logger";
import { z } from "zod";

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

  describe("handleScriptError", () => {
    it("should log error and exit with code 1 for Error object", () => {
      const error = new Error("Test error");
      const scriptName = "Test Script";

      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith("Test Script failed", error);
    });

    it("should log error and exit with code 1 for string error", () => {
      const error = "String error";
      const scriptName = "Test Script";

      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith("Test Script failed", error);
    });

    it("should log error and exit with code 1 for unknown error type", () => {
      const error = { custom: "error" };
      const scriptName = "Test Script";

      expect(() => {
        handleScriptError(error, scriptName);
      }).toThrow("process.exit(1)");

      expect(logger.error).toHaveBeenCalledWith("Test Script failed", error);
    });
  });

  describe("handleValidationError", () => {
    it("should throw formatted error for ZodError", () => {
      const zodError = z.object({ name: z.string() }).safeParse({ name: 123 });
      if (!zodError.success) {
        expect(() => {
          handleValidationError(zodError.error, "TestItem", "ship");
        }).toThrow(
          'Failed to validate ship "TestItem": name: Invalid input: expected string, received number'
        );
      }
    });

    it("should throw formatted error for ZodError with species prefix", () => {
      const zodError = z.object({ name: z.string() }).safeParse({ name: 123 });
      if (!zodError.success) {
        expect(() => {
          handleValidationError(zodError.error, "TestItem", "ship", "human");
        }).toThrow(
          'Failed to validate ship [human] "TestItem": name: Invalid input: expected string, received number'
        );
      }
    });

    it("should throw formatted error for non-ZodError Error object", () => {
      const error = new Error("Parse error");
      expect(() => {
        handleValidationError(error, "TestItem", "outfit");
      }).toThrow('Failed to parse outfit "TestItem": Parse error');
    });

    it("should throw formatted error for non-ZodError Error object with species", () => {
      const error = new Error("Parse error");
      expect(() => {
        handleValidationError(error, "TestItem", "outfit", "pug");
      }).toThrow('Failed to parse outfit [pug] "TestItem": Parse error');
    });

    it("should throw formatted error for non-Error type", () => {
      const error = "String error";
      expect(() => {
        handleValidationError(error, "TestItem", "ship");
      }).toThrow('Failed to parse ship "TestItem": String error');
    });

    it("should throw formatted error for non-Error type with species", () => {
      const error = { custom: "error" };
      expect(() => {
        handleValidationError(error, "TestItem", "outfit", "hai");
      }).toThrow('Failed to parse outfit [hai] "TestItem": [object Object]');
    });
  });
});
