/**
 * Test constants for image paths
 */

export const TEST_IMAGE_PATHS = {
  SHIP_SPRITE: "ship/kestrel",
  SHIP_THUMBNAIL: "thumbnail/kestrel",
  OUTFIT_THUMBNAIL: "thumbnail/engine",
  ANOTHER_SPRITE: "ship/fighter",
  ANOTHER_THUMBNAIL: "thumbnail/fighter",
} as const;

export const TEST_IMAGE_PATHS_WITH_EXT = {
  SHIP_SPRITE: "ship/kestrel.png",
  SHIP_THUMBNAIL: "thumbnail/kestrel.png",
  OUTFIT_THUMBNAIL: "thumbnail/engine.png",
} as const;

export const TEST_GAME_REPO_PATH = "/test/vendor/endless-sky";
export const TEST_ASSETS_DIR = "/test/public/assets/images";
