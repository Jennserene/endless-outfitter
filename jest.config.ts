import type { Config } from "jest";
import nextJest from "next/jest.js";
import { pathsToModuleNameMapper } from "ts-jest";
import { readFileSync } from "fs";

// Import tsconfig using readFileSync for JSON compatibility
const tsconfig = JSON.parse(readFileSync("./tsconfig.json", "utf-8")) as {
  compilerOptions: { paths?: Record<string, string[]> };
};
const { compilerOptions } = tsconfig;

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  // Use jsdom for app tests - scripts tests can work with jsdom too
  testEnvironment: "jsdom",
  // Conditionally load setup file only for app tests
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Look for tests in the tests folder
  testMatch: ["<rootDir>/tests/**/*.test.[jt]s?(x)"],
  // Map TypeScript path aliases to Jest module resolution using ts-jest helper
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
    prefix: "<rootDir>/",
  }),
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
