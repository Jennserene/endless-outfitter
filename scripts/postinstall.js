#!/usr/bin/env node
// scripts/postinstall.js
const { execSync } = require("child_process");

/**
 * Execute a command with proper error handling and cross-platform support
 * @param {string} command - Command to execute
 * @param {string} description - Description of what the command does
 */
function executeCommand(command, description) {
  try {
    console.log(`${description}...`);
    execSync(command, { stdio: "inherit", shell: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to ${description.toLowerCase()}: ${errorMessage}. ` +
        `This may be expected if git or npm is not available.`
    );
  }
}

// Only run development setup tasks in non-production environments
if (process.env.NODE_ENV !== "production") {
  try {
    console.log("Running development setup tasks...");

    // Initialize git submodules for local development
    // Using shell: true for cross-platform compatibility (Windows cmd.exe, Unix shells)
    executeCommand(
      "git submodule update --init --recursive",
      "Initializing git submodules"
    );

    // Ensure Husky hooks are installed
    // npx handles cross-platform execution automatically
    executeCommand("npx husky install", "Setting up Husky git hooks");

    // Add other development setup tasks here as needed
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `Warning: Failed to complete some setup tasks: ${errorMessage}. ` +
        `This is expected if git is not available.`
    );
  }
} else {
  console.log("Skipping development setup tasks in production.");
}
