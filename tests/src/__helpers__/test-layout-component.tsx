/**
 * Test helper for layout components
 * Provides reusable test utilities for layout component testing
 */

import { ReactElement, ReactNode } from "react";
import { render, screen } from "@testing-library/react";

export interface LayoutComponentTestOptions {
  /**
   * The layout component to test
   */
  LayoutComponent: (props: { children: ReactNode }) => ReactElement;
}

/**
 * Test that layout component renders children
 */
export function testLayoutComponentRendersChildren(
  LayoutComponent: (props: { children: ReactNode }) => ReactElement
): void {
  render(
    <LayoutComponent>
      <div data-testid="test-child">Test content</div>
    </LayoutComponent>
  );

  expect(screen.getByTestId("test-child")).toBeInTheDocument();
  expect(screen.getByText("Test content")).toBeInTheDocument();
}

/**
 * Test that layout component renders multiple children
 */
export function testLayoutComponentRendersMultipleChildren(
  LayoutComponent: (props: { children: ReactNode }) => ReactElement
): void {
  render(
    <LayoutComponent>
      <div data-testid="child-1">Child 1</div>
      <div data-testid="child-2">Child 2</div>
    </LayoutComponent>
  );

  expect(screen.getByTestId("child-1")).toBeInTheDocument();
  expect(screen.getByTestId("child-2")).toBeInTheDocument();
}

/**
 * Run all standard layout component tests
 * Use this helper function to set up all common layout component tests
 */
export function runLayoutComponentTests(
  options: LayoutComponentTestOptions
): void {
  const { LayoutComponent } = options;

  it("should render children", () => {
    testLayoutComponentRendersChildren(LayoutComponent);
  });

  it("should render multiple children", () => {
    testLayoutComponentRendersMultipleChildren(LayoutComponent);
  });
}
