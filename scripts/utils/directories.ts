import { logger } from "@/lib/logger";
import { existsSync, mkdirSync, readdirSync, rmSync, renameSync } from "fs";
import { join } from "path";
import {
  SHIPS_DIR,
  OUTFITS_DIR,
  DATA_DIR,
  IMAGES_DIR,
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
 * Check if a filename is a backup file (has .old extension)
 */
function isBackupFile(filename: string): boolean {
  return filename.endsWith(".old");
}

/**
 * Backup existing JSON files by renaming them with .old extension.
 * Only backs up .json files (not .old files) in SHIPS_DIR and OUTFITS_DIR.
 * Image files are not backed up - the image copier checks file contents before overwriting.
 * Returns a map of original paths to backup paths for tracking.
 */
export function backupExistingFiles(): Map<string, string> {
  logger.info("Backing up existing JSON files...");
  const backupMap = new Map<string, string>();

  // Backup JSON files in ships directory
  if (existsSync(SHIPS_DIR)) {
    const files = readdirSync(SHIPS_DIR).filter(
      (f) => f.endsWith(".json") && !isBackupFile(f)
    );
    for (const filename of files) {
      const originalPath = join(SHIPS_DIR, filename);
      const backupPath = `${originalPath}.old`;
      try {
        renameSync(originalPath, backupPath);
        backupMap.set(originalPath, backupPath);
        logger.debug(`Backed up ${filename} → ${filename}.old`);
      } catch (error) {
        logger.warn(`Failed to backup ${filename}: ${error}`);
      }
    }
  }

  // Backup JSON files in outfits directory
  if (existsSync(OUTFITS_DIR)) {
    const files = readdirSync(OUTFITS_DIR).filter(
      (f) => f.endsWith(".json") && !isBackupFile(f)
    );
    for (const filename of files) {
      const originalPath = join(OUTFITS_DIR, filename);
      const backupPath = `${originalPath}.old`;
      try {
        renameSync(originalPath, backupPath);
        backupMap.set(originalPath, backupPath);
        logger.debug(`Backed up ${filename} → ${filename}.old`);
      } catch (error) {
        logger.warn(`Failed to backup ${filename}: ${error}`);
      }
    }
  }

  if (backupMap.size > 0) {
    logger.info(`Backed up ${backupMap.size} file(s)`);
  } else {
    logger.info("No existing files to backup");
  }

  return backupMap;
}

/**
 * Delete all .old backup files from SHIPS_DIR and OUTFITS_DIR.
 * Image files are not backed up, so there are no image backup files to delete.
 */
export function deleteBackupFiles(): void {
  logger.info("Deleting backup files...");
  let deletedCount = 0;

  // Delete .old files in ships directory
  if (existsSync(SHIPS_DIR)) {
    const files = readdirSync(SHIPS_DIR).filter((f) => isBackupFile(f));
    for (const filename of files) {
      const filePath = join(SHIPS_DIR, filename);
      try {
        rmSync(filePath, { force: true });
        deletedCount++;
        logger.debug(`Deleted backup ${filename}`);
      } catch (error) {
        logger.warn(`Failed to delete backup ${filename}: ${error}`);
      }
    }
  }

  // Delete .old files in outfits directory
  if (existsSync(OUTFITS_DIR)) {
    const files = readdirSync(OUTFITS_DIR).filter((f) => isBackupFile(f));
    for (const filename of files) {
      const filePath = join(OUTFITS_DIR, filename);
      try {
        rmSync(filePath, { force: true });
        deletedCount++;
        logger.debug(`Deleted backup ${filename}`);
      } catch (error) {
        logger.warn(`Failed to delete backup ${filename}: ${error}`);
      }
    }
  }

  if (deletedCount > 0) {
    logger.success(`Deleted ${deletedCount} backup file(s)`);
  } else {
    logger.info("No backup files to delete");
  }
}

/**
 * Restore all .old backup files by renaming them back to their original names.
 * This will overwrite any newly generated files with the same name.
 * Only restores JSON files - image files are not backed up.
 */
export function restoreBackupFiles(): void {
  logger.info("Restoring backup files...");
  let restoredCount = 0;

  // Restore .old files in ships directory
  if (existsSync(SHIPS_DIR)) {
    const files = readdirSync(SHIPS_DIR).filter((f) => isBackupFile(f));
    for (const filename of files) {
      const backupPath = join(SHIPS_DIR, filename);
      const originalPath = backupPath.replace(/\.old$/, "");
      try {
        renameSync(backupPath, originalPath);
        restoredCount++;
        logger.debug(
          `Restored ${filename} → ${filename.replace(/\.old$/, "")}`
        );
      } catch (error) {
        logger.warn(`Failed to restore ${filename}: ${error}`);
      }
    }
  }

  // Restore .old files in outfits directory
  if (existsSync(OUTFITS_DIR)) {
    const files = readdirSync(OUTFITS_DIR).filter((f) => isBackupFile(f));
    for (const filename of files) {
      const backupPath = join(OUTFITS_DIR, filename);
      const originalPath = backupPath.replace(/\.old$/, "");
      try {
        renameSync(backupPath, originalPath);
        restoredCount++;
        logger.debug(
          `Restored ${filename} → ${filename.replace(/\.old$/, "")}`
        );
      } catch (error) {
        logger.warn(`Failed to restore ${filename}: ${error}`);
      }
    }
  }

  if (restoredCount > 0) {
    logger.success(`Restored ${restoredCount} backup file(s)`);
  } else {
    logger.info("No backup files to restore");
  }
}

/**
 * Prepare output directories for generation.
 * For JSON files, they are backed up instead of deleted (see backupExistingFiles).
 * Image files are not deleted - the image copier checks file contents before overwriting,
 * so existing images are preserved if they're identical.
 */
export function cleanOutputDirectories(): void {
  logger.info("Cleaning output directories...");

  // Note: JSON files in SHIPS_DIR and OUTFITS_DIR are backed up via backupExistingFiles()
  // Image files in image directories are not deleted - the image copier will check
  // file contents and only overwrite if different

  logger.success("Output directories prepared for generation");
}
