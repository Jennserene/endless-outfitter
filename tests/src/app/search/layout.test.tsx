/**
 * Tests for src/app/search/layout.tsx
 * Layout for search route
 */

import SearchLayout from "@/app/search/layout";
import { runLayoutComponentTests } from "../../__helpers__/test-layout-component";

describe("SearchLayout", () => {
  runLayoutComponentTests({
    LayoutComponent: SearchLayout,
  });
});
