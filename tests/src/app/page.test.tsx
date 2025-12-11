/**
 * Tests for src/app/page.tsx
 * Home page that redirects to outfitting
 */

import { redirect } from "next/navigation";
import HomePage from "@/app/page";
import { TEST_ROUTES } from "../__helpers__/test-constants";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to outfitting route", () => {
    HomePage();

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith(TEST_ROUTES.OUTFITTING);
  });
});
