"use client";

import { useContext } from "react";

import { OutfitterContext, type OutfitterContextValue } from "./context";

export function useOutfitter(): OutfitterContextValue {
  const context = useContext(OutfitterContext);
  if (!context) {
    throw new Error("useOutfitter must be used within OutfitterProvider");
  }
  return context;
}
