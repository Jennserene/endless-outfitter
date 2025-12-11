/**
 * Tests for src/app/search/page.tsx
 * Search page
 */

import { render, screen } from "../../__helpers__/test-utils";
import {
  TEST_SEARCH_QUERY,
  TEST_SEARCH_TYPE,
} from "../../__helpers__/test-constants";
import SearchPage from "@/app/search/page";

describe("SearchPage", () => {
  it("should render main heading", () => {
    render(<SearchPage searchParams={{}} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Search");
  });

  it("should render description text", () => {
    render(<SearchPage searchParams={{}} />);

    const description = screen.getByText(
      /Search for ships, outfits, and other game data/i
    );
    expect(description).toBeInTheDocument();
  });

  it("should not render search query when not provided", () => {
    render(<SearchPage searchParams={{}} />);

    expect(screen.queryByText(/Search query:/)).not.toBeInTheDocument();
  });

  it("should render search query when provided", () => {
    render(
      <SearchPage
        searchParams={{ query: TEST_SEARCH_QUERY, type: TEST_SEARCH_TYPE }}
      />
    );

    expect(
      screen.getByText(
        new RegExp(
          `Search query: ${TEST_SEARCH_QUERY}.*type: ${TEST_SEARCH_TYPE}`
        )
      )
    ).toBeInTheDocument();
  });

  it("should use default type 'all' when not provided", () => {
    render(<SearchPage searchParams={{ query: TEST_SEARCH_QUERY }} />);

    expect(
      screen.getByText(
        new RegExp(`Search query: ${TEST_SEARCH_QUERY}.*type: all`)
      )
    ).toBeInTheDocument();
  });

  it("should use empty string for query when not provided", () => {
    render(<SearchPage searchParams={{ type: "ships" }} />);

    expect(screen.queryByText(/Search query:/)).not.toBeInTheDocument();
  });

  it("should render main element", () => {
    const { container } = render(<SearchPage searchParams={{}} />);

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
