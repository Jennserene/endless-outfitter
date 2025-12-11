/**
 * Tests for src/app/outfitting/loading.tsx
 * Loading UI for outfitting page
 */

import OutfittingLoading from "@/app/outfitting/loading";
import { runLoadingComponentTests } from "../../__helpers__/test-loading-component";
import { TEST_MESSAGES } from "../../__helpers__/test-constants";

describe("OutfittingLoading", () => {
  runLoadingComponentTests({
    LoadingComponent: OutfittingLoading,
    loadingMessage: TEST_MESSAGES.LOADING_OUTFITTING,
  });
});
