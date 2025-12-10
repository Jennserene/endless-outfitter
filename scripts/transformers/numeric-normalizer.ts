import { normalizeNumericAttributes } from "../utils/numeric";
import type { Transformer } from "../types";

/**
 * Normalizes numeric attributes in the attributes block.
 */
export class NumericNormalizer implements Transformer {
  private readonly numericKeys = [
    "cost",
    "shields",
    "hull",
    "required crew",
    "bunks",
    "mass",
    "drag",
    "heat dissipation",
    "fuel capacity",
    "cargo space",
    "outfit space",
    "weapon capacity",
    "engine capacity",
  ] as const;

  transform(input: unknown): unknown {
    const ship = input as Record<string, unknown>;
    const attributes = ship.attributes as Record<string, unknown> | undefined;

    if (!attributes) {
      return ship;
    }

    const normalizedAttributes = normalizeNumericAttributes(
      attributes,
      this.numericKeys
    );

    return {
      ...ship,
      attributes: normalizedAttributes,
    };
  }
}
