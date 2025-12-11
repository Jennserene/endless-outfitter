import { retrieveRawData } from "@scripts/parsers/retrieve-raw-data";
import { logger } from "@/lib/logger";
import * as gitUtils from "@scripts/utils/git";
import * as directories from "@scripts/utils/directories";
import * as parseShipTxt from "@scripts/parsers/parse-ship-txt";
import * as parseOutfitTxt from "@scripts/parsers/parse-outfit-txt";

// Mock dependencies
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@scripts/utils/git", () => ({
  validateSubmoduleVersion: jest.fn(),
}));

jest.mock("@scripts/utils/directories", () => ({
  wipeRawDataDirectory: jest.fn(),
}));

jest.mock("@scripts/parsers/parse-ship-txt", () => ({
  parseShipTxt: jest.fn(),
}));

jest.mock("@scripts/parsers/parse-outfit-txt", () => ({
  parseOutfitTxt: jest.fn(),
}));

describe("retrieve-raw-data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("retrieveRawData", () => {
    it("When executing retrieveRawData, Then should execute all steps in order", () => {
      // Act
      retrieveRawData();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        "Starting raw data parsing...\n"
      );
      expect(gitUtils.validateSubmoduleVersion).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Wiping raw data directory...");
      expect(directories.wipeRawDataDirectory).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Parsing ships to JSON without validation..."
      );
      expect(parseShipTxt.parseShipTxt).toHaveBeenCalled();
      expect(parseOutfitTxt.parseOutfitTxt).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith(
        "Raw data parsing completed successfully!"
      );
    });

    it("When validation errors occur, Then should throw and stop execution", () => {
      // Arrange
      (gitUtils.validateSubmoduleVersion as jest.Mock).mockImplementation(
        () => {
          throw new Error("Version mismatch");
        }
      );

      // Act & Assert
      expect(() => {
        retrieveRawData();
      }).toThrow("Version mismatch");

      expect(directories.wipeRawDataDirectory).not.toHaveBeenCalled();
      expect(parseShipTxt.parseShipTxt).not.toHaveBeenCalled();
      expect(parseOutfitTxt.parseOutfitTxt).not.toHaveBeenCalled();
    });

    it("When directory wipe errors occur, Then should throw and stop execution", () => {
      // Arrange
      (gitUtils.validateSubmoduleVersion as jest.Mock).mockReturnValue(
        undefined
      );
      (directories.wipeRawDataDirectory as jest.Mock).mockImplementation(() => {
        throw new Error("Directory wipe failed");
      });

      // Act & Assert
      expect(() => {
        retrieveRawData();
      }).toThrow("Directory wipe failed");

      expect(parseShipTxt.parseShipTxt).not.toHaveBeenCalled();
      expect(parseOutfitTxt.parseOutfitTxt).not.toHaveBeenCalled();
    });

    it("When parse ship errors occur, Then should throw and stop execution", () => {
      // Arrange
      (gitUtils.validateSubmoduleVersion as jest.Mock).mockReturnValue(
        undefined
      );
      (directories.wipeRawDataDirectory as jest.Mock).mockReturnValue(
        undefined
      );
      (parseShipTxt.parseShipTxt as jest.Mock).mockImplementation(() => {
        throw new Error("Parse ship failed");
      });

      // Act & Assert
      expect(() => {
        retrieveRawData();
      }).toThrow("Parse ship failed");

      expect(parseOutfitTxt.parseOutfitTxt).not.toHaveBeenCalled();
    });

    it("When parse outfit errors occur, Then should throw error", () => {
      // Arrange
      (gitUtils.validateSubmoduleVersion as jest.Mock).mockReturnValue(
        undefined
      );
      (directories.wipeRawDataDirectory as jest.Mock).mockReturnValue(
        undefined
      );
      (parseShipTxt.parseShipTxt as jest.Mock).mockReturnValue(undefined);
      (parseOutfitTxt.parseOutfitTxt as jest.Mock).mockImplementation(() => {
        throw new Error("Parse outfit failed");
      });

      // Act & Assert
      expect(() => {
        retrieveRawData();
      }).toThrow("Parse outfit failed");
    });
  });
});
