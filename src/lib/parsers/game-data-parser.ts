interface ParseNode {
  key: string;
  value?: string | number;
  children: ParseNode[];
  lineNumber: number;
}

/**
 * Parse multiple values from a line, handling quoted strings and numbers.
 */
function parseLineValues(line: string): Array<string | number> {
  const values: Array<string | number> = [];
  let current = "";
  let inQuotes = false;
  let quoteChar = "";

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const prevChar = i > 0 ? line[i - 1] : "";

    if ((char === '"' || char === "`") && prevChar !== "\\") {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
        if (current.trim()) {
          // Save previous value
          const trimmed = current.trim();
          const numValue = parseFloat(trimmed);
          values.push(
            isNaN(numValue) || !isFinite(numValue) ? trimmed : numValue
          );
          current = "";
        }
      } else if (char === quoteChar) {
        inQuotes = false;
        values.push(current);
        current = "";
        quoteChar = "";
      } else {
        current += char;
      }
    } else if (char === " " && !inQuotes) {
      if (current.trim()) {
        const trimmed = current.trim();
        const numValue = parseFloat(trimmed);
        values.push(
          isNaN(numValue) || !isFinite(numValue) ? trimmed : numValue
        );
        current = "";
      }
    } else {
      current += char;
    }
  }

  // Handle remaining value
  if (current.trim()) {
    const trimmed = current.trim();
    const numValue = parseFloat(trimmed);
    values.push(isNaN(numValue) || !isFinite(numValue) ? trimmed : numValue);
  }

  return values;
}

/**
 * Parse indentation-based game data format into a tree structure.
 * Handles tabs as indentation markers.
 */
function parseIndentedFormat(content: string): ParseNode[] {
  const lines = content.split("\n");
  const root: ParseNode[] = [];
  const stack: { node: ParseNode; indent: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Calculate indentation (count leading tabs)
    const indent = line.length - line.trimStart().length;
    const match = trimmed.match(/^(\S+)(?:\s+(.+))?$/);
    if (!match) continue;

    const key = match[1];
    const restOfLine = match[2]?.trim() || "";

    // Parse all values from the line
    const values = restOfLine ? parseLineValues(restOfLine) : [];

    // First value is the primary value, rest are additional values
    const primaryValue = values.length > 0 ? values[0] : undefined;
    const additionalValues = values.slice(1);

    const node: ParseNode = {
      key,
      value: primaryValue,
      children: [],
      lineNumber: i + 1,
    };

    // Store additional values as children with special key
    if (additionalValues.length > 0) {
      for (const val of additionalValues) {
        node.children.push({
          key: "_value",
          value: val,
          children: [],
          lineNumber: i + 1,
        });
      }
    }

    // Pop stack until we find the correct parent
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    // Add to parent or root
    if (stack.length > 0) {
      stack[stack.length - 1].node.children.push(node);
    } else {
      root.push(node);
    }

    stack.push({ node, indent });
  }

  return root;
}

/**
 * Convert parsed nodes into a flat key-value structure with nested objects.
 */
function nodesToObject(nodes: ParseNode[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const node of nodes) {
    // Skip _value nodes - they're handled as part of their parent
    if (node.key === "_value") {
      continue;
    }

    if (node.children.length > 0) {
      // Has children - create nested object or array
      // Separate _value children from regular children
      const valueChildren = node.children.filter((c) => c.key === "_value");
      const regularChildren = node.children.filter((c) => c.key !== "_value");
      const childObj = nodesToObject(regularChildren);

      // Special handling for arrays of positional data (engine, gun, turret, etc.)
      const arrayKeys = ["engine", "gun", "turret", "bay", "leak", "explode"];
      if (arrayKeys.includes(node.key)) {
        if (!Array.isArray(result[node.key])) {
          result[node.key] = [];
        }
        // For positional data, store as object with values array
        const posObj: Record<string, unknown> = { ...childObj };

        // Collect all positional values (primary + additional)
        const allValues: Array<string | number> = [];
        if (node.value !== undefined) {
          allValues.push(node.value);
        }
        for (const valChild of valueChildren) {
          if (valChild.value !== undefined) {
            allValues.push(valChild.value);
          }
        }
        if (allValues.length > 0) {
          posObj._values = allValues;
        }

        (result[node.key] as unknown[]).push(posObj);
      } else {
        // Check if this key already exists (for arrays like multiple descriptions)
        if (result[node.key] !== undefined) {
          if (!Array.isArray(result[node.key])) {
            result[node.key] = [result[node.key]];
          }
          (result[node.key] as unknown[]).push(childObj);
        } else {
          result[node.key] = childObj;
        }
      }
    } else if (node.value !== undefined) {
      // Leaf node with value
      if (result[node.key] !== undefined) {
        if (!Array.isArray(result[node.key])) {
          result[node.key] = [result[node.key]];
        }
        (result[node.key] as unknown[]).push(node.value);
      } else {
        result[node.key] = node.value;
      }
    } else {
      // Key without value or children (boolean flag)
      result[node.key] = true;
    }
  }

  return result;
}

/**
 * Parse ship data from game data format.
 */
export function parseShipData(content: string): unknown[] {
  const nodes = parseIndentedFormat(content);
  const ships: unknown[] = [];

  for (const node of nodes) {
    if (node.key === "ship") {
      const shipName = node.value as string;
      const shipObj = nodesToObject(node.children);
      ships.push({
        name: shipName,
        ...shipObj,
      });
    }
  }

  return ships;
}

/**
 * Parse outfit data from game data format.
 */
export function parseOutfitData(content: string): unknown[] {
  const nodes = parseIndentedFormat(content);
  const outfits: unknown[] = [];

  for (const node of nodes) {
    if (node.key === "outfit") {
      const outfitName = node.value as string;
      const outfitObj = nodesToObject(node.children);
      outfits.push({
        name: outfitName,
        ...outfitObj,
      });
    }
  }

  return outfits;
}
