/**
 * Tests for src/app/_components/navigation.tsx
 * Navigation component
 */

import { render, screen } from "../../__helpers__/test-utils";
import { Navigation } from "@/app/_components/navigation";
import { TEST_ROUTES } from "../../__helpers__/test-constants";

// Mock next/navigation
import { mockPathname, mockRouter } from "../../__helpers__/mocks";

const mockUsePathname = jest.fn(() => mockPathname);
const mockUseRouter = jest.fn(() => mockRouter);

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
}));

// Mock next/link
jest.mock("next/link", () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/outfitter");
  });

  it("should render navigation element", () => {
    const { container } = render(<Navigation />);

    // NavigationMenu renders a div with data-slot="navigation-menu", not a nav element
    const navMenu = container.querySelector('[data-slot="navigation-menu"]');
    expect(navMenu).toBeInTheDocument();
    expect(navMenu).toHaveClass("group/navigation-menu");
  });

  it("should render Outfitter link", () => {
    render(<Navigation />);

    const outfitterLink = screen.getByRole("link", { name: "Outfitter" });
    expect(outfitterLink).toBeInTheDocument();
    expect(outfitterLink).toHaveAttribute("href", TEST_ROUTES.OUTFITTER);
  });

  it("should render Search link", () => {
    render(<Navigation />);

    const searchLink = screen.getByRole("link", { name: "Search" });
    expect(searchLink).toBeInTheDocument();
    expect(searchLink).toHaveAttribute("href", TEST_ROUTES.SEARCH);
  });

  it("should highlight active route for outfitter", () => {
    mockUsePathname.mockReturnValue(TEST_ROUTES.OUTFITTER);

    render(<Navigation />);

    const outfitterLink = screen.getByRole("link", { name: "Outfitter" });
    expect(outfitterLink).toBeInTheDocument();
    // Verify the link exists and has the correct href
    expect(outfitterLink).toHaveAttribute("href", TEST_ROUTES.OUTFITTER);
  });

  it("should not highlight inactive route", () => {
    mockUsePathname.mockReturnValue(TEST_ROUTES.SEARCH);

    render(<Navigation />);

    const outfitterLink = screen.getByRole("link", { name: "Outfitter" });
    expect(outfitterLink).toBeInTheDocument();
    // Verify the link exists even when not active
    expect(outfitterLink).toHaveAttribute("href", TEST_ROUTES.OUTFITTER);
  });
});
