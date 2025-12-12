/**
 * Tests for src/app/search/page.tsx
 * Search page
 */

import { render, screen } from "../../__helpers__/test-utils";
import { TEST_SEARCH_QUERY } from "../../__helpers__/test-constants";
import SearchPage from "@/app/search/page";
import { mockRouter, mockSearchParams } from "../../__helpers__/mocks";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

// Mock search utility
jest.mock("@/lib/utils/search", () => ({
  searchGameData: jest.fn(() => ({ ships: [], outfits: [] })),
}));

describe("SearchPage", () => {
  it("should render main heading", async () => {
    const page = await SearchPage({ searchParams: Promise.resolve({}) });
    const { container } = render(page);

    const heading = container.querySelector("h1");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Search");
  });

  it("should render description text", async () => {
    const page = await SearchPage({ searchParams: Promise.resolve({}) });
    render(page);

    const description = screen.getByText(
      /Search for ships, outfits, and other game data by name/i
    );
    expect(description).toBeInTheDocument();
  });

  it("should render search input when query is not provided", async () => {
    const page = await SearchPage({ searchParams: Promise.resolve({}) });
    render(page);

    const input = screen.getByPlaceholderText(/Search for ships or outfits/i);
    expect(input).toBeInTheDocument();
  });

  it("should render search results when query is provided", async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({ query: TEST_SEARCH_QUERY }),
    });
    render(page);

    const input = screen.getByPlaceholderText(/Search for ships or outfits/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(TEST_SEARCH_QUERY);
  });

  it("should render main element", async () => {
    const page = await SearchPage({ searchParams: Promise.resolve({}) });
    const { container } = render(page);

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
