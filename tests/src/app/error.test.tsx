/**
 * Tests for src/app/error.tsx
 * Error boundary component for the root route segment
 */

import Error from "@/app/error";
import { runErrorBoundaryTests } from "../__helpers__/test-error-boundary";

describe("Error", () => {
  runErrorBoundaryTests({
    ErrorComponent: Error,
    errorMessagePrefix: "Error:",
  });
});
