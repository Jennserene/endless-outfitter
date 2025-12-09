#!/usr/bin/env node
// scripts/postinstall.js
const { execSync } = require("child_process");

// Only run development setup tasks in non-production environments
if (process.env.NODE_ENV !== "production") {
  try {
    console.log("Running development setup tasks...");

    // Initialize git submodules for local development
    console.log("Initializing git submodules...");
    execSync("git submodule update --init --recursive", { stdio: "inherit" });

    // Add other development setup tasks here as needed
  } catch {
    console.warn(
      "Warning: Failed to complete some setup tasks. This is expected if git is not available."
    );
  }
} else {
  console.log("Skipping development setup tasks in production.");
}
