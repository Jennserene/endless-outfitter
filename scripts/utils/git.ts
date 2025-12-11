import { logger } from "@/lib/logger";
import { existsSync } from "fs";
import {
  execSync,
  type ExecSyncOptionsWithStringEncoding,
} from "child_process";
import { GAME_VERSION } from "@config/game-version";
import { SUBMODULE_PATH } from "./paths";

/**
 * Execute git command with proper error handling and cross-platform support
 * @param command - Git command to execute (without 'git' prefix)
 * @returns Command output as string
 * @throws Error with actionable message if command fails
 */
function executeGitCommand(command: string): string {
  try {
    // Use shell option for cross-platform compatibility
    // This ensures proper handling on Windows (cmd.exe) and Unix shells
    // Note: Using type assertion because ExecSyncOptionsWithStringEncoding
    // doesn't include shell in its type definition, but it works at runtime
    const options = {
      cwd: SUBMODULE_PATH,
      encoding: "utf-8" as const,
      shell: true,
    } as unknown as ExecSyncOptionsWithStringEncoding;
    const result = execSync(`git ${command}`, options);
    return result.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Git command failed: 'git ${command}'. ` +
        `Error: ${errorMessage}. ` +
        `Ensure git is installed and the submodule is properly initialized.`
    );
  }
}

/**
 * Get the current git tag/version of the submodule
 */
export function getSubmoduleVersion(): string {
  try {
    const version = executeGitCommand("describe --tags --exact-match");
    return version;
  } catch {
    // If not on a tag, try to get the commit hash
    try {
      const commit = executeGitCommand("rev-parse HEAD");
      return commit.substring(0, 7);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Could not determine submodule version: ${errorMessage}. ` +
          `Ensure the submodule is initialized and contains valid git history.`
      );
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
