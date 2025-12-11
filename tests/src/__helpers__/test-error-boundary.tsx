/**
 * Test helper for error boundary components
 * Provides reusable test utilities for error boundary testing
 */

import { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createErrorFixture, createTestError } from "./test-fixtures";
import { setupConsoleErrorSpy } from "./test-helpers";
import { TEST_MESSAGES } from "./test-constants";

export interface ErrorBoundaryTestOptions {
  /**
   * The error boundary component to test
   */
  ErrorComponent: (props: {
    error: Error & { digest?: string };
    reset: () => void;
  }) => ReactElement;
  /**
   * The error message prefix expected in console.error calls
   * e.g., "Outfitting page error:" or "Search page error:"
   */
  errorMessagePrefix?: string;
}

/**
 * Setup console error spy for error boundary tests
 * Call this in beforeEach/afterAll hooks
 */
export function setupErrorBoundarySpy() {
  const consoleErrorSpy = setupConsoleErrorSpy();
  return {
    spy: consoleErrorSpy,
    beforeEach: () => consoleErrorSpy.mockClear(),
    afterAll: () => consoleErrorSpy.mockRestore(),
  };
}

/**
 * Test that error boundary renders error message
 */
export function testErrorBoundaryRendersMessage(
  ErrorComponent: (props: {
    error: Error & { digest?: string };
    reset: () => void;
  }) => ReactElement
): void {
  const error = createTestError();
  const reset = jest.fn();

  render(<ErrorComponent error={error} reset={reset} />);

  expect(screen.getByText(TEST_MESSAGES.ERROR_GENERIC)).toBeInTheDocument();
  expect(screen.getByText(error.message)).toBeInTheDocument();
}

/**
 * Test that error boundary reset button works
 */
export async function testErrorBoundaryResetButton(
  ErrorComponent: (props: {
    error: Error & { digest?: string };
    reset: () => void;
  }) => ReactElement
): Promise<void> {
  const user = userEvent.setup();
  const reset = jest.fn();
  const error = createTestError();

  render(<ErrorComponent error={error} reset={reset} />);

  const tryAgainButton = screen.getByRole("button", {
    name: TEST_MESSAGES.TRY_AGAIN,
  });
  await user.click(tryAgainButton);

  expect(reset).toHaveBeenCalledTimes(1);
}

/**
 * Test that error boundary logs to console
 */
export function testErrorBoundaryLogsError(
  ErrorComponent: (props: {
    error: Error & { digest?: string };
    reset: () => void;
  }) => ReactElement,
  consoleErrorSpy: jest.SpyInstance,
  errorMessagePrefix?: string
): void {
  const error = createTestError();
  const reset = jest.fn();

  render(<ErrorComponent error={error} reset={reset} />);

  if (errorMessagePrefix) {
    expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessagePrefix, error);
  } else {
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(String), error);
  }
}

/**
 * Test that error boundary handles error without digest
 */
export function testErrorBoundaryHandlesErrorWithoutDigest(
  ErrorComponent: (props: {
    error: Error & { digest?: string };
    reset: () => void;
  }) => ReactElement
): void {
  const error = createErrorFixture();
  const reset = jest.fn();

  render(<ErrorComponent error={error} reset={reset} />);

  expect(screen.getByText(error.message)).toBeInTheDocument();
}

/**
 * Run all standard error boundary tests
 * Use this helper function to set up all common error boundary tests
 */
export function runErrorBoundaryTests(options: ErrorBoundaryTestOptions): void {
  const { ErrorComponent, errorMessagePrefix } = options;
  const {
    spy: consoleErrorSpy,
    beforeEach: setupBeforeEach,
    afterAll: setupAfterAll,
  } = setupErrorBoundarySpy();

  beforeEach(setupBeforeEach);
  afterAll(setupAfterAll);

  it("should render error message", () => {
    testErrorBoundaryRendersMessage(ErrorComponent);
  });

  it("should call reset when Try again button is clicked", async () => {
    await testErrorBoundaryResetButton(ErrorComponent);
  });

  it("should log error to console", () => {
    testErrorBoundaryLogsError(
      ErrorComponent,
      consoleErrorSpy,
      errorMessagePrefix
    );
  });

  it("should handle error without digest", () => {
    testErrorBoundaryHandlesErrorWithoutDigest(ErrorComponent);
  });
}
