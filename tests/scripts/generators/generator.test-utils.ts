/**
 * Shared generator test utilities
 * Provides reusable test functions for both ship and outfit generators
 */

import type { Mock } from "jest-mock";

/**
 * Configuration for generator tests
 */
export interface GeneratorTestConfig {
  itemType: "ship" | "outfit";
  generateFn: () => void;
  BaseGenerator: Mock;
  converterFunction: Mock;
  rawDir: string;
  outputDir: string;
}

/**
 * Test generator execution
 */
export function testGeneratorExecution(
  config: GeneratorTestConfig,
  mockExecute: Mock
) {
  config.BaseGenerator.mockImplementation(
    () =>
      ({
        execute: mockExecute,
      }) as unknown
  );

  config.generateFn();

  expect(config.BaseGenerator).toHaveBeenCalledWith(
    config.converterFunction,
    expect.any(String), // rawDir
    expect.any(String), // outputDir
    config.itemType,
    config.itemType
  );
  expect(mockExecute).toHaveBeenCalled();
}
