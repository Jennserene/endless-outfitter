import {
  convertRawShipsToZod,
  convertShipsToZod,
} from "@scripts/converters/ship-converter";
import * as parseShipTxt from "@scripts/parsers/parse-ship-txt";
import * as shipTransformer from "@scripts/transformers/ship-transformer";
import * as errorHandling from "@scripts/utils/error-handling";
import { ShipSchema } from "@/lib/schemas/ship";
import { z } from "zod";
import {
  createRawShip,
  createMockShipWithAttributes,
  createMockShip,
} from "../__fixtures__/ships";
import { createMockTransformer } from "../__helpers__/transformers";
import { createMockZodError } from "../__helpers__/zod";
import {
  TEST_ITEM_NAMES,
  TEST_LOGGER_MESSAGES,
  TEST_SPECIES,
  TEST_NUMERIC_VALUES,
} from "../__fixtures__/constants";

// Mock dependencies
jest.mock("@scripts/parsers/parse-ship-txt", () => ({
  parseShipData: jest.fn(),
}));

jest.mock("@scripts/transformers/ship-transformer", () => ({
  ShipTransformer: jest.fn(),
}));

jest.mock("@scripts/utils/error-handling", () => ({
  handleValidationError: jest.fn(),
}));

jest.mock("@/lib/schemas/ship", () => ({
  ShipSchema: {
    parse: jest.fn(),
  },
}));

describe("ship-converter", () => {
  let mockShipTransformer: jest.Mocked<shipTransformer.ShipTransformer>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockShipTransformer = {
      ...createMockTransformer(),
      transformers: [],
    } as unknown as jest.Mocked<shipTransformer.ShipTransformer>;

    (
      shipTransformer.ShipTransformer as jest.MockedClass<
        typeof shipTransformer.ShipTransformer
      >
    ).mockImplementation(() => mockShipTransformer);
  });

  describe("convertShipsToZod", () => {
    it("When parsing content, Then should convert to validated ships", () => {
      // Arrange
      const content = `ship ${TEST_ITEM_NAMES.SHIP}\n\tmass ${TEST_NUMERIC_VALUES.MASS_STRING_SHIP}`;
      const rawShips = [
        createRawShip({
          name: TEST_ITEM_NAMES.SHIP,
          mass: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
        }),
      ];
      const transformed = createMockShipWithAttributes({
        mass: TEST_NUMERIC_VALUES.MASS_SHIP,
      });
      const validated = createMockShipWithAttributes({
        mass: TEST_NUMERIC_VALUES.MASS_SHIP,
      });

      (parseShipTxt.parseShipData as jest.Mock).mockReturnValue(rawShips);
      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockReturnValue(validated);

      // Act
      const result = convertShipsToZod(content);

      // Assert
      expect(parseShipTxt.parseShipData).toHaveBeenCalledWith(content);
      expect(mockShipTransformer.transform).toHaveBeenCalledWith(rawShips[0]);
      expect(ShipSchema.parse).toHaveBeenCalledWith(transformed);
      expect(result).toEqual([validated]);
    });

    it("When parsing multiple ships, Then should convert all ships", () => {
      // Arrange
      const content = `ship ${TEST_ITEM_NAMES.SHIP_1}\nship ${TEST_ITEM_NAMES.SHIP_2}`;
      const rawShips = [
        createRawShip({ name: TEST_ITEM_NAMES.SHIP_1 }),
        createRawShip({ name: TEST_ITEM_NAMES.SHIP_2 }),
      ];
      const transformed1 = createMockShip({ name: TEST_ITEM_NAMES.SHIP_1 });
      const transformed2 = createMockShip({ name: TEST_ITEM_NAMES.SHIP_2 });
      const validated1 = createMockShip({ name: TEST_ITEM_NAMES.SHIP_1 });
      const validated2 = createMockShip({ name: TEST_ITEM_NAMES.SHIP_2 });

      (parseShipTxt.parseShipData as jest.Mock).mockReturnValue(rawShips);
      mockShipTransformer.transform
        .mockReturnValueOnce(transformed1)
        .mockReturnValueOnce(transformed2);
      (ShipSchema.parse as jest.Mock)
        .mockReturnValueOnce(validated1)
        .mockReturnValueOnce(validated2);

      // Act
      const result = convertShipsToZod(content);

      // Assert
      expect(result).toHaveLength(2);
    });

    it("When validation fails, Then should handle error with handleValidationError", () => {
      // Arrange
      const content = `ship ${TEST_ITEM_NAMES.SHIP}`;
      const rawShips = [createRawShip({ name: TEST_ITEM_NAMES.SHIP })];
      const transformed = createMockShip();
      const zodError = createMockZodError();

      (parseShipTxt.parseShipData as jest.Mock).mockReturnValue(rawShips);
      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (
        errorHandling.handleValidationError as unknown as jest.Mock
      ).mockImplementation(() => {
        throw new Error(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);
      });

      // Act & Assert
      expect(() => {
        convertShipsToZod(content);
      }).toThrow(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);

      expect(errorHandling.handleValidationError).toHaveBeenCalled();
    });
  });

  describe("convertRawShipsToZod", () => {
    it("When converting raw ships array, Then should return validated ships", () => {
      // Arrange
      const rawShips = [
        createRawShip({
          name: TEST_ITEM_NAMES.SHIP,
          mass: TEST_NUMERIC_VALUES.MASS_STRING_SHIP,
        }),
      ];
      const transformed = createMockShipWithAttributes({
        mass: TEST_NUMERIC_VALUES.MASS_SHIP,
      });
      const validated = createMockShipWithAttributes({
        mass: TEST_NUMERIC_VALUES.MASS_SHIP,
      });

      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockReturnValue(validated);

      // Act
      const result = convertRawShipsToZod(rawShips);

      // Assert
      expect(mockShipTransformer.transform).toHaveBeenCalledWith(rawShips[0]);
      expect(result).toEqual([validated]);
    });

    it("When validation fails with species, Then should pass species to handleValidationError", () => {
      // Arrange
      const rawShips = [createRawShip({ name: TEST_ITEM_NAMES.SHIP })];
      const transformed = createMockShip();
      const zodError = createMockZodError();

      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (
        errorHandling.handleValidationError as unknown as jest.Mock
      ).mockImplementation(() => {
        throw new Error(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);
      });

      // Act & Assert
      expect(() => {
        convertRawShipsToZod(rawShips, TEST_SPECIES.HUMAN);
      }).toThrow(TEST_LOGGER_MESSAGES.VALIDATION_FAILED);

      expect(errorHandling.handleValidationError).toHaveBeenCalledWith(
        expect.any(z.ZodError),
        expect.any(String),
        "ship",
        TEST_SPECIES.HUMAN
      );
    });

    it("When converting empty array, Then should return empty array", () => {
      // Act
      const result = convertRawShipsToZod([]);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
