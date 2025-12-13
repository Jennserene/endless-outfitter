/**
 * Tests for src/app/outfitter/layout.tsx
 * Layout for outfitter route
 */

import OutfitterLayout from "@/app/outfitter/layout";
import { OutfitterProvider } from "@/stores/outfitter";
import { runLayoutComponentTests } from "../../__helpers__/test-layout-component";

describe("OutfitterLayout", () => {
  // Wrap the layout with OutfitterProvider since it uses ShipManager which requires it
  const LayoutWithProvider = ({ children }: { children: React.ReactNode }) => (
    <OutfitterProvider>
      <OutfitterLayout>{children}</OutfitterLayout>
    </OutfitterProvider>
  );

  runLayoutComponentTests({
    LayoutComponent: LayoutWithProvider,
  });
});
