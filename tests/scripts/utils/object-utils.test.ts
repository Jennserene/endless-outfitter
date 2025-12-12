import { deepClone, deepMerge } from "@scripts/utils/object-utils";

describe("object-utils", () => {
  describe("deepClone", () => {
    it("should clone a simple object", () => {
      const original = { name: "Test", value: 42 };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it("should clone nested objects", () => {
      const original = {
        name: "Test",
        nested: { value: 42, deep: { data: "test" } },
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned.nested).not.toBe(original.nested);
      expect(cloned.nested.deep).not.toBe(original.nested.deep);
    });

    it("should clone arrays", () => {
      const original = { items: [1, 2, 3], nested: [{ a: 1 }, { b: 2 }] };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned.items).not.toBe(original.items);
      expect(cloned.nested).not.toBe(original.nested);
    });

    it("should handle null values", () => {
      const original = { name: "Test", value: null };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
    });

    it("should handle undefined values (will be lost in JSON)", () => {
      const original = { name: "Test", value: undefined };
      const cloned = deepClone(original);

      // JSON.stringify removes undefined, so value won't be in cloned object
      expect(cloned).toEqual({ name: "Test" });
    });

    it("should handle empty objects", () => {
      const original = {};
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe("deepMerge", () => {
    it("should merge simple objects", () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
      expect(merged).not.toBe(target);
      expect(merged).not.toBe(source);
    });

    it("should merge nested objects recursively", () => {
      const target = {
        a: 1,
        nested: { x: 10, y: 20 },
      };
      const source = {
        b: 2,
        nested: { y: 30, z: 40 },
      };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({
        a: 1,
        b: 2,
        nested: { x: 10, y: 30, z: 40 },
      });
    });

    it("should replace arrays instead of merging", () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [4, 5] };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({ items: [4, 5] });
    });

    it("should replace primitives", () => {
      const target = { value: "original", num: 10 };
      const source = { value: "replaced", num: 20 };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({ value: "replaced", num: 20 });
    });

    it("should handle empty source object", () => {
      const target = { a: 1, b: 2 };
      const source = {};
      const merged = deepMerge(target, source);

      expect(merged).toEqual({ a: 1, b: 2 });
    });

    it("should handle empty target object", () => {
      const target = {};
      const source = { a: 1, b: 2 };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({ a: 1, b: 2 });
    });

    it("should not mutate target object", () => {
      const target = { a: 1, b: 2 };
      const source = { c: 3 };
      const originalTarget = { ...target };

      deepMerge(target, source);

      expect(target).toEqual(originalTarget);
    });

    it("should handle deeply nested structures", () => {
      const target = {
        level1: {
          level2: {
            level3: { value: "target" },
            other: "target",
          },
        },
      };
      const source = {
        level1: {
          level2: {
            level3: { value: "source" },
          },
        },
      };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({
        level1: {
          level2: {
            level3: { value: "source" },
            other: "target",
          },
        },
      });
    });

    it("should handle null values in source", () => {
      const target = { a: 1, b: 2 };
      const source = { b: null, c: 3 };
      const merged = deepMerge(target, source);

      expect(merged).toEqual({ a: 1, b: null, c: 3 });
    });
  });
});
