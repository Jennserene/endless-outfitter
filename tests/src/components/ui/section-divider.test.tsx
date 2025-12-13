/**
 * Tests for src/components/ui/section-divider.tsx
 */

import { render } from "../../__helpers__/test-utils";
import { SectionDivider } from "@/components/ui/section-divider";

describe("SectionDivider", () => {
  it("renders a divider element", () => {
    const { container } = render(<SectionDivider />);
    const divider = container.querySelector("div");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveClass("h-px", "bg-border");
  });
});
