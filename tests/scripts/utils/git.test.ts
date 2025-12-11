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
    it("should return tag version when on exact tag", () => {
      (execSync as jest.Mock).mockReturnValueOnce("v0.10.16\n");

      const version = getSubmoduleVersion();

      expect(version).toBe("v0.10.16");
      expect(execSync).toHaveBeenCalledWith(
        "git describe --tags --exact-match",
        {
          cwd: paths.SUBMODULE_PATH,
          encoding: "utf-8",
        }
      );
    });

    it("should return commit hash when not on tag", () => {
      (execSync as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error("Not on tag");
        })
        .mockReturnValueOnce("abc1234def5678\n");

      const version = getSubmoduleVersion();

      expect(version).toBe("abc1234");
      expect(execSync).toHaveBeenCalledTimes(2);
      expect(execSync).toHaveBeenNthCalledWith(
        1,
        "git describe --tags --exact-match",
        {
          cwd: paths.SUBMODULE_PATH,
          encoding: "utf-8",
        }
      );
      expect(execSync).toHaveBeenNthCalledWith(2, "git rev-parse HEAD", {
        cwd: paths.SUBMODULE_PATH,
        encoding: "utf-8",
      });
    });

    it("should throw when both git commands fail", () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error("Git command failed");
      });

      expect(() => {
        getSubmoduleVersion();
      }).toThrow("Could not determine submodule version");
    });
  });

  describe("validateSubmoduleVersion", () => {
    it("should succeed when version matches", () => {
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (execSync as jest.Mock).mockReturnValueOnce("v0.10.16\n");

      validateSubmoduleVersion();

      expect(logger.success).toHaveBeenCalledWith(
        "Version validated: v0.10.16"
      );
    });

    it("should throw when submodule path does not exist", () => {
      (existsSync as jest.Mock).mockReturnValueOnce(false);

      expect(() => {
        validateSubmoduleVersion();
      }).toThrow(
        `Submodule not found at ${paths.SUBMODULE_PATH}. Please initialize the submodule: git submodule update --init`
      );
    });

    it("should throw when version does not match", () => {
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (execSync as jest.Mock).mockReturnValueOnce("v0.10.15\n");

      expect(() => {
        validateSubmoduleVersion();
      }).toThrow(
        `Version mismatch: config expects ${GAME_VERSION}, but submodule is at v0.10.15. Update config/game-version.ts or checkout the correct submodule version.`
      );
    });

    it("should handle commit hash version", () => {
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (execSync as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error("Not on tag");
        })
        .mockReturnValueOnce("abc1234def5678\n");

      // This will fail because commit hash won't match GAME_VERSION
      expect(() => {
        validateSubmoduleVersion();
      }).toThrow(/Version mismatch/);
    });
  });
});
