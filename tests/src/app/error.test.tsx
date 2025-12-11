/**
 * Tests for src/app/error.tsx
 * Global error boundary component
 */

import GlobalError from "@/app/error";
import { runErrorBoundaryTests } from "../__helpers__/test-error-boundary";

describe("GlobalError", () => {
  runErrorBoundaryTests({
    ErrorComponent: GlobalError,
    errorMessagePrefix: "Global error:",
  });
});
