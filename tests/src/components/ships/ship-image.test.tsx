/**
 * Tests for src/components/ships/ship-image.tsx
 */

import { render, screen } from "../../__helpers__/test-utils";
import { ShipImage } from "@/components/ships/ship-image";

describe("ShipImage", () => {
  it("renders ship name", () => {
    render(<ShipImage shipName="Test Ship" />);
    expect(screen.getByText("Test Ship")).toBeInTheDocument();
  });

  it("renders ship name as heading", () => {
    const { container } = render(<ShipImage shipName="Test Ship" />);
    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Ship");
  });

  it("renders thumbnail image when thumbnail is provided", () => {
    const { container } = render(
      <ShipImage shipName="Test Ship" thumbnail="thumbnail/kestrel" />
    );
    // When thumbnail is provided, there should be 2 images: frame and thumbnail
    const images = container.querySelectorAll("img");
    expect(images.length).toBe(2);
    // Find the thumbnail image by its alt text (frame image has empty alt)
    const thumbnailImage = screen.getByAltText("Test Ship");
    expect(thumbnailImage).toBeInTheDocument();
    // Verify it's an img element
    expect(thumbnailImage.tagName).toBe("IMG");
  });

  it("uses default frame image", () => {
    const { container } = render(<ShipImage shipName="Test Ship" />);
    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("shipyard-selected.png")
    );
  });

  it("uses custom frame image when provided", () => {
    const { container } = render(
      <ShipImage shipName="Test Ship" frameImage="/custom-frame.png" />
    );
    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("custom-frame.png")
    );
  });
});
