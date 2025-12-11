import {
  parseIndentedFormat,
  nodesToObject,
} from "@scripts/parsers/game-data-parser";
import type { ParseNode } from "@scripts/types";

describe("game-data-parser", () => {
  describe("parseIndentedFormat", () => {
    it("When parsing simple single-level structure, Then should return node with key and value", () => {
      // Act
      const result = parseIndentedFormat("ship Test Ship");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      // parseLineValues splits on spaces, so "Test Ship" becomes ["Test", "Ship"]
      expect(result[0].value).toBe("Test");
      // Additional values become _value children
      expect(result[0].children.length).toBeGreaterThan(0);
    });

    it("When parsing nested structure with indentation, Then should return nested nodes", () => {
      // Arrange
      const content = 'ship "Test Ship"\n\tmass 100\n\tdrag 0.1';

      // Act
      const result = parseIndentedFormat(content);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      expect(result[0].value).toBe("Test Ship");
      expect(result[0].children.length).toBeGreaterThan(0);
      const massChild = result[0].children.find((c) => c.key === "mass");
      expect(massChild?.value).toBe(100);
      const dragChild = result[0].children.find((c) => c.key === "drag");
      expect(dragChild?.value).toBe(0.1);
    });

    it("When parsing content with empty lines and comments, Then should skip them", () => {
      // Arrange
      const content = 'ship "Test Ship"\n\n\tmass 100\n# comment\n\tdrag 0.1';

      // Act
      const result = parseIndentedFormat(content);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      // Should have mass and drag children, plus any _value children from "Test Ship"
      const regularChildren = result[0].children.filter(
        (c) => c.key !== "_value"
      );
      expect(regularChildren.length).toBeGreaterThanOrEqual(2);
    });

    it("When parsing multiple root-level nodes, Then should return all nodes", () => {
      // Arrange
      const content = "ship Ship1\nship Ship2";

      // Act
      const result = parseIndentedFormat(content);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe("Ship1");
      expect(result[1].value).toBe("Ship2");
    });

    it("When parsing line with additional values, Then should handle them as children", () => {
      // Act
      const result = parseIndentedFormat("ship Test Ship 100 200");

      // Assert
      // "Test Ship 100 200" is parsed as ["Test", "Ship", 100, 200]
      // First value is primary, rest become _value children
      expect(result[0].value).toBe("Test");
      const valueChildren = result[0].children.filter(
        (c) => c.key === "_value"
      );
      expect(valueChildren.length).toBeGreaterThanOrEqual(2);
    });

    it("When parsing empty content, Then should return empty array", () => {
      // Act
      const result = parseIndentedFormat("");

      // Assert
      expect(result).toEqual([]);
    });

    it("When parsing deeply nested structures, Then should preserve nesting", () => {
      // Arrange
      const content =
        "ship Test Ship\n\tattributes\n\t\tmass 100\n\t\tdrag 0.1\n\tengine Engine1\n\t\tpower 200";

      // Act
      const result = parseIndentedFormat(content);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("ship");
      const attributes = result[0].children.find((c) => c.key === "attributes");
      expect(attributes).toBeDefined();
      expect(attributes?.children.length).toBeGreaterThan(0);
    });

    it("When parsing with tabs as indentation, Then should handle tabs correctly", () => {
      // Arrange
      const content = "ship Test Ship\n\tmass 100";

      // Act
      const result = parseIndentedFormat(content);

      // Assert
      expect(result[0].children.length).toBeGreaterThan(0);
    });

    it("When parsing with multiple spaces as indentation, Then should handle spaces correctly", () => {
      // Arrange
      const content = "ship Test Ship\n  mass 100";

      // Act
      const result = parseIndentedFormat(content);

      // Assert
      expect(result[0].children.length).toBeGreaterThan(0);
    });
  });

  describe("nodesToObject", () => {
    it("When converting simple leaf nodes, Then should return flat object", () => {
      // Arrange
      const nodes: ParseNode[] = [
        { key: "mass", value: 100, children: [], lineNumber: 1 },
        { key: "drag", value: 0.1, children: [], lineNumber: 2 },
      ];

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        mass: 100,
        drag: 0.1,
      });
    });

    it("When converting nodes with children, Then should return nested objects", () => {
      // Arrange
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

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        attributes: {
          mass: 100,
          drag: 0.1,
        },
      });
    });

    it("When converting boolean flags, Then should set value to true", () => {
      // Arrange
      const nodes: ParseNode[] = [
        { key: "isSpecial", value: undefined, children: [], lineNumber: 1 },
      ];

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        isSpecial: true,
      });
    });

    it("When converting duplicate keys, Then should create arrays", () => {
      // Arrange
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

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        description: ["First description", "Second description"],
      });
    });

    it("When converting positional keys, Then should create arrays", () => {
      // Arrange
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

      // Act
      const result = nodesToObject(nodes, ["engine"]);

      // Assert
      expect(result.engine).toBeInstanceOf(Array);
      expect(result.engine).toHaveLength(2);
      const engineArray = result.engine as Array<Record<string, unknown>>;
      expect(engineArray[0].power).toBe(100);
      expect(engineArray[1].power).toBe(200);
    });

    it("When converting node with children and value, Then should preserve primary value", () => {
      // Arrange
      const nodes: ParseNode[] = [
        {
          key: "sprite",
          value: "sprite.png",
          children: [{ key: "scale", value: 1.0, children: [], lineNumber: 2 }],
          lineNumber: 1,
        },
      ];

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        sprite: {
          _value: "sprite.png",
          scale: 1.0,
        },
      });
    });

    it("When converting nodes with _value children, Then should skip _value nodes", () => {
      // Arrange
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

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        ship: {
          _value: "Test Ship",
          mass: 200,
        },
      });
    });

    it("When converting positional values in positional keys, Then should group values", () => {
      // Arrange
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

      // Act
      const result = nodesToObject(nodes, ["gun"]);

      // Assert
      expect(result.gun).toBeInstanceOf(Array);
      const gunArray = result.gun as Array<Record<string, unknown>>;
      expect(gunArray[0]._values).toEqual(["Gun1", 100, 200]);
      expect(gunArray[0].damage).toBe(50);
    });

    it("When converting empty nodes array, Then should return empty object", () => {
      // Act
      const result = nodesToObject([]);

      // Assert
      expect(result).toEqual({});
    });

    it("When converting deeply nested structures, Then should preserve all nesting", () => {
      // Arrange
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

      // Act
      const result = nodesToObject(nodes);

      // Assert
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

    it("When converting non-positional keys with children, Then should preserve structure", () => {
      // Arrange
      const nodes: ParseNode[] = [
        {
          key: "outfit",
          value: "Test Outfit",
          children: [{ key: "mass", value: 10, children: [], lineNumber: 2 }],
          lineNumber: 1,
        },
      ];

      // Act
      const result = nodesToObject(nodes);

      // Assert
      expect(result).toEqual({
        outfit: {
          _value: "Test Outfit",
          mass: 10,
        },
      });
    });
  });
});
