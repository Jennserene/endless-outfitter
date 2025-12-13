/**
 * Tests for src/app/outfitter/loading.tsx
 * Loading UI for outfitter page
 */

import OutfitterLoading from "@/app/outfitter/loading";
import { runLoadingComponentTests } from "../../__helpers__/test-loading-component";
import { TEST_MESSAGES } from "../../__helpers__/test-constants";

describe("OutfitterLoading", () => {
  runLoadingComponentTests({
    LoadingComponent: OutfitterLoading,
    loadingMessage: TEST_MESSAGES.LOADING_OUTFITTER,
  });
});
