import {
  parseLineValues,
  shouldSkipLine,
  extractKeyValue,
  findParentNode,
} from "@scripts/parsers/line-parser";

describe("line-parser", () => {
  describe("parseLineValues", () => {
    it("When parsing simple space-separated values, Then should return array of strings", () => {
      // Act
      const result = parseLineValues("foo bar baz");

      // Assert
      expect(result).toEqual(["foo", "bar", "baz"]);
    });

    it("When parsing numeric values, Then should return array of numbers", () => {
      // Act
      const result = parseLineValues("100 200 300");

      // Assert
      expect(result).toEqual([100, 200, 300]);
    });

    it("When parsing mixed strings and numbers, Then should return array with correct types", () => {
      // Act
      const result = parseLineValues("ship 100 0.5");

      // Assert
      expect(result).toEqual(["ship", 100, 0.5]);
    });

    it("When parsing quoted strings, Then should return unquoted values", () => {
      // Act
      const result = parseLineValues('"quoted string" unquoted');

      // Assert
      expect(result).toEqual(["quoted string", "unquoted"]);
    });

    it("When parsing backtick-quoted strings, Then should return unquoted values", () => {
      // Act
      const result = parseLineValues("`backtick string` normal");

      // Assert
      expect(result).toEqual(["backtick string", "normal"]);
    });

    it("When parsing quoted strings with spaces, Then should preserve spaces within quotes", () => {
      // Act
      const result = parseLineValues('"multi word string" value');

      // Assert
      expect(result).toEqual(["multi word string", "value"]);
    });

    it("When parsing empty quoted strings, Then should return empty string", () => {
      // Act
      const result = parseLineValues('"" value');

      // Assert
      expect(result).toEqual(["", "value"]);
    });

    it("When parsing decimal numbers, Then should return array of decimal numbers", () => {
      // Act
      const result = parseLineValues("1.5 2.75 0.1");

      // Assert
      expect(result).toEqual([1.5, 2.75, 0.1]);
    });

    it("When parsing negative numbers, Then should return array of negative numbers", () => {
      // Act
      const result = parseLineValues("-100 -0.5");

      // Assert
      expect(result).toEqual([-100, -0.5]);
    });

    it("When parsing values with multiple spaces, Then should ignore extra spaces", () => {
      // Act
      const result = parseLineValues("foo    bar     baz");

      // Assert
      expect(result).toEqual(["foo", "bar", "baz"]);
    });

    it("When parsing values with leading and trailing spaces, Then should trim spaces", () => {
      // Act
      const result = parseLineValues("  foo bar  ");

      // Assert
      expect(result).toEqual(["foo", "bar"]);
    });

    it("When parsing empty string, Then should return empty array", () => {
      // Act
      const result = parseLineValues("");

      // Assert
      expect(result).toEqual([]);
    });

    it("When parsing string that looks like number, Then should return as string", () => {
      // Act
      const result = parseLineValues("abc123 def456");

      // Assert
      expect(result).toEqual(["abc123", "def456"]);
    });

    it("When parsing Infinity and NaN, Then should return as strings", () => {
      // Act
      const result = parseLineValues("Infinity NaN");

      // Assert
      expect(result).toEqual(["Infinity", "NaN"]);
    });

    it("When parsing escaped quotes inside quoted strings, Then should preserve backslashes", () => {
      // Act
      const result = parseLineValues('"string with \\"quote\\""');

      // Assert
      expect(result).toEqual(['string with \\"quote\\"']);
    });

    it("When parsing mixed quote types, Then should handle all quote types correctly", () => {
      // Act
      const result = parseLineValues('"double" `backtick` normal');

      // Assert
      expect(result).toEqual(["double", "backtick", "normal"]);
    });
  });

  describe("shouldSkipLine", () => {
    it("When line is empty or whitespace only, Then should return true", () => {
      // Assert
      expect(shouldSkipLine("")).toBe(true);
      expect(shouldSkipLine("   ")).toBe(true);
      expect(shouldSkipLine("\t\t")).toBe(true);
    });

    it("When line starts with comment character, Then should return true", () => {
      // Assert
      expect(shouldSkipLine("# comment")).toBe(true);
      expect(shouldSkipLine("  # comment with spaces")).toBe(true);
      expect(shouldSkipLine("#")).toBe(true);
    });

    it("When line contains regular content, Then should return false", () => {
      // Assert
      expect(shouldSkipLine("ship Test Ship")).toBe(false);
      expect(shouldSkipLine("  ship Test Ship")).toBe(false);
      expect(shouldSkipLine("outfit Test Outfit")).toBe(false);
    });

    it("When line contains # in the middle, Then should return false", () => {
      // Assert
      expect(shouldSkipLine("ship Test # Ship")).toBe(false);
      expect(shouldSkipLine('ship "Test # Ship"')).toBe(false);
    });
  });

  describe("extractKeyValue", () => {
    it("When extracting unquoted key and value, Then should return key and rest of line", () => {
      // Act
      const result = extractKeyValue("ship Test Ship");

      // Assert
      expect(result).toEqual({
        key: "ship",
        restOfLine: "Test Ship",
      });
    });

    it("When extracting unquoted key with no value, Then should return key and empty rest", () => {
      // Act
      const result = extractKeyValue("ship");

      // Assert
      expect(result).toEqual({
        key: "ship",
        restOfLine: "",
      });
    });

    it("When extracting quoted key and value, Then should return unquoted key and rest", () => {
      // Act
      const result = extractKeyValue('"ship name" 100 200');

      // Assert
      expect(result).toEqual({
        key: "ship name",
        restOfLine: "100 200",
      });
    });

    it("When extracting quoted key with no value, Then should return unquoted key and empty rest", () => {
      // Act
      const result = extractKeyValue('"ship name"');

      // Assert
      expect(result).toEqual({
        key: "ship name",
        restOfLine: "",
      });
    });

    it("When extracting quoted key with spaces in value, Then should preserve value", () => {
      // Act
      const result = extractKeyValue('"ship name" mass 100');

      // Assert
      expect(result).toEqual({
        key: "ship name",
        restOfLine: "mass 100",
      });
    });

    it("When extracting malformed quoted key, Then should return null", () => {
      // Act
      const result = extractKeyValue('"unclosed quote');

      // Assert
      expect(result).toBeNull();
    });

    it("When extracting empty quoted key, Then should return empty key", () => {
      // Act
      const result = extractKeyValue('"" value');

      // Assert
      expect(result).toEqual({
        key: "",
        restOfLine: "value",
      });
    });

    it("When extracting key with multiple spaces, Then should ignore extra spaces", () => {
      // Act
      const result = extractKeyValue("ship    Test Ship");

      // Assert
      expect(result).toEqual({
        key: "ship",
        restOfLine: "Test Ship",
      });
    });

    it("When extracting key with tabs, Then should handle tabs correctly", () => {
      // Act
      const result = extractKeyValue("ship\tTest Ship");

      // Assert
      expect(result).toEqual({
        key: "ship",
        restOfLine: "Test Ship",
      });
    });

    it("When extracting from empty string, Then should return null", () => {
      // Act
      const result = extractKeyValue("");

      // Assert
      expect(result).toBeNull();
    });

    it("When extracting key with special characters, Then should preserve special characters", () => {
      // Act
      const result = extractKeyValue("ship-name Test Ship");

      // Assert
      expect(result).toEqual({
        key: "ship-name",
        restOfLine: "Test Ship",
      });
    });
  });

  describe("findParentNode", () => {
    interface TestNode {
      indent: number;
      name: string;
    }

    it("When finding parent with smaller indent, Then should return parent and update stack", () => {
      // Arrange
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "child1" },
        { indent: 2, name: "child2" },
      ];

      // Act
      const parent = findParentNode(stack, 1);

      // Assert
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
    });

    it("When finding parent with same indent level, Then should return parent", () => {
      // Arrange
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "child1" },
      ];

      // Act
      const parent = findParentNode(stack, 1);

      // Assert
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
    });

    it("When no parent exists, Then should return null", () => {
      // Arrange
      const stack: TestNode[] = [];

      // Act
      const parent = findParentNode(stack, 0);

      // Assert
      expect(parent).toBeNull();
    });

    it("When indent is less than all nodes, Then should return null and clear stack", () => {
      // Arrange
      const stack: TestNode[] = [
        { indent: 2, name: "node1" },
        { indent: 3, name: "node2" },
      ];

      // Act
      const parent = findParentNode(stack, 1);

      // Assert
      expect(parent).toBeNull();
      expect(stack.length).toBe(0);
    });

    it("When finding parent in nested structure, Then should pop nodes until parent found", () => {
      // Arrange
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "level1" },
        { indent: 2, name: "level2" },
        { indent: 3, name: "level3" },
      ];

      // Act
      const parent = findParentNode(stack, 1);

      // Assert
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
      expect(stack[0]).toEqual({ indent: 0, name: "root" });
    });

    it("When handling equal indent, Then should pop to parent", () => {
      // Arrange
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "sibling1" },
        { indent: 1, name: "sibling2" },
      ];

      // Act
      const parent = findParentNode(stack, 1);

      // Assert
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
    });

    it("When handling deeply nested structure, Then should find correct parent", () => {
      // Arrange
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "a" },
        { indent: 2, name: "b" },
        { indent: 3, name: "c" },
        { indent: 4, name: "d" },
      ];

      // Act
      const parent = findParentNode(stack, 2);

      // Assert
      expect(parent).toEqual({ indent: 1, name: "a" });
      expect(stack.length).toBe(2);
    });
  });
});
