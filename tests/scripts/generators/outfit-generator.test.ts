import { generateOutfits } from "@scripts/generators/outfit-generator";
import { BaseGenerator } from "@scripts/generators/base-generator";
import * as outfitConverter from "@scripts/converters/outfit-converter";

// Mock BaseGenerator
jest.mock("@scripts/generators/base-generator");

// Mock converter
jest.mock("@scripts/converters/outfit-converter", () => ({
  convertRawOutfitsToZod: jest.fn(),
}));

describe("outfit-generator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateOutfits", () => {
    it("When generating outfits, Then should create OutfitGenerator and execute", () => {
      // Arrange
      const mockExecute = jest.fn();
      (BaseGenerator as jest.Mock).mockImplementation(
        () =>
          ({
            execute: mockExecute,
          }) as Partial<BaseGenerator<unknown>> as BaseGenerator<unknown>
      );

      // Act
      generateOutfits();

      // Assert
      expect(BaseGenerator).toHaveBeenCalledWith(
        outfitConverter.convertRawOutfitsToZod,
        expect.any(String), // RAW_OUTFIT_DIR
        expect.any(String), // OUTFITS_DIR
        "outfits",
        "outfits"
      );
      expect(mockExecute).toHaveBeenCalled();
    });
  });
});
