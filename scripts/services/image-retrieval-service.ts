import type { Logger } from "@/lib/logger";
import { logger as defaultLogger } from "@/lib/logger";
import type { Ship } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";
import { extractImagePaths } from "../utils/image-extractor";
import { copyImagesToAssets } from "../utils/image-copier";
import { SUBMODULE_PATH, IMAGES_DIR } from "../utils/paths";

/**
 * Service for retrieving and copying image files referenced in game data.
 */
export class ImageRetrievalService {
  constructor(private readonly logger: Logger = defaultLogger) {}

  /**
   * Retrieve all images referenced in ships and outfits data.
   * Extracts image paths, resolves them to actual files, and copies them to assets directory.
   *
   * @param ships - Array of ship objects
   * @param outfits - Array of outfit objects
   */
  retrieveImages(ships: Ship[], outfits: Outfit[]): void {
    this.logger.info("Extracting image paths from ships and outfits...");

    const imagePaths = extractImagePaths(ships, outfits);
    this.logger.info(`Found ${imagePaths.size} unique image path(s)`);

    if (imagePaths.size === 0) {
      this.logger.info("No images to retrieve");
      return;
    }

    this.logger.info("Copying images to assets directory...");
    const stats = copyImagesToAssets(imagePaths, SUBMODULE_PATH, IMAGES_DIR);

    this.logger.success(
      `Image retrieval completed: ${stats.copied} copied, ${stats.failed} failed`
    );
  }
}
