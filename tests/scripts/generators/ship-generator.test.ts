import { generateShips } from "@scripts/generators/ship-generator";
import { BaseGenerator } from "@scripts/generators/base-generator";
import * as shipConverter from "@scripts/converters/ship-converter";

// Mock BaseGenerator
jest.mock("@scripts/generators/base-generator");

// Mock converter
jest.mock("@scripts/converters/ship-converter", () => ({
  convertRawShipsToZod: jest.fn(),
}));

describe("ship-generator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateShips", () => {
    it("When generating ships, Then should create ShipGenerator and execute", () => {
      // Arrange
      const mockExecute = jest.fn();
      (BaseGenerator as jest.Mock).mockImplementation(
        () =>
          ({
            execute: mockExecute,
          }) as Partial<BaseGenerator<unknown>> as BaseGenerator<unknown>
      );

      // Act
      generateShips();

      // Assert
      expect(BaseGenerator).toHaveBeenCalledWith(
        shipConverter.convertRawShipsToZod,
        expect.any(String), // RAW_SHIP_DIR
        expect.any(String), // SHIPS_DIR
        "ships",
        "ships"
      );
      expect(mockExecute).toHaveBeenCalled();
    });
  });
});
