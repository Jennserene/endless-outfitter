/**
 * Shared logger mock for all script tests
 */
export const mockLogger = {
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

/**
 * Create a custom logger mock with specific methods
 */
export function createMockLogger(methods?: {
  info?: jest.Mock;
  success?: jest.Mock;
  error?: jest.Mock;
  warn?: jest.Mock;
  debug?: jest.Mock;
}) {
  return {
    info: methods?.info || jest.fn(),
    success: methods?.success || jest.fn(),
    error: methods?.error || jest.fn(),
    warn: methods?.warn || jest.fn(),
    debug: methods?.debug || jest.fn(),
  };
}
