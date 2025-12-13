/**
 * Tests for src/app/outfitter/error.tsx
 * Error boundary for outfitter route
 */

import OutfitterError from "@/app/outfitter/error";
import { runErrorBoundaryTests } from "../../__helpers__/test-error-boundary";

describe("OutfitterError", () => {
  runErrorBoundaryTests({
    ErrorComponent: OutfitterError,
    errorMessagePrefix: "Outfitter page error:",
  });
});
