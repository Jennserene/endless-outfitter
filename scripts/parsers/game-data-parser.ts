import {
  parseLineValues,
  shouldSkipLine,
  extractKeyValue,
  findParentNode,
} from "./line-parser";
import type { ParseNode } from "../types";

/**
 * Parse a single line into a ParseNode.
 */
function parseLine(line: string, lineNumber: number): ParseNode | null {
  const trimmed = line.trim();

  if (shouldSkipLine(trimmed)) {
    return null;
  }

  const keyValue = extractKeyValue(trimmed);
  if (!keyValue) {
    return null;
  }

  const { key, restOfLine } = keyValue;

  // Parse all values from the line
  const values = restOfLine ? parseLineValues(restOfLine) : [];

  // First value is the primary value, rest are additional values
  const primaryValue = values.length > 0 ? values[0] : undefined;
  const additionalValues = values.slice(1);

  const node: ParseNode = {
    key,
    value: primaryValue,
    children: [],
    lineNumber,
  };

  // Store additional values as children with special key
  if (additionalValues.length > 0) {
    for (const val of additionalValues) {
      node.children.push({
        key: "_value",
        value: val,
        children: [],
        lineNumber,
      });
    }
  }

  return node;
}

/**
 * Parse indentation-based game data format into a tree structure.
 * Handles tabs as indentation markers.
 */
export function parseIndentedFormat(content: string): ParseNode[] {
  const lines = content.split("\n");
  const root: ParseNode[] = [];
  const stack: { node: ParseNode; indent: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const node = parseLine(line, i + 1);

    if (!node) {
      continue;
    }

    // Calculate indentation (count leading tabs)
    const indent = line.length - line.trimStart().length;

    // Find parent node
    const parent = findParentNode(stack, indent);

    // Add to parent or root
    if (parent) {
      parent.node.children.push(node);
    } else {
      root.push(node);
    }

    stack.push({ node, indent });
  }

  return root;
}

/**
 * Separate value children from regular children
 */
function separateChildren(children: ParseNode[]): {
  valueChildren: ParseNode[];
  regularChildren: ParseNode[];
} {
  return {
    valueChildren: children.filter((c) => c.key === "_value"),
    regularChildren: children.filter((c) => c.key !== "_value"),
  };
}

/**
 * Collect all positional values from a node and its value children
 */
function collectPositionalValues(
  node: ParseNode,
  valueChildren: ParseNode[]
): Array<string | number> {
  const allValues: Array<string | number> = [];
  if (node.value !== undefined) {
    allValues.push(node.value);
  }
  for (const valChild of valueChildren) {
    if (valChild.value !== undefined) {
      allValues.push(valChild.value);
    }
  }
  return allValues;
}

/**
 * Handle positional data nodes (engine, gun, turret, etc.)
 */
function handlePositionalData(
  result: Record<string, unknown>,
  node: ParseNode,
  childObj: Record<string, unknown>,
  valueChildren: ParseNode[]
): void {
  if (!Array.isArray(result[node.key])) {
    result[node.key] = [];
  }

  const posObj: Record<string, unknown> = { ...childObj };
  const allValues = collectPositionalValues(node, valueChildren);
  if (allValues.length > 0) {
    posObj._values = allValues;
  }

  (result[node.key] as unknown[]).push(posObj);
}

/**
 * Handle array value accumulation (for multiple descriptions, etc.)
 */
function handleArrayValue(
  result: Record<string, unknown>,
  key: string,
  value: unknown
): void {
  if (result[key] !== undefined) {
    if (!Array.isArray(result[key])) {
      result[key] = [result[key]];
    }
    (result[key] as unknown[]).push(value);
  } else {
    result[key] = value;
  }
}

/**
 * Process a node with children
 */
function processNodeWithChildren(
  result: Record<string, unknown>,
  node: ParseNode,
  positionalKeys: readonly string[]
): void {
  const { valueChildren, regularChildren } = separateChildren(node.children);
  const childObj = nodesToObject(regularChildren, positionalKeys);

  // Preserve the primary value when there are children
  // This is important for fields like sprite that can have both a value and children
  if (node.value !== undefined) {
    childObj._value = node.value;
  }

  // Special handling for arrays of positional data (engine, gun, turret, etc.) - ships only
  if (positionalKeys.includes(node.key)) {
    handlePositionalData(result, node, childObj, valueChildren);
  } else {
    handleArrayValue(result, node.key, childObj);
  }
}

/**
 * Process a leaf node (no children)
 */
function processLeafNode(
  result: Record<string, unknown>,
  node: ParseNode
): void {
  if (node.value !== undefined) {
    // Leaf node with value
    handleArrayValue(result, node.key, node.value);
  } else {
    // Key without value or children (boolean flag)
    result[node.key] = true;
  }
}

/**
 * Convert parsed nodes into a flat key-value structure with nested objects.
 * Handles both ship-specific positional data and general outfit data.
 */
export function nodesToObject(
  nodes: ParseNode[],
  positionalKeys: readonly string[] = []
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const node of nodes) {
    // Skip _value nodes - they're handled as part of their parent
    if (node.key === "_value") {
      continue;
    }

    if (node.children.length > 0) {
      processNodeWithChildren(result, node, positionalKeys);
    } else {
      processLeafNode(result, node);
    }
  }

  return result;
}
