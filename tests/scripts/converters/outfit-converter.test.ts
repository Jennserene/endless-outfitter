import {
  convertRawOutfitsToZod,
  convertOutfitsToZod,
} from "@scripts/converters/outfit-converter";
import * as parseOutfitTxt from "@scripts/parsers/parse-outfit-txt";
import * as outfitTransformer from "@scripts/transformers/outfit-transformer";
import * as errorHandling from "@scripts/utils/error-handling";
import { OutfitSchema } from "@/lib/schemas/outfit";
import { z } from "zod";
import { createRawOutfit, createMockOutfit } from "../__fixtures__/outfits";
import { createMockTransformer } from "../__helpers__/transformers";
import { createMockZodError } from "../__helpers__/zod";

// Mock dependencies
jest.mock("@scripts/parsers/parse-outfit-txt", () => ({
  parseOutfitData: jest.fn(),
}));

jest.mock("@scripts/transformers/outfit-transformer", () => ({
  OutfitTransformer: jest.fn(),
}));

jest.mock("@scripts/utils/error-handling", () => ({
  handleValidationError: jest.fn(),
}));

jest.mock("@/lib/schemas/outfit", () => ({
  OutfitSchema: {
    parse: jest.fn(),
  },
}));

describe("outfit-converter", () => {
  let mockOutfitTransformer: jest.Mocked<outfitTransformer.OutfitTransformer>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOutfitTransformer =
      createMockTransformer() as jest.Mocked<outfitTransformer.OutfitTransformer>;

    (
      outfitTransformer.OutfitTransformer as jest.MockedClass<
        typeof outfitTransformer.OutfitTransformer
      >
    ).mockImplementation(() => mockOutfitTransformer);
  });

  describe("convertOutfitsToZod", () => {
    it("should parse content and convert to validated outfits", () => {
      const content = "outfit Test Outfit\n\tmass 10";
      const rawOutfits = [createRawOutfit({ name: "Test Outfit", mass: "10" })];
      const transformed = createMockOutfit({ name: "Test Outfit", mass: 10 });
      const validated = createMockOutfit({ name: "Test Outfit", mass: 10 });

      (parseOutfitTxt.parseOutfitData as jest.Mock).mockReturnValue(rawOutfits);
      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockReturnValue(validated);

      const result = convertOutfitsToZod(content);

      expect(parseOutfitTxt.parseOutfitData).toHaveBeenCalledWith(content);
      expect(mockOutfitTransformer.transform).toHaveBeenCalledWith(
        rawOutfits[0]
      );
      expect(OutfitSchema.parse).toHaveBeenCalledWith(transformed);
      expect(result).toEqual([validated]);
    });

    it("should handle multiple outfits", () => {
      const content = "outfit Outfit1\noutfit Outfit2";
      const rawOutfits = [
        createRawOutfit({ name: "Outfit1" }),
        createRawOutfit({ name: "Outfit2" }),
      ];
      const transformed1 = createMockOutfit({ name: "Outfit1" });
      const transformed2 = createMockOutfit({ name: "Outfit2" });
      const validated1 = createMockOutfit({ name: "Outfit1" });
      const validated2 = createMockOutfit({ name: "Outfit2" });

      (parseOutfitTxt.parseOutfitData as jest.Mock).mockReturnValue(rawOutfits);
      mockOutfitTransformer.transform
        .mockReturnValueOnce(transformed1)
        .mockReturnValueOnce(transformed2);
      (OutfitSchema.parse as jest.Mock)
        .mockReturnValueOnce(validated1)
        .mockReturnValueOnce(validated2);

      const result = convertOutfitsToZod(content);

      expect(result).toHaveLength(2);
    });

    it("should handle validation errors with handleValidationError", () => {
      const content = "outfit Test Outfit";
      const rawOutfits = [createRawOutfit({ name: "Test Outfit" })];
      const transformed = createMockOutfit();
      const zodError = createMockZodError();

      (parseOutfitTxt.parseOutfitData as jest.Mock).mockReturnValue(rawOutfits);
      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (errorHandling.handleValidationError as jest.Mock).mockImplementation(
        () => {
          throw new Error("Validation failed");
        }
      );

      expect(() => {
        convertOutfitsToZod(content);
      }).toThrow("Validation failed");

      expect(errorHandling.handleValidationError).toHaveBeenCalled();
    });
  });

  describe("convertRawOutfitsToZod", () => {
    it("should convert raw outfits array to validated outfits", () => {
      const rawOutfits = [createRawOutfit({ name: "Test Outfit", mass: "10" })];
      const transformed = createMockOutfit({ name: "Test Outfit", mass: 10 });
      const validated = createMockOutfit({ name: "Test Outfit", mass: 10 });

      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockReturnValue(validated);

      const result = convertRawOutfitsToZod(rawOutfits);

      expect(mockOutfitTransformer.transform).toHaveBeenCalledWith(
        rawOutfits[0]
      );
      expect(result).toEqual([validated]);
    });

    it("should pass species to handleValidationError on validation failure", () => {
      const rawOutfits = [createRawOutfit({ name: "Test Outfit" })];
      const transformed = createMockOutfit();
      const zodError = createMockZodError();

      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (errorHandling.handleValidationError as jest.Mock).mockImplementation(
        () => {
          throw new Error("Validation failed");
        }
      );

      expect(() => {
        convertRawOutfitsToZod(rawOutfits, "pug");
      }).toThrow("Validation failed");

      expect(errorHandling.handleValidationError).toHaveBeenCalledWith(
        expect.any(z.ZodError),
        expect.any(String),
        "outfit",
        "pug"
      );
    });

    it("should handle empty array", () => {
      const result = convertRawOutfitsToZod([]);
      expect(result).toEqual([]);
    });
  });
});
