import {
  parseLineValues,
  shouldSkipLine,
  extractKeyValue,
  findParentNode,
} from "@scripts/parsers/line-parser";

describe("line-parser", () => {
  describe("parseLineValues", () => {
    it("should parse simple space-separated values", () => {
      const result = parseLineValues("foo bar baz");
      expect(result).toEqual(["foo", "bar", "baz"]);
    });

    it("should parse numeric values as numbers", () => {
      const result = parseLineValues("100 200 300");
      expect(result).toEqual([100, 200, 300]);
    });

    it("should parse mixed strings and numbers", () => {
      const result = parseLineValues("ship 100 0.5");
      expect(result).toEqual(["ship", 100, 0.5]);
    });

    it("should parse quoted strings", () => {
      const result = parseLineValues('"quoted string" unquoted');
      expect(result).toEqual(["quoted string", "unquoted"]);
    });

    it("should parse backtick-quoted strings", () => {
      const result = parseLineValues("`backtick string` normal");
      expect(result).toEqual(["backtick string", "normal"]);
    });

    it("should handle quoted strings with spaces", () => {
      const result = parseLineValues('"multi word string" value');
      expect(result).toEqual(["multi word string", "value"]);
    });

    it("should handle empty quoted strings", () => {
      const result = parseLineValues('"" value');
      expect(result).toEqual(["", "value"]);
    });

    it("should handle decimal numbers", () => {
      const result = parseLineValues("1.5 2.75 0.1");
      expect(result).toEqual([1.5, 2.75, 0.1]);
    });

    it("should handle negative numbers", () => {
      const result = parseLineValues("-100 -0.5");
      expect(result).toEqual([-100, -0.5]);
    });

    it("should handle multiple spaces between values", () => {
      const result = parseLineValues("foo    bar     baz");
      expect(result).toEqual(["foo", "bar", "baz"]);
    });

    it("should handle leading and trailing spaces", () => {
      const result = parseLineValues("  foo bar  ");
      expect(result).toEqual(["foo", "bar"]);
    });

    it("should handle empty string", () => {
      const result = parseLineValues("");
      expect(result).toEqual([]);
    });

    it("should handle string that looks like number but isn't", () => {
      const result = parseLineValues("abc123 def456");
      expect(result).toEqual(["abc123", "def456"]);
    });

    it("should handle Infinity and NaN as strings", () => {
      const result = parseLineValues("Infinity NaN");
      expect(result).toEqual(["Infinity", "NaN"]);
    });

    it("should handle escaped quotes inside quoted strings", () => {
      // Note: The parser doesn't unescape quotes, it keeps the backslash
      const result = parseLineValues('"string with \\"quote\\""');
      expect(result).toEqual(['string with \\"quote\\"']);
    });

    it("should handle mixed quotes", () => {
      const result = parseLineValues('"double" `backtick` normal');
      expect(result).toEqual(["double", "backtick", "normal"]);
    });
  });

  describe("shouldSkipLine", () => {
    it("should skip empty lines", () => {
      expect(shouldSkipLine("")).toBe(true);
      expect(shouldSkipLine("   ")).toBe(true);
      expect(shouldSkipLine("\t\t")).toBe(true);
    });

    it("should skip comment lines", () => {
      expect(shouldSkipLine("# comment")).toBe(true);
      expect(shouldSkipLine("  # comment with spaces")).toBe(true);
      expect(shouldSkipLine("#")).toBe(true);
    });

    it("should not skip regular lines", () => {
      expect(shouldSkipLine("ship Test Ship")).toBe(false);
      expect(shouldSkipLine("  ship Test Ship")).toBe(false);
      expect(shouldSkipLine("outfit Test Outfit")).toBe(false);
    });

    it("should not skip lines with # in the middle", () => {
      expect(shouldSkipLine("ship Test # Ship")).toBe(false);
      expect(shouldSkipLine('ship "Test # Ship"')).toBe(false);
    });
  });

  describe("extractKeyValue", () => {
    it("should extract unquoted key and value", () => {
      const result = extractKeyValue("ship Test Ship");
      expect(result).toEqual({
        key: "ship",
        restOfLine: "Test Ship",
      });
    });

    it("should extract unquoted key with no value", () => {
      const result = extractKeyValue("ship");
      expect(result).toEqual({
        key: "ship",
        restOfLine: "",
      });
    });

    it("should extract quoted key and value", () => {
      const result = extractKeyValue('"ship name" 100 200');
      expect(result).toEqual({
        key: "ship name",
        restOfLine: "100 200",
      });
    });

    it("should extract quoted key with no value", () => {
      const result = extractKeyValue('"ship name"');
      expect(result).toEqual({
        key: "ship name",
        restOfLine: "",
      });
    });

    it("should handle quoted key with spaces in value", () => {
      const result = extractKeyValue('"ship name" mass 100');
      expect(result).toEqual({
        key: "ship name",
        restOfLine: "mass 100",
      });
    });

    it("should return null for malformed quoted key", () => {
      const result = extractKeyValue('"unclosed quote');
      expect(result).toBeNull();
    });

    it("should handle empty quoted key", () => {
      const result = extractKeyValue('"" value');
      expect(result).toEqual({
        key: "",
        restOfLine: "value",
      });
    });

    it("should handle key with multiple spaces before value", () => {
      const result = extractKeyValue("ship    Test Ship");
      expect(result).toEqual({
        key: "ship",
        restOfLine: "Test Ship",
      });
    });

    it("should handle key with tabs", () => {
      const result = extractKeyValue("ship\tTest Ship");
      expect(result).toEqual({
        key: "ship",
        restOfLine: "Test Ship",
      });
    });

    it("should return null for empty string", () => {
      const result = extractKeyValue("");
      expect(result).toBeNull();
    });

    it("should handle key with special characters", () => {
      const result = extractKeyValue("ship-name Test Ship");
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

    it("should find parent with smaller indent", () => {
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "child1" },
        { indent: 2, name: "child2" },
      ];
      const parent = findParentNode(stack, 1);
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
    });

    it("should find parent with same indent level", () => {
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "child1" },
      ];
      const parent = findParentNode(stack, 1);
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
    });

    it("should return null when no parent exists", () => {
      const stack: TestNode[] = [];
      const parent = findParentNode(stack, 0);
      expect(parent).toBeNull();
    });

    it("should return null when indent is less than all nodes", () => {
      const stack: TestNode[] = [
        { indent: 2, name: "node1" },
        { indent: 3, name: "node2" },
      ];
      const parent = findParentNode(stack, 1);
      expect(parent).toBeNull();
      expect(stack.length).toBe(0);
    });

    it("should pop nodes until finding correct parent", () => {
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "level1" },
        { indent: 2, name: "level2" },
        { indent: 3, name: "level3" },
      ];
      const parent = findParentNode(stack, 1);
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
      expect(stack[0]).toEqual({ indent: 0, name: "root" });
    });

    it("should handle equal indent by popping to parent", () => {
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "sibling1" },
        { indent: 1, name: "sibling2" },
      ];
      const parent = findParentNode(stack, 1);
      expect(parent).toEqual({ indent: 0, name: "root" });
      expect(stack.length).toBe(1);
    });

    it("should handle deeply nested structure", () => {
      const stack: TestNode[] = [
        { indent: 0, name: "root" },
        { indent: 1, name: "a" },
        { indent: 2, name: "b" },
        { indent: 3, name: "c" },
        { indent: 4, name: "d" },
      ];
      const parent = findParentNode(stack, 2);
      expect(parent).toEqual({ indent: 1, name: "a" });
      expect(stack.length).toBe(2);
    });
  });
});
