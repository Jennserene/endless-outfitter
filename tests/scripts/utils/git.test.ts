// Mock child_process first
jest.mock("child_process", () => ({
  execSync: jest.fn(),
}));

// Mock fs
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  logger: {
    success: jest.fn(),
  },
}));

// Mock paths
jest.mock("@scripts/utils/paths", () => ({
  SUBMODULE_PATH: "/test/vendor/endless-sky",
}));

// Mock game-version config
jest.mock("@config/game-version", () => ({
  GAME_VERSION: "v0.10.16",
}));

import {
  getSubmoduleVersion,
  validateSubmoduleVersion,
} from "@scripts/utils/git";
import { logger } from "@/lib/logger";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { GAME_VERSION } from "@config/game-version";
import * as paths from "@scripts/utils/paths";

describe("git", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSubmoduleVersion", () => {
    it("When submodule is on exact tag, Then should return tag version", () => {
      // Arrange
      (execSync as jest.Mock).mockReturnValueOnce("v0.10.16\n");

      // Act
      const version = getSubmoduleVersion();

      // Assert
      expect(version).toBe("v0.10.16");
      expect(execSync).toHaveBeenCalledWith(
        "git describe --tags --exact-match",
        {
          cwd: paths.SUBMODULE_PATH,
          encoding: "utf-8",
          shell: true,
        }
      );
    });

    it("When submodule is not on tag, Then should return commit hash", () => {
      // Arrange
      (execSync as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error("Not on tag");
        })
        .mockReturnValueOnce("abc1234def5678\n");

      // Act
      const version = getSubmoduleVersion();

      // Assert
      expect(version).toBe("abc1234");
      expect(execSync).toHaveBeenCalledTimes(2);
      expect(execSync).toHaveBeenNthCalledWith(
        1,
        "git describe --tags --exact-match",
        {
          cwd: paths.SUBMODULE_PATH,
          encoding: "utf-8",
          shell: true,
        }
      );
      expect(execSync).toHaveBeenNthCalledWith(2, "git rev-parse HEAD", {
        cwd: paths.SUBMODULE_PATH,
        encoding: "utf-8",
        shell: true,
      });
    });

    it("When both git commands fail, Then should throw error", () => {
      // Arrange
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error("Git command failed");
      });

      // Act & Assert
      expect(() => {
        getSubmoduleVersion();
      }).toThrow("Could not determine submodule version");
    });
  });

  describe("validateSubmoduleVersion", () => {
    it("When version matches, Then should succeed and log success", () => {
      // Arrange
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (execSync as jest.Mock).mockReturnValueOnce("v0.10.16\n");

      // Act
      validateSubmoduleVersion();

      // Assert
      expect(logger.success).toHaveBeenCalledWith(
        "Version validated: v0.10.16"
      );
    });

    it("When submodule path does not exist, Then should throw error", () => {
      // Arrange
      (existsSync as jest.Mock).mockReturnValueOnce(false);

      // Act & Assert
      expect(() => {
        validateSubmoduleVersion();
      }).toThrow(
        `Submodule not found at ${paths.SUBMODULE_PATH}. Please initialize the submodule: git submodule update --init`
      );
    });

    it("When version does not match, Then should throw error", () => {
      // Arrange
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (execSync as jest.Mock).mockReturnValueOnce("v0.10.15\n");

      // Act & Assert
      expect(() => {
        validateSubmoduleVersion();
      }).toThrow(
        `Version mismatch: config expects ${GAME_VERSION}, but submodule is at v0.10.15. Update config/game-version.ts or checkout the correct submodule version.`
      );
    });

    it("When submodule is on commit hash, Then should throw version mismatch", () => {
      // Arrange
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (execSync as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error("Not on tag");
        })
        .mockReturnValueOnce("abc1234def5678\n");

      // Act & Assert
      // This will fail because commit hash won't match GAME_VERSION
      expect(() => {
        validateSubmoduleVersion();
      }).toThrow(/Version mismatch/);
    });
  });
});
