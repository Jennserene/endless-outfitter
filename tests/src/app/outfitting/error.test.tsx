/**
 * Tests for src/app/outfitting/error.tsx
 * Error boundary for outfitting route
 */

import OutfittingError from "@/app/outfitting/error";
import { runErrorBoundaryTests } from "../../__helpers__/test-error-boundary";

describe("OutfittingError", () => {
  runErrorBoundaryTests({
    ErrorComponent: OutfittingError,
    errorMessagePrefix: "Outfitting page error:",
  });
});
