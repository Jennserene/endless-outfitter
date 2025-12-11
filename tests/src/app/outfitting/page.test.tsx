/**
 * Tests for src/app/outfitting/page.tsx
 * Ship Outfitting page
 */

import { render, screen } from "../../__helpers__/test-utils";
import OutfittingPage from "@/app/outfitting/page";

describe("OutfittingPage", () => {
  it("should render main heading", () => {
    render(<OutfittingPage />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Ship Outfitting");
  });

  it("should render description text", () => {
    render(<OutfittingPage />);

    const description = screen.getByText(
      /Select a ship and configure its outfits/i
    );
    expect(description).toBeInTheDocument();
  });

  it("should render main element", () => {
    const { container } = render(<OutfittingPage />);

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
