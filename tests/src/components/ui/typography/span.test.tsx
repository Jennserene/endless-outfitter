/**
 * Tests for src/components/ui/typography/span.tsx
 */

import { render, screen } from "../../../__helpers__/test-utils";
import { Span } from "@/components/ui/typography";

describe("Span", () => {
  it("renders children text", () => {
    render(<Span>Test span text</Span>);
    expect(screen.getByText("Test span text")).toBeInTheDocument();
  });

  it("renders as span element", () => {
    const { container } = render(<Span>Test span text</Span>);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("Test span text");
  });

  it("applies default variant (no additional classes)", () => {
    const { container } = render(<Span>Test span text</Span>);
    const span = container.querySelector("span");
    expect(span).not.toHaveClass(
      "text-muted-foreground",
      "font-medium",
      "text-xs"
    );
  });

  it("applies muted variant classes", () => {
    const { container } = render(<Span variant="muted">Test span text</Span>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-muted-foreground");
  });

  it("applies medium variant classes", () => {
    const { container } = render(<Span variant="medium">Test span text</Span>);
    const span = container.querySelector("span");
    expect(span).toHaveClass("font-medium");
  });

  it("applies small-muted variant classes", () => {
    const { container } = render(
      <Span variant="small-muted">Test span text</Span>
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-xs", "text-muted-foreground");
  });

  it("merges custom className with variant classes", () => {
    const { container } = render(
      <Span variant="muted" className="custom-class">
        Test span text
      </Span>
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-muted-foreground", "custom-class");
  });

  it("forwards HTML attributes", () => {
    render(
      <Span id="test-id" data-testid="span">
        Test span text
      </Span>
    );
    const span = screen.getByTestId("span");
    expect(span).toHaveAttribute("id", "test-id");
  });
});
