/**
 * Reusable test constants for src/app tests
 * Keeps test data separate from tests for reusability
 */

export const TEST_ROUTES = {
  HOME: "/",
  OUTFITTER: "/outfitter",
  SEARCH: "/search",
  SHIPS: "/ships",
} as const;

export const TEST_MESSAGES = {
  ERROR_GENERIC: "Something went wrong!",
  ERROR_OUTFITTER: "Outfitter page error:",
  ERROR_SEARCH: "Search page error:",
  LOADING_GENERIC: "Loading...",
  LOADING_OUTFITTER: "Loading outfitter...",
  LOADING_SEARCH: "Loading search...",
  NOT_FOUND_TITLE: "404",
  NOT_FOUND_MESSAGE: "Page not found",
  TRY_AGAIN: "Try again",
  GO_TO_OUTFITTER: "Go to Outfitter",
} as const;

export const TEST_METADATA = {
  ROOT_TITLE: "Endless Outfitter",
  ROOT_DESCRIPTION: "Ship outfitter tool for Endless Sky",
  OUTFITTER_TITLE: "Endless Outfitter - Ship Outfitter",
  OUTFITTER_DESCRIPTION: "Modify and configure ship outfits for Endless Sky",
  SEARCH_TITLE: "Search - Endless Outfitter",
  SEARCH_DESCRIPTION: "Search for ships, outfits, and other game data",
} as const;

export const TEST_ERROR_MESSAGE = "Test error message";
export const TEST_ERROR_DIGEST = "test-error-digest";

export const TEST_SHIP_NAME = "Argosy";
export const TEST_SEARCH_QUERY = "test query";
export const TEST_SEARCH_TYPE = "ships";
