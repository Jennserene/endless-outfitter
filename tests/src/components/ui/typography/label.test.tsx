/**
 * Tests for src/components/ui/typography/label.tsx
 */

import { render, screen } from "../../../__helpers__/test-utils";
import { Label } from "@/components/ui/typography";

describe("Label", () => {
  it("renders children text", () => {
    render(<Label>Test label text</Label>);
    expect(screen.getByText("Test label text")).toBeInTheDocument();
  });

  it("renders as label element", () => {
    const { container } = render(<Label>Test label text</Label>);
    const label = container.querySelector("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label text");
  });

  it("applies default classes", () => {
    const { container } = render(<Label>Test label text</Label>);
    const label = container.querySelector("label");
    expect(label).toHaveClass("text-sm", "font-medium", "mb-2", "block");
  });

  it("merges custom className with default classes", () => {
    const { container } = render(
      <Label className="custom-class">Test label text</Label>
    );
    const label = container.querySelector("label");
    expect(label).toHaveClass(
      "text-sm",
      "font-medium",
      "mb-2",
      "block",
      "custom-class"
    );
  });

  it("forwards HTML attributes", () => {
    render(
      <Label htmlFor="input-id" id="test-id" data-testid="label">
        Test label text
      </Label>
    );
    const label = screen.getByTestId("label");
    expect(label).toHaveAttribute("id", "test-id");
    expect(label).toHaveAttribute("for", "input-id");
  });
});
