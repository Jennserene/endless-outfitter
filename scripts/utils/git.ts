import { logger } from "@/lib/logger";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { GAME_VERSION } from "@/config/game-version";
import { SUBMODULE_PATH } from "./paths";

/**
 * Get the current git tag/version of the submodule
 */
export function getSubmoduleVersion(): string {
  try {
    const version = execSync("git describe --tags --exact-match", {
      cwd: SUBMODULE_PATH,
      encoding: "utf-8",
    }).trim();
    return version;
  } catch {
    // If not on a tag, try to get the commit hash
    try {
      const commit = execSync("git rev-parse HEAD", {
        cwd: SUBMODULE_PATH,
        encoding: "utf-8",
      }).trim();
      return commit.substring(0, 7);
    } catch {
      throw new Error("Could not determine submodule version");
    }
  }
}

/**
 * Validate that submodule version matches config
 */
export function validateSubmoduleVersion(): void {
  if (!existsSync(SUBMODULE_PATH)) {
    throw new Error(
      `Submodule not found at ${SUBMODULE_PATH}. ` +
        `Please initialize the submodule: git submodule update --init`
    );
  }

  const submoduleVersion = getSubmoduleVersion();
  const expectedVersion = GAME_VERSION;

  if (submoduleVersion !== expectedVersion) {
    throw new Error(
      `Version mismatch: config expects ${expectedVersion}, ` +
        `but submodule is at ${submoduleVersion}. ` +
        `Update config/game-version.ts or checkout the correct submodule version.`
    );
  }

  logger.success(`Version validated: ${submoduleVersion}`);
}
