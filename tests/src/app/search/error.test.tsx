/**
 * Tests for src/app/search/error.tsx
 * Error boundary for search route
 */

import SearchError from "@/app/search/error";
import { runErrorBoundaryTests } from "../../__helpers__/test-error-boundary";

describe("SearchError", () => {
  runErrorBoundaryTests({
    ErrorComponent: SearchError,
    errorMessagePrefix: "Search page error:",
  });
});
