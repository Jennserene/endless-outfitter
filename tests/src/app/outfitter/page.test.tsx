/**
 * Tests for src/app/outfitter/page.tsx
 * Ship Outfitter page
 */

import { render, screen } from "../../__helpers__/test-utils";
import { OutfitterProvider } from "@/stores/outfitter";
import OutfitterPage from "@/app/outfitter/page";

describe("OutfitterPage", () => {
  it("should render main heading", () => {
    render(
      <OutfitterProvider>
        <OutfitterPage />
      </OutfitterProvider>
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Ship Outfitter");
  });

  it("should render description text", () => {
    render(
      <OutfitterProvider>
        <OutfitterPage />
      </OutfitterProvider>
    );

    const description = screen.getByText(
      /Select a ship and configure its outfits/i
    );
    expect(description).toBeInTheDocument();
  });

  it("should render main element", () => {
    const { container } = render(
      <OutfitterProvider>
        <OutfitterPage />
      </OutfitterProvider>
    );

    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });
});
