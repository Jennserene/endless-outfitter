/**
 * Mock utilities for Next.js and other dependencies
 * Centralized mocks for consistent test setup
 */

// Mock Next.js navigation
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  forward: jest.fn(),
};

export const mockPathname = "/outfitter";

export const mockSearchParams = {
  get: jest.fn(),
  has: jest.fn(),
  getAll: jest.fn(),
  keys: jest.fn(() => []),
  values: jest.fn(() => []),
  entries: jest.fn(() => []),
  forEach: jest.fn(),
  sort: jest.fn(),
  toString: jest.fn(() => ""),
  append: jest.fn(),
  delete: jest.fn(),
  set: jest.fn(),
};

/**
 * Setup Next.js navigation mocks
 * Note: This function defines mocks but they must be called at the module level
 * For per-test mocks, use the individual mock functions below
 */
export function setupNextMocks() {
  jest.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockPathname,
    useSearchParams: () => mockSearchParams,
  }));

  jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) => {
      // Use React.createElement to avoid JSX in .ts file
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const React = require("react");
      return React.createElement("a", { href }, children);
    };
  });

  jest.mock("next/font/google", () => ({
    Geist: jest.fn(() => ({
      variable: "--font-geist-sans",
    })),
    Geist_Mono: jest.fn(() => ({
      variable: "--font-geist-mono",
    })),
  }));
}

/**
 * Mock next/navigation module
 * Use this in test files that need navigation mocks
 */
export function mockNextNavigation() {
  jest.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockPathname,
    useSearchParams: () => mockSearchParams,
  }));
}

/**
 * Mock next/link module
 * Use this in test files that need Link component mocks
 */
export function mockNextLink() {
  jest.mock("next/link", () => {
    // eslint-disable-next-line react/display-name
    return ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const React = require("react");
      return React.createElement("a", { href }, children);
    };
  });
}

/**
 * Mock next/font/google module
 * Use this in test files that need font mocks
 */
export function mockNextFont() {
  jest.mock("next/font/google", () => ({
    Geist: jest.fn(() => ({
      variable: "--font-geist-sans",
    })),
    Geist_Mono: jest.fn(() => ({
      variable: "--font-geist-mono",
    })),
  }));
}

/**
 * Mock game data functions
 */
export const mockShips = [
  {
    id: "1",
    name: "Argosy",
    hull: 100,
  },
  {
    id: "2",
    name: "Bactrian",
    hull: 200,
  },
] as const;

export const mockGetShips = jest.fn(() => mockShips);

/**
 * Setup game data mocks
 */
export function setupGameDataMocks() {
  jest.mock("@/lib/game-data", () => ({
    getShips: mockGetShips,
    getOutfits: jest.fn(() => []),
  }));
}

/**
 * Mock logger
 */
export const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

/**
 * Setup logger mocks
 */
export function setupLoggerMocks() {
  jest.mock("@/lib/logger", () => ({
    logger: mockLogger,
  }));
}

/**
 * Setup all common mocks
 * Convenience function to set up all mocks at once
 * Note: Individual mocks may still need to be called at module level in test files
 */
export function setupAllMocks() {
  setupNextMocks();
  setupGameDataMocks();
  setupLoggerMocks();
}
