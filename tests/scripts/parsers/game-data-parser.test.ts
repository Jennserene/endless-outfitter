import {
  parseIndentedFormat,
  nodesToObject,
} from "@scripts/parsers/game-data-parser";
import type { ParseNode } from "@scripts/types";

describe("game-data-parser", () => {
  describe("parseIndentedFormat", () => {
    it("should parse simple single-level structure", () => {
      const result = parseIndentedFormat("ship Test Ship");

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      // parseLineValues splits on spaces, so "Test Ship" becomes ["Test", "Ship"]
      expect(result[0].value).toBe("Test");
      // Additional values become _value children
      expect(result[0].children.length).toBeGreaterThan(0);
    });

    it("should parse nested structure with indentation", () => {
      const content = 'ship "Test Ship"\n\tmass 100\n\tdrag 0.1';
      const result = parseIndentedFormat(content);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      expect(result[0].value).toBe("Test Ship");
      expect(result[0].children.length).toBeGreaterThan(0);
      const massChild = result[0].children.find((c) => c.key === "mass");
      expect(massChild?.value).toBe(100);
      const dragChild = result[0].children.find((c) => c.key === "drag");
      expect(dragChild?.value).toBe(0.1);
    });

    it("should skip empty lines and comments", () => {
      const content = 'ship "Test Ship"\n\n\tmass 100\n# comment\n\tdrag 0.1';
      const result = parseIndentedFormat(content);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      // Should have mass and drag children, plus any _value children from "Test Ship"
      const regularChildren = result[0].children.filter(
        (c) => c.key !== "_value"
      );
      expect(regularChildren.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle multiple root-level nodes", () => {
      const content = "ship Ship1\nship Ship2";
      const result = parseIndentedFormat(content);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe("Ship1");
      expect(result[1].value).toBe("Ship2");
    });

    it("should handle additional values as children", () => {
      const result = parseIndentedFormat("ship Test Ship 100 200");

      // "Test Ship 100 200" is parsed as ["Test", "Ship", 100, 200]
      // First value is primary, rest become _value children
      expect(result[0].value).toBe("Test");
      const valueChildren = result[0].children.filter(
        (c) => c.key === "_value"
      );
      expect(valueChildren.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle empty content", () => {
      const result = parseIndentedFormat("");
      expect(result).toEqual([]);
    });

    it("should handle deeply nested structures", () => {
      const content =
        "ship Test Ship\n\tattributes\n\t\tmass 100\n\t\tdrag 0.1\n\tengine Engine1\n\t\tpower 200";
      const result = parseIndentedFormat(content);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      const attributes = result[0].children.find((c) => c.key === "attributes");
      expect(attributes).toBeDefined();
      expect(attributes?.children.length).toBeGreaterThan(0);
    });

    it("should handle tabs as indentation", () => {
      const content = "ship Test Ship\n\tmass 100";
      const result = parseIndentedFormat(content);

      expect(result[0].children.length).toBeGreaterThan(0);
    });

    it("should handle multiple spaces as indentation", () => {
      const content = "ship Test Ship\n  mass 100";
      const result = parseIndentedFormat(content);

      expect(result[0].children.length).toBeGreaterThan(0);
    });
  });

  describe("nodesToObject", () => {
    it("should convert simple leaf nodes to object", () => {
      const nodes: ParseNode[] = [
        { key: "mass", value: 100, children: [], lineNumber: 1 },
        { key: "drag", value: 0.1, children: [], lineNumber: 2 },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        mass: 100,
        drag: 0.1,
      });
    });

    it("should convert nodes with children to nested objects", () => {
      const nodes: ParseNode[] = [
        {
          key: "attributes",
          value: undefined,
          children: [
            { key: "mass", value: 100, children: [], lineNumber: 2 },
            { key: "drag", value: 0.1, children: [], lineNumber: 3 },
          ],
          lineNumber: 1,
        },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        attributes: {
          mass: 100,
          drag: 0.1,
        },
      });
    });

    it("should handle boolean flags (key without value)", () => {
      const nodes: ParseNode[] = [
        { key: "isSpecial", value: undefined, children: [], lineNumber: 1 },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        isSpecial: true,
      });
    });

    it("should handle duplicate keys by creating arrays", () => {
      const nodes: ParseNode[] = [
        {
          key: "description",
          value: "First description",
          children: [],
          lineNumber: 1,
        },
        {
          key: "description",
          value: "Second description",
          children: [],
          lineNumber: 2,
        },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        description: ["First description", "Second description"],
      });
    });

    it("should handle positional keys as arrays", () => {
      const nodes: ParseNode[] = [
        {
          key: "engine",
          value: "Engine1",
          children: [{ key: "power", value: 100, children: [], lineNumber: 2 }],
          lineNumber: 1,
        },
        {
          key: "engine",
          value: "Engine2",
          children: [{ key: "power", value: 200, children: [], lineNumber: 4 }],
          lineNumber: 3,
        },
      ];

      const result = nodesToObject(nodes, ["engine"]);

      expect(result.engine).toBeInstanceOf(Array);
      expect(result.engine).toHaveLength(2);
      const engineArray = result.engine as Array<Record<string, unknown>>;
      expect(engineArray[0].power).toBe(100);
      expect(engineArray[1].power).toBe(200);
    });

    it("should preserve primary value when node has children", () => {
      const nodes: ParseNode[] = [
        {
          key: "sprite",
          value: "sprite.png",
          children: [{ key: "scale", value: 1.0, children: [], lineNumber: 2 }],
          lineNumber: 1,
        },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        sprite: {
          _value: "sprite.png",
          scale: 1.0,
        },
      });
    });

    it("should skip _value nodes", () => {
      const nodes: ParseNode[] = [
        {
          key: "ship",
          value: "Test Ship",
          children: [
            { key: "_value", value: 100, children: [], lineNumber: 2 },
            { key: "mass", value: 200, children: [], lineNumber: 3 },
          ],
          lineNumber: 1,
        },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        ship: {
          _value: "Test Ship",
          mass: 200,
        },
      });
    });

    it("should handle positional values in positional keys", () => {
      const nodes: ParseNode[] = [
        {
          key: "gun",
          value: "Gun1",
          children: [
            { key: "_value", value: 100, children: [], lineNumber: 2 },
            { key: "_value", value: 200, children: [], lineNumber: 3 },
            { key: "damage", value: 50, children: [], lineNumber: 4 },
          ],
          lineNumber: 1,
        },
      ];

      const result = nodesToObject(nodes, ["gun"]);

      expect(result.gun).toBeInstanceOf(Array);
      const gunArray = result.gun as Array<Record<string, unknown>>;
      expect(gunArray[0]._values).toEqual(["Gun1", 100, 200]);
      expect(gunArray[0].damage).toBe(50);
    });

    it("should handle empty nodes array", () => {
      const result = nodesToObject([]);
      expect(result).toEqual({});
    });

    it("should handle deeply nested structures", () => {
      const nodes: ParseNode[] = [
        {
          key: "ship",
          value: "Test Ship",
          children: [
            {
              key: "attributes",
              value: undefined,
              children: [
                {
                  key: "engine",
                  value: "Engine1",
                  children: [
                    { key: "power", value: 100, children: [], lineNumber: 4 },
                  ],
                  lineNumber: 3,
                },
              ],
              lineNumber: 2,
            },
          ],
          lineNumber: 1,
        },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        ship: {
          _value: "Test Ship",
          attributes: {
            engine: {
              _value: "Engine1",
              power: 100,
            },
          },
        },
      });
    });

    it("should handle non-positional keys with children", () => {
      const nodes: ParseNode[] = [
        {
          key: "outfit",
          value: "Test Outfit",
          children: [{ key: "mass", value: 10, children: [], lineNumber: 2 }],
          lineNumber: 1,
        },
      ];

      const result = nodesToObject(nodes);

      expect(result).toEqual({
        outfit: {
          _value: "Test Outfit",
          mass: 10,
        },
      });
    });
  });
});
