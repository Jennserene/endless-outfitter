/**
 * Test fixtures and data factories
 * Provides reusable test data for consistent testing
 */

import { TEST_ERROR_MESSAGE, TEST_ERROR_DIGEST } from "./test-constants";

/**
 * Generate a URL-friendly slug from a name string.
 */
function slugify(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ship data structure used in the application
 */
export interface ShipFixture {
  name: string;
  slug: string;
  attributes: {
    category: string;
    hull: number;
    [key: string]: unknown;
  };
  outfits: { name: string; quantity: number }[];
  descriptions: string[];
}

/**
 * Create a ship fixture with default values
 */
export function createShipFixture(
  overrides?: Partial<ShipFixture>
): ShipFixture {
  const name = overrides?.name || "Argosy";
  return {
    name,
    slug: overrides?.slug || slugify(name),
    attributes: {
      category: "ship",
      hull: 100,
    },
    outfits: [],
    descriptions: [],
    ...overrides,
  };
}

/**
 * Common ship fixtures for testing
 */
export const SHIP_FIXTURES = {
  ARGOSY: createShipFixture({
    name: "Argosy",
    attributes: { category: "ship", hull: 100 },
  }),
  BACTRIAN: createShipFixture({
    name: "Bactrian",
    attributes: { category: "ship", hull: 200 },
  }),
  BEETLE: createShipFixture({
    name: "Beetle",
    attributes: { category: "ship", hull: 50 },
  }),
} as const;

/**
 * Create multiple ship fixtures
 */
export function createShipFixtures(count: number): ShipFixture[] {
  return Array.from({ length: count }, (_, i) =>
    createShipFixture({
      name: `Ship ${i + 1}`,
      attributes: { category: "ship", hull: 100 + i * 10 },
    })
  );
}

/**
 * Create an error object with optional digest
 */
export function createErrorFixture(
  message: string = TEST_ERROR_MESSAGE,
  digest?: string
): Error & { digest?: string } {
  const error = new Error(message) as Error & { digest?: string };
  if (digest !== undefined) {
    error.digest = digest;
  }
  return error;
}

/**
 * Create a standard test error with digest
 */
export function createTestError(): Error & { digest?: string } {
  return createErrorFixture(TEST_ERROR_MESSAGE, TEST_ERROR_DIGEST);
}
