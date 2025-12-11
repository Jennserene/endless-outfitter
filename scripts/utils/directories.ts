import { logger } from "@/lib/logger";
import { existsSync, mkdirSync, readdirSync, rmSync } from "fs";
import { relative } from "path";
import {
  SHIPS_DIR,
  OUTFITS_DIR,
  DATA_DIR,
  IMAGES_DIR,
  OUTFIT_IMAGES_DIR,
  SHIP_IMAGES_DIR,
  THUMBNAIL_IMAGES_DIR,
  RAW_DATA_DIR,
  RAW_SHIP_DIR,
  RAW_OUTFIT_DIR,
} from "./paths";

/**
 * Ensure data directories exist, creating them if necessary
 */
export function ensureDataDirectories(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(SHIPS_DIR)) {
    mkdirSync(SHIPS_DIR, { recursive: true });
  }
  if (!existsSync(OUTFITS_DIR)) {
    mkdirSync(OUTFITS_DIR, { recursive: true });
  }
  if (!existsSync(IMAGES_DIR)) {
    mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

/**
 * Validate that data directories exist
 */
export function validateDataDirectories(): void {
  if (!existsSync(DATA_DIR)) {
    throw new Error(`Data directory not found at ${DATA_DIR}`);
  }

  if (!existsSync(SHIPS_DIR)) {
    throw new Error(`Ships directory not found at ${SHIPS_DIR}`);
  }

  if (!existsSync(OUTFITS_DIR)) {
    throw new Error(`Outfits directory not found at ${OUTFITS_DIR}`);
  }

  const shipFiles = readdirSync(SHIPS_DIR).filter((f) => f.endsWith(".json"));
  const outfitFiles = readdirSync(OUTFITS_DIR).filter((f) =>
    f.endsWith(".json")
  );

  if (shipFiles.length === 0) {
    throw new Error(`No ships data files found in ${SHIPS_DIR}`);
  }

  if (outfitFiles.length === 0) {
    throw new Error(`No outfits data files found in ${OUTFITS_DIR}`);
  }

  logger.success(
    `Found ${shipFiles.length} ships file(s) and ${outfitFiles.length} outfits file(s)`
  );
}

/**
 * Wipe and recreate the raw data directory
 */
export function wipeRawDataDirectory(): void {
  if (existsSync(RAW_DATA_DIR)) {
    rmSync(RAW_DATA_DIR, { recursive: true, force: true });
  }
  mkdirSync(RAW_SHIP_DIR, { recursive: true });
  mkdirSync(RAW_OUTFIT_DIR, { recursive: true });
}

/**
 * Remove all existing data and image files before generation.
 * Cleans src/assets/data, src/assets/images/outfit, src/assets/images/ship, and src/assets/images/thumbnail
 */
export function cleanOutputDirectories(): void {
  logger.info("Cleaning output directories...");

  // Clean data directory
  if (existsSync(DATA_DIR)) {
    const relativeDataDir = relative(process.cwd(), DATA_DIR);
    logger.info(`Removing contents of ${relativeDataDir}`);
    rmSync(DATA_DIR, { recursive: true, force: true });
  }

  // Clean image subdirectories
  const imageDirs = [
    { path: OUTFIT_IMAGES_DIR, name: "outfit images" },
    { path: SHIP_IMAGES_DIR, name: "ship images" },
    { path: THUMBNAIL_IMAGES_DIR, name: "thumbnail images" },
  ];

  for (const { path, name } of imageDirs) {
    if (existsSync(path)) {
      logger.info(`Removing contents of ${name} directory`);
      rmSync(path, { recursive: true, force: true });
    }
  }

  logger.success("Output directories cleaned successfully");
}
