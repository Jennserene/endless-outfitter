/**
 * Tests for src/app/provider.tsx
 * Global providers wrapper component
 */

import { render, screen } from "../__helpers__/test-utils";
import { AppProvider } from "@/app/provider";

describe("AppProvider", () => {
  it("should render children", () => {
    render(
      <AppProvider>
        <div data-testid="test-child">Test content</div>
      </AppProvider>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <AppProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </AppProvider>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });
});
