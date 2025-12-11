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
import {
  TEST_ITEM_NAMES,
  TEST_LOGGER_MESSAGES,
  TEST_SPECIES,
  TEST_NUMERIC_VALUES,
} from "../__fixtures__/constants";

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

    mockOutfitTransformer = {
      ...createMockTransformer(),
      knownFields: [],
    } as unknown as jest.Mocked<outfitTransformer.OutfitTransformer>;

    (
      outfitTransformer.OutfitTransformer as jest.MockedClass<
        typeof outfitTransformer.OutfitTransformer
      >
    ).mockImplementation(() => mockOutfitTransformer);
  });

  describe("convertOutfitsToZod", () => {
    it("When parsing content, Then should convert to validated outfits", () => {
      // Arrange
      const content = `outfit ${TEST_ITEM_NAMES.OUTFIT}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT}`;
      const rawOutfits = [
        createRawOutfit({
          name: TEST_ITEM_NAMES.OUTFIT,
          mass: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
        }),
      ];
      const transformed = createMockOutfit({
        name: TEST_ITEM_NAMES.OUTFIT,
        mass: TEST_NUMERIC_VALUES.MASS_OUTFIT,
      });
      const validated = createMockOutfit({
        name: TEST_ITEM_NAMES.OUTFIT,
        mass: TEST_NUMERIC_VALUES.MASS_OUTFIT,
      });

      (parseOutfitTxt.parseOutfitData as jest.Mock).mockReturnValue(rawOutfits);
      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockReturnValue(validated);

      // Act
      const result = convertOutfitsToZod(content);

      // Assert
      expect(parseOutfitTxt.parseOutfitData).toHaveBeenCalledWith(content);
      expect(mockOutfitTransformer.transform).toHaveBeenCalledWith(
        rawOutfits[0]
      );
      expect(OutfitSchema.parse).toHaveBeenCalledWith(transformed);
      expect(result).toEqual([validated]);
    });

    it("When parsing multiple outfits, Then should convert all outfits", () => {
      // Arrange
      const content = `outfit ${TEST_ITEM_NAMES.OUTFIT_1}\noutfit ${TEST_ITEM_NAMES.OUTFIT_2}`;
      const rawOutfits = [
        createRawOutfit({ name: TEST_ITEM_NAMES.OUTFIT_1 }),
        createRawOutfit({ name: TEST_ITEM_NAMES.OUTFIT_2 }),
      ];
      const transformed1 = createMockOutfit({ name: TEST_ITEM_NAMES.OUTFIT_1 });
      const transformed2 = createMockOutfit({ name: TEST_ITEM_NAMES.OUTFIT_2 });
      const validated1 = createMockOutfit({ name: TEST_ITEM_NAMES.OUTFIT_1 });
      const validated2 = createMockOutfit({ name: TEST_ITEM_NAMES.OUTFIT_2 });

      (parseOutfitTxt.parseOutfitData as jest.Mock).mockReturnValue(rawOutfits);
      mockOutfitTransformer.transform
        .mockReturnValueOnce(transformed1)
        .mockReturnValueOnce(transformed2);
      (OutfitSchema.parse as jest.Mock)
        .mockReturnValueOnce(validated1)
        .mockReturnValueOnce(validated2);

      // Act
      const result = convertOutfitsToZod(content);

      // Assert
      expect(result).toHaveLength(2);
    });

    it("When validation fails, Then should handle error with handleValidationError", () => {
      // Arrange
      const content = `outfit ${TEST_ITEM_NAMES.OUTFIT}`;
      const rawOutfits = [createRawOutfit({ name: TEST_ITEM_NAMES.OUTFIT })];
      const transformed = createMockOutfit();
      const zodError = createMockZodError();

      (parseOutfitTxt.parseOutfitData as jest.Mock).mockReturnValue(rawOutfits);
      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (
        errorHandling.handleValidationError as unknown as jest.Mock
      ).mockImplementation(() => {
        throw new Error(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);
      });

      // Act & Assert
      expect(() => {
        convertOutfitsToZod(content);
      }).toThrow(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);

      expect(errorHandling.handleValidationError).toHaveBeenCalled();
    });
  });

  describe("convertRawOutfitsToZod", () => {
    it("When converting raw outfits array, Then should return validated outfits", () => {
      // Arrange
      const rawOutfits = [
        createRawOutfit({
          name: TEST_ITEM_NAMES.OUTFIT,
          mass: TEST_NUMERIC_VALUES.MASS_STRING_OUTFIT,
        }),
      ];
      const transformed = createMockOutfit({
        name: TEST_ITEM_NAMES.OUTFIT,
        mass: TEST_NUMERIC_VALUES.MASS_OUTFIT,
      });
      const validated = createMockOutfit({
        name: TEST_ITEM_NAMES.OUTFIT,
        mass: TEST_NUMERIC_VALUES.MASS_OUTFIT,
      });

      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockReturnValue(validated);

      // Act
      const result = convertRawOutfitsToZod(rawOutfits);

      // Assert
      expect(mockOutfitTransformer.transform).toHaveBeenCalledWith(
        rawOutfits[0]
      );
      expect(result).toEqual([validated]);
    });

    it("When validation fails with species, Then should pass species to handleValidationError", () => {
      // Arrange
      const rawOutfits = [createRawOutfit({ name: TEST_ITEM_NAMES.OUTFIT })];
      const transformed = createMockOutfit();
      const zodError = createMockZodError();

      mockOutfitTransformer.transform.mockReturnValue(transformed);
      (OutfitSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (
        errorHandling.handleValidationError as unknown as jest.Mock
      ).mockImplementation(() => {
        throw new Error(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);
      });

      // Act & Assert
      expect(() => {
        convertRawOutfitsToZod(rawOutfits, TEST_SPECIES.PUG);
      }).toThrow(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);

      expect(errorHandling.handleValidationError).toHaveBeenCalledWith(
        expect.any(z.ZodError),
        expect.any(String),
        "outfit",
        TEST_SPECIES.PUG
      );
    });

    it("When converting empty array, Then should return empty array", () => {
      // Act
      const result = convertRawOutfitsToZod([]);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
