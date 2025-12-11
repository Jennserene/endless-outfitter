/**
 * Tests for src/app/layout.tsx
 * Root layout component
 */

import { render, screen } from "../__helpers__/test-utils";
import RootLayout from "@/app/layout";

// Mock next/font/google - using centralized mock pattern
jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({
    variable: "--font-geist-sans",
  })),
  Geist_Mono: jest.fn(() => ({
    variable: "--font-geist-mono",
  })),
}));

// Mock Navigation component
jest.mock("@/app/_components/navigation", () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
}));

describe("RootLayout", () => {
  it("should render children", () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render Navigation component", () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });
});
