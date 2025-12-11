/**
 * Test helper for loading components
 * Provides reusable test utilities for loading component testing
 */

import { ReactElement } from "react";
import { render, screen } from "@testing-library/react";

export interface LoadingComponentTestOptions {
  /**
   * The loading component to test
   */
  LoadingComponent: () => ReactElement;
  /**
   * The expected loading message text
   */
  loadingMessage: string;
}

/**
 * Test that loading component renders spinner
 */
export function testLoadingComponentSpinner(
  LoadingComponent: () => ReactElement
): void {
  const { container } = render(<LoadingComponent />);

  // Check for spinner by looking for animate-spin class
  // The actual class structure may vary, so we check for the key class
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeInTheDocument();
}

/**
 * Test that loading component renders loading text
 */
export function testLoadingComponentText(
  LoadingComponent: () => ReactElement,
  loadingMessage: string
): void {
  render(<LoadingComponent />);

  expect(screen.getByText(loadingMessage)).toBeInTheDocument();
}

/**
 * Run all standard loading component tests
 * Use this helper function to set up all common loading component tests
 */
export function runLoadingComponentTests(
  options: LoadingComponentTestOptions
): void {
  const { LoadingComponent, loadingMessage } = options;

  it("should render loading spinner", () => {
    testLoadingComponentSpinner(LoadingComponent);
  });

  it("should render loading text", () => {
    testLoadingComponentText(LoadingComponent, loadingMessage);
  });
}
