/**
 * Helper to mock process.exit for tests
 */

let mockExit: jest.SpyInstance | null = null;

/**
 * Setup process.exit mock that throws instead of exiting
 */
export function setupProcessExitMock(): jest.SpyInstance {
  if (mockExit) {
    return mockExit;
  }

  mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`process.exit(${code})`);
  });

  return mockExit;
}

/**
 * Restore process.exit mock
 */
export function restoreProcessExitMock(): void {
  if (mockExit) {
    mockExit.mockRestore();
    mockExit = null;
  }
}
