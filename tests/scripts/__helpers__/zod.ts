/**
 * Helper functions for Zod testing
 */

import { z } from "zod";

/**
 * Create a mock ZodError for testing validation failures
 */
export function createMockZodError(
  field: string = "name",
  expected: string = "string",
  received: string = "number"
): z.ZodError {
  const schema = z.object({
    [field]: z.string(),
  });

  const result = schema.safeParse({ [field]: 123 });
  if (!result.success) {
    return result.error;
  }

  // Fallback: create a basic ZodError
  // Note: Zod v4+ structure may differ, so we use a type assertion
  return new z.ZodError([
    {
      code: z.ZodIssueCode.invalid_type,
      expected: expected as
        | "string"
        | "number"
        | "bigint"
        | "boolean"
        | "symbol"
        | "undefined"
        | "object"
        | "function",
      path: [field],
      message: `Expected ${expected}, received ${received}`,
    } as z.ZodIssue,
  ]);
}
