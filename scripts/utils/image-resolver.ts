import { existsSync } from "fs";
import { join, extname, dirname } from "path";

/**
 * Common image file extensions to check
 */
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"] as const;

/**
 * Check if a file exists with a specific extension
 * @param path - Base path without extension
 * @param ext - Extension to check (e.g., ".png")
 * @returns Full path to the file if found, null otherwise
 */
function checkFileWithExtension(path: string, ext: string): string | null {
  const pathWithExt = `${path}${ext}`;
  if (existsSync(pathWithExt)) {
    return pathWithExt;
  }
  return null;
}

/**
 * Find a specific animation frame by frame number, separator, extension, and padding
 * @param baseDir - Directory containing the image
 * @param baseName - Base filename without extension
 * @param frame - Frame number (0-2)
 * @param separator - Separator character ("-" or "=")
 * @param ext - File extension (e.g., ".png")
 * @param padding - Padding style: "single" for single-digit (0), "double" for double-digit (00)
 * @returns Full path to the animation frame if found, null otherwise
 */
function findAnimationFrame(
  baseDir: string,
  baseName: string,
  frame: number,
  separator: string,
  ext: string,
  padding: "single" | "double"
): string | null {
  const frameNumber =
    padding === "double" ? frame.toString().padStart(2, "0") : frame.toString();
  const numberedPath = join(
    baseDir,
    `${baseName}${separator}${frameNumber}${ext}`
  );
  if (existsSync(numberedPath)) {
    return numberedPath;
  }
  return null;
}

/**
 * Find animation frames by checking various patterns
 * Checks both single-digit and double-digit patterns with different separators
 * @param basePath - Base path without extension
 * @returns Full path to an animation frame if found, null otherwise
 */
function findAnimationFrames(basePath: string): string | null {
  const baseDir = dirname(basePath);
  const baseName = basePath.substring(baseDir.length + 1);
  const separators = ["-", "="];
  const MAX_FRAMES = 3;

  if (!existsSync(baseDir)) {
    return null;
  }

  for (const ext of IMAGE_EXTENSIONS) {
    for (const sep of separators) {
      // Try single-digit pattern (e.g., archon-0.png, shuttle=0.png)
      for (let i = 0; i < MAX_FRAMES; i++) {
        const found = findAnimationFrame(
          baseDir,
          baseName,
          i,
          sep,
          ext,
          "single"
        );
        if (found) {
          return found;
        }
      }

      // Try double-digit pattern (e.g., koryfi-00.png)
      for (let i = 0; i < MAX_FRAMES; i++) {
        const found = findAnimationFrame(
          baseDir,
          baseName,
          i,
          sep,
          ext,
          "double"
        );
        if (found) {
          return found;
        }
      }
    }
  }

  return null;
}

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
    const found = checkFileWithExtension(basePath, ext);
    if (found) {
      return found;
    }
  }

  // If no extension worked, try the path as-is (might already have extension we don't recognize)
  if (existsSync(basePath)) {
    return basePath;
  }

  // Check for numbered animation frames
  return findAnimationFrames(basePath);
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
