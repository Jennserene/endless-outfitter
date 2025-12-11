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

    mockShipTransformer =
      createMockTransformer() as jest.Mocked<shipTransformer.ShipTransformer>;

    (
      shipTransformer.ShipTransformer as jest.MockedClass<
        typeof shipTransformer.ShipTransformer
      >
    ).mockImplementation(() => mockShipTransformer);
  });

  describe("convertShipsToZod", () => {
    it("should parse content and convert to validated ships", () => {
      const content = "ship Test Ship\n\tmass 100";
      const rawShips = [createRawShip({ name: "Test Ship", mass: "100" })];
      const transformed = createMockShipWithAttributes({ mass: 100 });
      const validated = createMockShipWithAttributes({ mass: 100 });

      (parseShipTxt.parseShipData as jest.Mock).mockReturnValue(rawShips);
      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockReturnValue(validated);

      const result = convertShipsToZod(content);

      expect(parseShipTxt.parseShipData).toHaveBeenCalledWith(content);
      expect(mockShipTransformer.transform).toHaveBeenCalledWith(rawShips[0]);
      expect(ShipSchema.parse).toHaveBeenCalledWith(transformed);
      expect(result).toEqual([validated]);
    });

    it("should handle multiple ships", () => {
      const content = "ship Ship1\nship Ship2";
      const rawShips = [
        createRawShip({ name: "Ship1" }),
        createRawShip({ name: "Ship2" }),
      ];
      const transformed1 = createMockShip({ name: "Ship1" });
      const transformed2 = createMockShip({ name: "Ship2" });
      const validated1 = createMockShip({ name: "Ship1" });
      const validated2 = createMockShip({ name: "Ship2" });

      (parseShipTxt.parseShipData as jest.Mock).mockReturnValue(rawShips);
      mockShipTransformer.transform
        .mockReturnValueOnce(transformed1)
        .mockReturnValueOnce(transformed2);
      (ShipSchema.parse as jest.Mock)
        .mockReturnValueOnce(validated1)
        .mockReturnValueOnce(validated2);

      const result = convertShipsToZod(content);

      expect(result).toHaveLength(2);
    });

    it("should handle validation errors with handleValidationError", () => {
      const content = "ship Test Ship";
      const rawShips = [createRawShip({ name: "Test Ship" })];
      const transformed = createMockShip();
      const zodError = createMockZodError();

      (parseShipTxt.parseShipData as jest.Mock).mockReturnValue(rawShips);
      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (errorHandling.handleValidationError as jest.Mock).mockImplementation(
        () => {
          throw new Error("Validation failed");
        }
      );

      expect(() => {
        convertShipsToZod(content);
      }).toThrow("Validation failed");

      expect(errorHandling.handleValidationError).toHaveBeenCalled();
    });
  });

  describe("convertRawShipsToZod", () => {
    it("should convert raw ships array to validated ships", () => {
      const rawShips = [createRawShip({ name: "Test Ship", mass: "100" })];
      const transformed = createMockShipWithAttributes({ mass: 100 });
      const validated = createMockShipWithAttributes({ mass: 100 });

      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockReturnValue(validated);

      const result = convertRawShipsToZod(rawShips);

      expect(mockShipTransformer.transform).toHaveBeenCalledWith(rawShips[0]);
      expect(result).toEqual([validated]);
    });

    it("should pass species to handleValidationError on validation failure", () => {
      const rawShips = [createRawShip({ name: "Test Ship" })];
      const transformed = createMockShip();
      const zodError = createMockZodError();

      mockShipTransformer.transform.mockReturnValue(transformed);
      (ShipSchema.parse as jest.Mock).mockImplementation(() => {
        throw zodError;
      });
      (errorHandling.handleValidationError as jest.Mock).mockImplementation(
        () => {
          throw new Error("Validation failed");
        }
      );

      expect(() => {
        convertRawShipsToZod(rawShips, "human");
      }).toThrow("Validation failed");

      expect(errorHandling.handleValidationError).toHaveBeenCalledWith(
        expect.any(z.ZodError),
        expect.any(String),
        "ship",
        "human"
      );
    });

    it("should handle empty array", () => {
      const result = convertRawShipsToZod([]);
      expect(result).toEqual([]);
    });
  });
});
