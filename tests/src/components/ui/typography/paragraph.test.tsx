/**
 * Tests for src/components/ui/typography/paragraph.tsx
 */

import { render, screen } from "../../../__helpers__/test-utils";
import { Paragraph } from "@/components/ui/typography";

describe("Paragraph", () => {
  it("renders children text", () => {
    render(<Paragraph>Test paragraph text</Paragraph>);
    expect(screen.getByText("Test paragraph text")).toBeInTheDocument();
  });

  it("renders as p element", () => {
    const { container } = render(<Paragraph>Test paragraph text</Paragraph>);
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveTextContent("Test paragraph text");
  });

  it("applies default classes", () => {
    const { container } = render(<Paragraph>Test paragraph text</Paragraph>);
    const paragraph = container.querySelector("p");
    expect(paragraph).toHaveClass("leading-7");
  });

  it("merges custom className with default classes", () => {
    const { container } = render(
      <Paragraph className="custom-class">Test paragraph text</Paragraph>
    );
    const paragraph = container.querySelector("p");
    expect(paragraph).toHaveClass("leading-7", "custom-class");
  });

  it("forwards HTML attributes", () => {
    render(
      <Paragraph id="test-id" data-testid="paragraph">
        Test paragraph text
      </Paragraph>
    );
    const paragraph = screen.getByTestId("paragraph");
    expect(paragraph).toHaveAttribute("id", "test-id");
  });
});
