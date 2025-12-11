/**
 * Tests for src/app/loading.tsx
 * Global loading UI component
 */

import GlobalLoading from "@/app/loading";
import { runLoadingComponentTests } from "../__helpers__/test-loading-component";
import { TEST_MESSAGES } from "../__helpers__/test-constants";

describe("GlobalLoading", () => {
  runLoadingComponentTests({
    LoadingComponent: GlobalLoading,
    loadingMessage: TEST_MESSAGES.LOADING_GENERIC,
  });
});
