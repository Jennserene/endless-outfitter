import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Page from "../src/app/page";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
  }) => {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={props.src}
        alt={props.alt}
        width={props.width}
        height={props.height}
        className={props.className}
      />
    );
  },
}));

describe("Page", () => {
  it("renders a heading", () => {
    render(<Page />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(
      "To get started, edit the page.tsx file."
    );
  });

  it("renders links", () => {
    render(<Page />);

    const templatesLink = screen.getByRole("link", { name: /templates/i });
    const learningLink = screen.getByRole("link", { name: /learning/i });
    const deployLink = screen.getByRole("link", { name: /deploy now/i });
    const docsLink = screen.getByRole("link", { name: /documentation/i });

    expect(templatesLink).toBeInTheDocument();
    expect(learningLink).toBeInTheDocument();
    expect(deployLink).toBeInTheDocument();
    expect(docsLink).toBeInTheDocument();
  });
});
