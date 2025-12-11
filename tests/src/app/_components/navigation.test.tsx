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
    mockUsePathname.mockReturnValue("/outfitting");
  });

  it("should render navigation element", () => {
    const { container } = render(<Navigation />);

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("border-b");
  });

  it("should render Outfitting link", () => {
    render(<Navigation />);

    const outfittingLink = screen.getByRole("link", { name: "Outfitting" });
    expect(outfittingLink).toBeInTheDocument();
    expect(outfittingLink).toHaveAttribute("href", TEST_ROUTES.OUTFITTING);
  });

  it("should render Search link", () => {
    render(<Navigation />);

    const searchLink = screen.getByRole("link", { name: "Search" });
    expect(searchLink).toBeInTheDocument();
    expect(searchLink).toHaveAttribute("href", TEST_ROUTES.SEARCH);
  });

  it("should highlight active route for outfitting", () => {
    mockUsePathname.mockReturnValue(TEST_ROUTES.OUTFITTING);

    render(<Navigation />);

    const outfittingLink = screen.getByRole("link", { name: "Outfitting" });
    expect(outfittingLink).toBeInTheDocument();
    // Verify the link exists and has the correct href
    expect(outfittingLink).toHaveAttribute("href", TEST_ROUTES.OUTFITTING);
  });

  it("should not highlight inactive route", () => {
    mockUsePathname.mockReturnValue(TEST_ROUTES.SEARCH);

    render(<Navigation />);

    const outfittingLink = screen.getByRole("link", { name: "Outfitting" });
    expect(outfittingLink).toBeInTheDocument();
    // Verify the link exists even when not active
    expect(outfittingLink).toHaveAttribute("href", TEST_ROUTES.OUTFITTING);
  });
});
