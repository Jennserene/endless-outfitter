import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import OutfittingPage from "../src/app/outfitting/page";

describe("OutfittingPage", () => {
  it("renders a heading", () => {
    render(<OutfittingPage />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Ship Outfitting");
  });

  it("renders description text", () => {
    render(<OutfittingPage />);

    const description = screen.getByText(
      /Select a ship and configure its outfits/i
    );
    expect(description).toBeInTheDocument();
  });
});
