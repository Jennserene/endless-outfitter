import { existsSync } from "fs";
import { join, extname, dirname } from "path";

/**
 * Common image file extensions to check
 */
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"] as const;

/**
 * Find an image file by checking various possible locations and extensions.
 * Checks if the file exists with different extensions.
 *
 * @param basePath - Base path without extension (e.g., "images/ship/kestrel")
 * @returns Full path to the image file if found, null otherwise
 */
export function findImageFile(basePath: string): string | null {
  // If the path already has an extension, check it directly
  const existingExt = extname(basePath);
  if (
    existingExt &&
    IMAGE_EXTENSIONS.includes(existingExt as (typeof IMAGE_EXTENSIONS)[number])
  ) {
    if (existsSync(basePath)) {
      return basePath;
    }
  }

  // Try with each extension
  for (const ext of IMAGE_EXTENSIONS) {
    const pathWithExt = `${basePath}${ext}`;
    if (existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }

  // If no extension worked, try the path as-is (might already have extension we don't recognize)
  if (existsSync(basePath)) {
    return basePath;
  }

  // Check for numbered animation frames (e.g., archon-0.png, koryfi-00.png, shuttle=0.png)
  // Try both single-digit (-0, -1, =0, =1) and double-digit (-00, -01, =00, =01) patterns
  // We check the first few frames (0-2) to find a representative image
  // Support both `-` and `=` separators
  const baseDir = dirname(basePath);
  const baseName = basePath.substring(baseDir.length + 1);
  const separators = ["-", "="];

  if (existsSync(baseDir)) {
    for (const ext of IMAGE_EXTENSIONS) {
      for (const sep of separators) {
        // Try single-digit pattern (e.g., archon-0.png, shuttle=0.png) - check first 3 frames
        for (let i = 0; i < 3; i++) {
          const numberedPath = join(baseDir, `${baseName}${sep}${i}${ext}`);
          if (existsSync(numberedPath)) {
            return numberedPath;
          }
        }

        // Try double-digit pattern (e.g., koryfi-00.png) - check first 3 frames
        for (let i = 0; i < 3; i++) {
          const paddedNum = i.toString().padStart(2, "0");
          const numberedPath = join(
            baseDir,
            `${baseName}${sep}${paddedNum}${ext}`
          );
          if (existsSync(numberedPath)) {
            return numberedPath;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Resolve an image path from the game data format to an actual file path in the vendor/endless-sky submodule.
 * Handles paths like "ship/kestrel" or "thumbnail/kestrel" and resolves them to actual image files.
 *
 * @param imagePath - Image path from game data (e.g., "ship/kestrel" or "thumbnail/kestrel")
 * @param gameRepoPath - Path to the game repository root (vendor/endless-sky)
 * @returns Full path to the image file if found, null otherwise
 */
export function resolveImagePath(
  imagePath: string,
  gameRepoPath: string
): string | null {
  if (!imagePath || !gameRepoPath) {
    return null;
  }

  // Common locations to check in the game repository
  const possibleBasePaths = [
    join(gameRepoPath, "images", imagePath),
    join(gameRepoPath, "image", imagePath),
    join(gameRepoPath, imagePath),
  ];

  // Try each possible base path
  for (const basePath of possibleBasePaths) {
    const foundPath = findImageFile(basePath);
    if (foundPath) {
      return foundPath;
    }
  }

  return null;
}
