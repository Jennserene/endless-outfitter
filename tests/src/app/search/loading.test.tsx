/**
 * Tests for src/app/search/loading.tsx
 * Loading UI for search page
 */

import SearchLoading from "@/app/search/loading";
import { runLoadingComponentTests } from "../../__helpers__/test-loading-component";
import { TEST_MESSAGES } from "../../__helpers__/test-constants";

describe("SearchLoading", () => {
  runLoadingComponentTests({
    LoadingComponent: SearchLoading,
    loadingMessage: TEST_MESSAGES.LOADING_SEARCH,
  });
});
