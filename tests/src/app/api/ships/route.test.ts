/**
 * @jest-environment node
 */

// CRITICAL: Polyfill Request/Response FIRST, before ANY other code
// Next.js server code (imported via route) expects these to be global
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Request, Response } = require("undici");
global.Request = Request;
global.Response = Response;

/**
 * Tests for src/app/api/ships/route.ts
 * API route for ships data
 *
 * Based on Next.js testing best practices:
 * - Use NextRequest from next/server for creating request objects (official Next.js way)
 * - Polyfill Request/Response before importing route (Next.js server code expects them)
 */

// Mock the modules - must be defined before imports
jest.mock("@/lib/game-data", () => ({
  getShips: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { GET } from "@/app/api/ships/route";
import { TEST_SHIP_NAME } from "../../../__helpers__/test-constants";
import {
  SHIP_FIXTURES,
  createShipFixture,
  createShipsApiRequest,
} from "../../../__helpers__/test-api-fixtures";
import { getShips } from "@/lib/game-data";
import { logger } from "@/lib/logger";

// Get the mocked functions
const mockGetShips = getShips as jest.MockedFunction<typeof getShips>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe("GET /api/ships", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetShips.mockReturnValue([
      SHIP_FIXTURES.ARGOSY,
      SHIP_FIXTURES.BACTRIAN,
      createShipFixture({
        name: "Beetle",
        attributes: { category: "ship", hull: 50 },
      }),
    ]);
  });

  it("should return all ships when no query parameters", async () => {
    const request = createShipsApiRequest();

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("count", 3);
    expect(data).toHaveProperty("ships");
    expect(data.ships).toHaveLength(3);
    expect(mockGetShips).toHaveBeenCalledTimes(1);
  });

  it("should filter ships by name query parameter", async () => {
    const request = createShipsApiRequest({ name: TEST_SHIP_NAME });

    mockGetShips.mockReturnValue([
      SHIP_FIXTURES.ARGOSY,
      SHIP_FIXTURES.BACTRIAN,
    ]);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(1);
    expect(data.ships).toHaveLength(1);
    expect(data.ships[0].name).toBe("Argosy");
  });

  it("should filter ships case-insensitively", async () => {
    const request = createShipsApiRequest({ name: "bactrian" });

    mockGetShips.mockReturnValue([
      SHIP_FIXTURES.ARGOSY,
      SHIP_FIXTURES.BACTRIAN,
    ]);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(1);
    expect(data.ships[0].name).toBe("Bactrian");
  });

  it("should return empty array when no ships match filter", async () => {
    const request = createShipsApiRequest({ name: "Nonexistent" });

    mockGetShips.mockReturnValue([SHIP_FIXTURES.ARGOSY]);

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.count).toBe(0);
    expect(data.ships).toHaveLength(0);
  });

  it("should log debug message when loading ships", async () => {
    const request = createShipsApiRequest();

    await GET(request);

    expect(mockLogger.debug).toHaveBeenCalledWith("Loading ships data", {
      url: expect.stringContaining("/api/ships"),
    });
  });

  it("should log info message on successful load", async () => {
    const request = createShipsApiRequest();

    mockGetShips.mockReturnValue([
      SHIP_FIXTURES.ARGOSY,
      SHIP_FIXTURES.BACTRIAN,
    ]);

    await GET(request);

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Ships data loaded successfully",
      {
        total: 2,
        filtered: 2,
      }
    );
  });

  it("should log debug message when filtering", async () => {
    const request = createShipsApiRequest({ name: TEST_SHIP_NAME });

    await GET(request);

    expect(mockLogger.debug).toHaveBeenCalledWith("Filtering ships by name", {
      name: TEST_SHIP_NAME,
    });
  });

  it("should handle errors and return 500 status", async () => {
    const request = createShipsApiRequest();
    const testError = new Error("Test error");
    mockGetShips.mockImplementation(() => {
      throw testError;
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error", "Failed to load ships data");
    expect(data).toHaveProperty("details", "Test error");
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to load ships data",
      testError,
      { url: expect.stringContaining("/api/ships") }
    );
  });

  it("should handle non-Error exceptions", async () => {
    const request = createShipsApiRequest();
    mockGetShips.mockImplementation(() => {
      throw "String error";
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.details).toBe("String error");
  });
});
