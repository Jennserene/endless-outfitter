/**
 * Tests for src/components/ui/typography/heading2.tsx
 */

import { render, screen } from "../../../__helpers__/test-utils";
import { Heading2 } from "@/components/ui/typography";

describe("Heading2", () => {
  it("renders children text", () => {
    render(<Heading2>Test Heading</Heading2>);
    expect(screen.getByText("Test Heading")).toBeInTheDocument();
  });

  it("renders as h2 element", () => {
    const { container } = render(<Heading2>Test Heading</Heading2>);
    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Heading");
  });

  it("applies default classes", () => {
    const { container } = render(<Heading2>Test Heading</Heading2>);
    const heading = container.querySelector("h2");
    expect(heading).toHaveClass("text-lg", "font-semibold");
  });

  it("merges custom className with default classes", () => {
    const { container } = render(
      <Heading2 className="custom-class">Test Heading</Heading2>
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveClass("text-lg", "font-semibold", "custom-class");
  });

  it("forwards HTML attributes", () => {
    render(
      <Heading2 id="test-id" data-testid="heading-2">
        Test Heading
      </Heading2>
    );
    const heading = screen.getByTestId("heading-2");
    expect(heading).toHaveAttribute("id", "test-id");
  });
});
