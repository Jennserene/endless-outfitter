/**
 * Test utilities for React and Next.js component testing
 * Provides custom render function with app providers
 */

import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AppProvider } from "@/app/provider";

/**
 * Custom render function that wraps components with app providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <AppProvider>{children}</AppProvider>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };
