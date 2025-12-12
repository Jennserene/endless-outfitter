/**
 * Tests for src/app/ships/page.tsx
 * Ships page
 */

import { render, screen } from "../../__helpers__/test-utils";
import ShipsPage from "@/app/ships/page";

// Create mock
const mockGetShips = jest.fn();

// Mock the module
jest.mock("@/lib/game-data", () => ({
  getShips: () => mockGetShips(),
}));

describe("ShipsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetShips.mockReturnValue([
      {
        name: "Argosy",
        attributes: {
          category: "Transport",
          cost: 100000,
          hull: 100,
          shields: 50,
          "outfit space": 100,
        },
        outfits: [],
        descriptions: [],
      },
      {
        name: "Bactrian",
        attributes: {
          category: "Transport",
          cost: 200000,
          hull: 200,
          shields: 100,
          "outfit space": 200,
        },
        outfits: [],
        descriptions: [],
      },
    ]);
  });

  it("should render heading", async () => {
    const page = await ShipsPage();
    const { container } = render(page);

    const heading = container.querySelector("h1");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Ships");
  });

  it("should display total ships count", async () => {
    mockGetShips.mockReturnValue([
      {
        name: "Argosy",
        attributes: {
          category: "Transport",
          cost: 100000,
          hull: 100,
          "outfit space": 100,
        },
        outfits: [],
        descriptions: [],
      },
      {
        name: "Bactrian",
        attributes: {
          category: "Transport",
          cost: 200000,
          hull: 200,
          "outfit space": 200,
        },
        outfits: [],
        descriptions: [],
      },
      {
        name: "Beetle",
        attributes: {
          category: "Fighter",
          cost: 50000,
          hull: 50,
          "outfit space": 50,
        },
        outfits: [],
        descriptions: [],
      },
    ]);

    const page = await ShipsPage();
    render(page);

    expect(screen.getByText(/3 total ship/i)).toBeInTheDocument();
  });

  it("should call getShips to load data", async () => {
    await ShipsPage();

    expect(mockGetShips).toHaveBeenCalledTimes(1);
  });

  it("should display zero when no ships", async () => {
    mockGetShips.mockReturnValue([]);

    const page = await ShipsPage();
    render(page);

    expect(screen.getByText(/0 total ship/i)).toBeInTheDocument();
  });
});
