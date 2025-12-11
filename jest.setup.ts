// Only import jest-dom for app tests (not scripts tests)
// This will fail silently in node environment, which is fine
// For app tests that need DOM, they should use jsdom environment
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@testing-library/jest-dom");
} catch {
  // Ignore if not available (e.g., in node environment for scripts tests)
}
