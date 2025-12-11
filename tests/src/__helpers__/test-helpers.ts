/**
 * Test helper functions
 * Provides reusable utilities for common test operations
 */

/**
 * Setup console.error spy for error boundary tests
 * Returns the spy so it can be cleared/restored in tests
 */
export function setupConsoleErrorSpy(): jest.SpyInstance {
  return jest.spyOn(console, "error").mockImplementation(() => {});
}

/**
 * Teardown console.error spy
 */
export function teardownConsoleErrorSpy(spy: jest.SpyInstance): void {
  spy.mockRestore();
}
