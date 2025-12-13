import { copyFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { logger } from "@/lib/logger";
import { resolveImagePath } from "./image-resolver";

/**
 * Compare two files to check if they have the same contents.
 *
 * @param filePath1 - Path to first file
 * @param filePath2 - Path to second file
 * @returns true if files have the same contents, false otherwise
 */
function filesHaveSameContents(filePath1: string, filePath2: string): boolean {
  try {
    const content1 = readFileSync(filePath1);
    const content2 = readFileSync(filePath2);
    return content1.equals(content2);
  } catch {
    // If either file can't be read, assume they're different
    return false;
  }
}

/**
 * Copy a single image file from source to destination, creating directories as needed.
 * If the destination file already exists and has the same contents, the copy is skipped.
 *
 * @param sourcePath - Full path to source image file
 * @param destPath - Full path to destination image file
 * @returns true if file was copied, false if skipped due to identical contents
 * @throws Error if source file doesn't exist or copy fails
 */
export function copyImageFile(sourcePath: string, destPath: string): boolean {
  if (!existsSync(sourcePath)) {
    throw new Error(`Source image file not found: ${sourcePath}`);
  }

  // Create destination directory if it doesn't exist
  const destDir = dirname(destPath);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  // If destination file exists, check if contents are the same
  if (existsSync(destPath)) {
    if (filesHaveSameContents(sourcePath, destPath)) {
      // Files are identical, skip copying
      return false;
    }
    // Files are different, will overwrite
  }

  try {
    copyFileSync(sourcePath, destPath);
    return true;
  } catch (error) {
    throw new Error(
      `Failed to copy image from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Copy all image files to the assets directory.
 * Resolves image paths from game data format and copies them to public/assets/images/.
 *
 * @param imagePaths - Set of unique image paths from game data
 * @param gameRepoPath - Path to the game repository root
 * @param assetsDir - Path to the assets images directory (public/assets/images)
 * @returns Statistics about the copy operation
 */
export function copyImagesToAssets(
  imagePaths: Set<string>,
  gameRepoPath: string,
  assetsDir: string
): { copied: number; failed: number } {
  let copied = 0;
  let failed = 0;

  for (const imagePath of imagePaths) {
    try {
      // Resolve the image path to actual file location
      const sourcePath = resolveImagePath(imagePath, gameRepoPath);

      if (!sourcePath) {
        logger.warn(`Could not resolve image path: ${imagePath}`);
        failed++;
        continue;
      }

      // Create destination path maintaining directory structure
      // Use the resolved source path's extension if the imagePath doesn't have one
      const imagePathExt = imagePath.match(/\.[^.]+$/)?.[0];
      const sourcePathExt = sourcePath.match(/\.[^.]+$/)?.[0];

      let destPath = join(assetsDir, imagePath);
      // If imagePath has no extension but sourcePath does, add it
      if (!imagePathExt && sourcePathExt) {
        destPath = `${destPath}${sourcePathExt}`;
      }

      const wasCopied = copyImageFile(sourcePath, destPath);
      if (wasCopied) {
        copied++;
      }
    } catch (error) {
      logger.warn(
        `Failed to copy image ${imagePath}: ${error instanceof Error ? error.message : String(error)}`
      );
      failed++;
    }
  }

  return { copied, failed };
}
