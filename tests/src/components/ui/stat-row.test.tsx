/**
 * Tests for src/components/ui/stat-row.tsx
 */

import { render, screen } from "../../__helpers__/test-utils";
import { StatRow } from "@/components/ui/stat-row";

describe("StatRow", () => {
  it("renders label and value", () => {
    render(<StatRow label="Test Label" value="Test Value" />);
    expect(screen.getByText("Test Label:")).toBeInTheDocument();
    expect(screen.getByText("Test Value")).toBeInTheDocument();
  });

  it("formats number values", () => {
    render(<StatRow label="Shields" value={1000} />);
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("formats small numbers with decimals", () => {
    render(<StatRow label="Mass" value={123.45} />);
    expect(screen.getByText("123.45")).toBeInTheDocument();
  });

  it("adds unit to value", () => {
    render(<StatRow label="Mass" value={100} unit="tons" />);
    expect(screen.getByText("100 tons")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatRow label="Test" value="Value" className="custom-class" />
    );
    const row = container.querySelector("div");
    expect(row).toHaveClass("custom-class");
  });

  it("renders string values without formatting", () => {
    render(<StatRow label="Crew" value="5 / 10" />);
    expect(screen.getByText("5 / 10")).toBeInTheDocument();
  });
});
