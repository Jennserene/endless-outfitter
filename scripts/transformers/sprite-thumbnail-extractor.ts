import { extractStringValue } from "../utils/value-extraction";
import type { Transformer } from "../types";

/**
 * Extracts sprite and thumbnail values.
 */
export class SpriteThumbnailExtractor implements Transformer {
  transform(input: unknown): unknown {
    const ship = input as Record<string, unknown>;

    const sprite =
      typeof ship.sprite === "string"
        ? ship.sprite
        : extractStringValue(ship.sprite);
    const thumbnail =
      typeof ship.thumbnail === "string"
        ? ship.thumbnail
        : extractStringValue(ship.thumbnail);

    return {
      ...ship,
      sprite,
      thumbnail,
    };
  }
}
