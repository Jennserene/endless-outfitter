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
      { id: "1", name: "Argosy", hull: 100 },
      { id: "2", name: "Bactrian", hull: 200 },
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
      { id: "1", name: "Argosy" },
      { id: "2", name: "Bactrian" },
      { id: "3", name: "Beetle" },
    ]);

    const page = await ShipsPage();
    render(page);

    expect(screen.getByText(/Total ships: 3/i)).toBeInTheDocument();
  });

  it("should call getShips to load data", async () => {
    await ShipsPage();

    expect(mockGetShips).toHaveBeenCalledTimes(1);
  });

  it("should display zero when no ships", async () => {
    mockGetShips.mockReturnValue([]);

    const page = await ShipsPage();
    render(page);

    expect(screen.getByText(/Total ships: 0/i)).toBeInTheDocument();
  });
});
