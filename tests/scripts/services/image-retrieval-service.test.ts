import { ImageRetrievalService } from "@scripts/services/image-retrieval-service";
import * as imageExtractor from "@scripts/utils/image-extractor";
import * as imageCopier from "@scripts/utils/image-copier";
import { logger } from "@/lib/logger";
import { createMockShip } from "../__fixtures__/ships";
import { createMockOutfit } from "../__fixtures__/outfits";
import { TEST_IMAGE_PATHS } from "../__fixtures__/images";

// Mock dependencies
jest.mock("@scripts/utils/image-extractor", () => ({
  extractImagePaths: jest.fn(),
}));

jest.mock("@scripts/utils/image-copier", () => ({
  copyImagesToAssets: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
  },
}));

describe("ImageRetrievalService", () => {
  let service: ImageRetrievalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ImageRetrievalService();
  });

  describe("retrieveImages", () => {
    it("should extract paths and copy images", () => {
      const ships = [createMockShip({ sprite: TEST_IMAGE_PATHS.SHIP_SPRITE })];
      const outfits = [
        createMockOutfit({ thumbnail: TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL }),
      ];
      const imagePaths = new Set([
        TEST_IMAGE_PATHS.SHIP_SPRITE,
        TEST_IMAGE_PATHS.OUTFIT_THUMBNAIL,
      ]);

      (imageExtractor.extractImagePaths as jest.Mock).mockReturnValue(
        imagePaths
      );
      (imageCopier.copyImagesToAssets as jest.Mock).mockReturnValue({
        copied: 2,
        failed: 0,
      });

      service.retrieveImages(ships, outfits);

      expect(imageExtractor.extractImagePaths).toHaveBeenCalledWith(
        ships,
        outfits
      );
      expect(imageCopier.copyImagesToAssets).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Extracting image paths from ships and outfits..."
      );
      expect(logger.info).toHaveBeenCalledWith("Found 2 unique image path(s)");
      expect(logger.info).toHaveBeenCalledWith(
        "Copying images to assets directory..."
      );
      expect(logger.success).toHaveBeenCalledWith(
        "Image retrieval completed: 2 copied, 0 failed"
      );
    });

    it("should handle empty image paths", () => {
      const ships = [createMockShip()];
      const outfits = [createMockOutfit()];
      const imagePaths = new Set<string>();

      (imageExtractor.extractImagePaths as jest.Mock).mockReturnValue(
        imagePaths
      );

      service.retrieveImages(ships, outfits);

      expect(logger.info).toHaveBeenCalledWith("No images to retrieve");
      expect(imageCopier.copyImagesToAssets).not.toHaveBeenCalled();
    });

    it("should log failed copies", () => {
      const ships = [createMockShip({ sprite: TEST_IMAGE_PATHS.SHIP_SPRITE })];
      const outfits: unknown[] = [];
      const imagePaths = new Set([TEST_IMAGE_PATHS.SHIP_SPRITE]);

      (imageExtractor.extractImagePaths as jest.Mock).mockReturnValue(
        imagePaths
      );
      (imageCopier.copyImagesToAssets as jest.Mock).mockReturnValue({
        copied: 1,
        failed: 1,
      });

      service.retrieveImages(ships, outfits);

      expect(logger.success).toHaveBeenCalledWith(
        "Image retrieval completed: 1 copied, 1 failed"
      );
    });

    it("should use custom logger if provided", () => {
      const customLogger = {
        info: jest.fn(),
        success: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
      const serviceWithLogger = new ImageRetrievalService(customLogger);
      const ships = [createMockShip()];
      const outfits: unknown[] = [];
      const imagePaths = new Set<string>();

      (imageExtractor.extractImagePaths as jest.Mock).mockReturnValue(
        imagePaths
      );

      serviceWithLogger.retrieveImages(ships, outfits);

      expect(customLogger.info).toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
