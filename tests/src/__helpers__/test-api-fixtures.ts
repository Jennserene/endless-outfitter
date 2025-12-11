/**
 * API test fixtures
 * Provides reusable test data for API route testing
 * This file should only be imported in API route tests that have Request/Response polyfilled
 */

import { NextRequest } from "next/server";
import { createShipFixture, SHIP_FIXTURES } from "./test-fixtures";

/**
 * Create a NextRequest for API route testing
 */
export function createApiRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  }
): NextRequest {
  const { method = "GET", headers = {}, body } = options || {};
  const requestInit: Omit<RequestInit, "signal"> & {
    signal?: AbortSignal;
  } = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Create a mock NextRequest for ships API
 */
export function createShipsApiRequest(
  queryParams?: Record<string, string>
): NextRequest {
  const url = new URL("http://localhost:3000/api/ships");
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return createApiRequest(url.toString());
}

// Re-export ship fixtures for convenience
export { createShipFixture, SHIP_FIXTURES };
