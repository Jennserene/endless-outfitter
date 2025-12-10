/**
 * Parse multiple values from a line, handling quoted strings and numbers.
 */
export function parseLineValues(line: string): Array<string | number> {
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
 * Check if a line should be skipped (empty or comment)
 */
export function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();
  return !trimmed || trimmed.startsWith("#");
}

/**
 * Extract key and rest of line from a trimmed line.
 * Handles both quoted and unquoted keys.
 */
export function extractKeyValue(
  trimmed: string
): { key: string; restOfLine: string } | null {
  if (trimmed.startsWith('"')) {
    // Key is quoted - find the closing quote
    const quoteEnd = trimmed.indexOf('"', 1);
    if (quoteEnd === -1) {
      // Malformed quoted key
      return null;
    }
    return {
      key: trimmed.slice(1, quoteEnd),
      restOfLine: trimmed.slice(quoteEnd + 1).trim(),
    };
  } else {
    // Key is not quoted - use regex
    const match = trimmed.match(/^(\S+)(?:\s+(.+))?$/);
    if (!match) return null;
    return {
      key: match[1],
      restOfLine: match[2]?.trim() || "",
    };
  }
}

/**
 * Find the parent node in the stack for a given indentation level.
 */
export function findParentNode<T extends { indent: number }>(
  stack: T[],
  indent: number
): T | null {
  // Pop stack until we find the correct parent
  while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
    stack.pop();
  }
  return stack.length > 0 ? stack[stack.length - 1] : null;
}
