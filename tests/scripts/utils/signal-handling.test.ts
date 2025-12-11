import { setupSignalHandling } from "@scripts/utils/signal-handling";
import { logger } from "@/lib/logger";

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

describe("signal-handling", () => {
  let originalExit: typeof process.exit;
  let mockExit: jest.SpyInstance;
  let originalOn: typeof process.on;
  let mockOn: jest.SpyInstance;
  let signalHandlers: Map<string, () => void>;

  beforeEach(() => {
    originalExit = process.exit;
    originalOn = process.on;
    signalHandlers = new Map();

    // Mock process.on to capture signal handlers
    mockOn = jest
      .spyOn(process, "on")
      .mockImplementation(
        (event: string | symbol, handler: (...args: unknown[]) => void) => {
          if (typeof event === "string") {
            signalHandlers.set(event, handler as () => void);
          }
          return process as typeof process;
        }
      );

    // Mock process.exit to prevent actual exit
    mockExit = jest
      .spyOn(process, "exit")
      .mockImplementation((code?: string | number | null) => {
        throw new Error(`process.exit(${code})`);
      });

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockExit.mockRestore();
    mockOn.mockRestore();
    process.exit = originalExit;
    process.on = originalOn;
    signalHandlers.clear();
  });

  describe("setupSignalHandling", () => {
    it("When SIGINT is received, Then should log graceful shutdown message", () => {
      // Arrange
      setupSignalHandling("Test Script");

      // Act
      const handler = signalHandlers.get("SIGINT");
      expect(handler).toBeDefined();
      if (handler) {
        handler();
      }

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "\nReceived SIGINT, shutting down gracefully..."
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Press Ctrl+C again to force shutdown"
      );
    });

    it("When SIGTERM is received, Then should log graceful shutdown message", () => {
      // Arrange
      setupSignalHandling("Test Script");

      // Act
      const handler = signalHandlers.get("SIGTERM");
      expect(handler).toBeDefined();
      if (handler) {
        handler();
      }

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "\nReceived SIGTERM, shutting down gracefully..."
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Press Ctrl+C again to force shutdown"
      );
    });

    it("When signal is received twice, Then should force exit immediately", () => {
      // Arrange
      setupSignalHandling("Test Script");
      const handler = signalHandlers.get("SIGINT");
      expect(handler).toBeDefined();

      // Act - first signal
      if (handler) {
        handler();
      }

      // Act - second signal (force shutdown)
      if (handler) {
        expect(() => handler()).toThrow("process.exit(1)");
      }

      // Assert
      expect(logger.error).toHaveBeenCalledWith("Force shutdown requested");
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("When shutdown timeout expires, Then should force exit", () => {
      // Arrange
      const customTimeout = 2000;
      setupSignalHandling("Test Script", customTimeout);
      const handler = signalHandlers.get("SIGINT");
      expect(handler).toBeDefined();

      // Act
      if (handler) {
        handler();
      }

      // Advance timers - this will trigger process.exit which throws in our mock
      expect(() => {
        jest.advanceTimersByTime(customTimeout);
      }).toThrow("process.exit(1)");

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        "Shutdown timeout, forcing exit"
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("When custom timeout is provided, Then should use custom timeout", () => {
      // Arrange
      const customTimeout = 1000;
      setupSignalHandling("Test Script", customTimeout);
      const handler = signalHandlers.get("SIGINT");
      expect(handler).toBeDefined();

      // Act
      if (handler) {
        handler();
      }
      jest.advanceTimersByTime(customTimeout - 100);

      // Assert - should not have exited yet
      expect(mockExit).not.toHaveBeenCalled();

      // Act - advance past timeout (this will trigger process.exit which throws)
      expect(() => {
        jest.advanceTimersByTime(200);
      }).toThrow("process.exit(1)");

      // Assert
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("When custom logger is provided, Then should use custom logger", () => {
      // Arrange
      const customLogger: typeof logger = {
        info: jest.fn(),
        error: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };
      setupSignalHandling("Test Script", 5000, customLogger);
      const handler = signalHandlers.get("SIGINT");
      expect(handler).toBeDefined();

      // Act
      if (handler) {
        handler();
      }

      // Assert
      expect(customLogger.info).toHaveBeenCalledWith(
        "\nReceived SIGINT, shutting down gracefully..."
      );
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
