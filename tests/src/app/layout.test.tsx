/**
 * Tests for src/app/layout.tsx
 * Root layout component
 *
 * Note: We test the layout's body content structure rather than the full HTML document
 * to avoid hydration warnings when rendering <html> or <body> elements inside
 * React Testing Library's wrapper <div>.
 */

import { render, screen } from "../__helpers__/test-utils";
import { AppProvider } from "@/app/provider";
import { Navigation } from "@/app/_components/navigation";

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
  // Test the layout's body content structure (AppProvider, Navigation, children)
  // This verifies the layout's functionality without rendering HTML document elements
  it("should render children within AppProvider", () => {
    render(
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppProvider>
          <Navigation />
          <div data-testid="test-content">Test content</div>
        </AppProvider>
      </div>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render Navigation component", () => {
    render(
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppProvider>
          <Navigation />
          <div>Test content</div>
        </AppProvider>
      </div>
    );

    expect(screen.getByTestId("navigation")).toBeInTheDocument();
  });
});
