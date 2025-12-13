/**
 * Tests for src/components/ui/typography/heading1.tsx
 */

import { render, screen } from "../../../__helpers__/test-utils";
import { Heading1 } from "@/components/ui/typography";

describe("Heading1", () => {
  it("renders children text", () => {
    render(<Heading1>Test Heading</Heading1>);
    expect(screen.getByText("Test Heading")).toBeInTheDocument();
  });

  it("renders as h1 element", () => {
    const { container } = render(<Heading1>Test Heading</Heading1>);
    const heading = container.querySelector("h1");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Heading");
  });

  it("applies default classes", () => {
    const { container } = render(<Heading1>Test Heading</Heading1>);
    const heading = container.querySelector("h1");
    expect(heading).toHaveClass("text-3xl", "font-bold", "mb-4");
  });

  it("merges custom className with default classes", () => {
    const { container } = render(
      <Heading1 className="custom-class">Test Heading</Heading1>
    );
    const heading = container.querySelector("h1");
    expect(heading).toHaveClass(
      "text-3xl",
      "font-bold",
      "mb-4",
      "custom-class"
    );
  });

  it("forwards HTML attributes", () => {
    render(
      <Heading1 id="test-id" data-testid="heading-1">
        Test Heading
      </Heading1>
    );
    const heading = screen.getByTestId("heading-1");
    expect(heading).toHaveAttribute("id", "test-id");
  });
});
