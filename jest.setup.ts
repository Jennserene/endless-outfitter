// Only import jest-dom for app tests (not scripts tests)
// This will fail silently in node environment, which is fine
// For app tests that need DOM, they should use jsdom environment
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@testing-library/jest-dom");
} catch {
  // Ignore if not available (e.g., in node environment for scripts tests)
}

// Mock global fetch for agent log calls in scripts
// These are non-critical logging calls that should not fail tests
if (typeof global.fetch === "undefined") {
  global.fetch = (() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "",
    } as Response)) as typeof fetch;
}

// Mock window.matchMedia for next-themes compatibility in tests
// next-themes uses matchMedia to detect system theme preference
// Only mock if window exists (jsdom environment)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
