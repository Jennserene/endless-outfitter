import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { OutfitterProvider } from "../src/stores/outfitter";
import OutfitterPage from "../src/app/outfitter/page";

describe("OutfitterPage", () => {
  it("renders a heading", () => {
    render(
      <OutfitterProvider>
        <OutfitterPage />
      </OutfitterProvider>
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Ship Outfitter");
  });

  it("renders description text", () => {
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
});
