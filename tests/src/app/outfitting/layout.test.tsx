/**
 * Tests for src/app/outfitting/layout.tsx
 * Layout for outfitting route
 */

import OutfittingLayout from "@/app/outfitting/layout";
import { runLayoutComponentTests } from "../../__helpers__/test-layout-component";

describe("OutfittingLayout", () => {
  runLayoutComponentTests({
    LayoutComponent: OutfittingLayout,
  });
});
