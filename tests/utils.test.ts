import { cn } from "../src/lib/utils";

describe("cn utility function", () => {
  it("When merging class names, Then should combine them with space", () => {
    // Act
    const result = cn("foo", "bar");

    // Assert
    expect(result).toBe("foo bar");
  });

  it("When handling conditional classes, Then should filter out falsy values", () => {
    // Act
    const result = cn("foo", false && "bar", "baz");

    // Assert
    expect(result).toBe("foo baz");
  });

  it("When merging Tailwind classes, Then should deduplicate conflicting classes", () => {
    // Act
    const result = cn("px-2 py-1", "px-4");

    // Assert
    // tailwind-merge should deduplicate and keep px-4
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("When input is empty, Then should return empty string", () => {
    // Act
    const result = cn();

    // Assert
    expect(result).toBe("");
  });

  it("When input contains undefined and null, Then should filter them out", () => {
    // Act
    const result = cn("foo", undefined, null, "bar");

    // Assert
    expect(result).toBe("foo bar");
  });
});
