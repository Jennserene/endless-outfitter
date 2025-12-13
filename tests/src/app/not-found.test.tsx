/**
 * Tests for src/app/not-found.tsx
 * Global 404 page component
 */

import { render, screen } from "../__helpers__/test-utils";
import NotFound from "@/app/not-found";
import { TEST_MESSAGES, TEST_ROUTES } from "../__helpers__/test-constants";

// Mock next/link - using centralized mock pattern
jest.mock("next/link", () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("NotFound", () => {
  it("should render 404 heading", () => {
    render(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(TEST_MESSAGES.NOT_FOUND_TITLE);
  });

  it("should render not found message", () => {
    render(<NotFound />);

    expect(
      screen.getByText(TEST_MESSAGES.NOT_FOUND_MESSAGE)
    ).toBeInTheDocument();
  });

  it("should render link to outfitter page", () => {
    render(<NotFound />);

    const link = screen.getByRole("link", {
      name: TEST_MESSAGES.GO_TO_OUTFITTER,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", TEST_ROUTES.OUTFITTER);
  });
});
