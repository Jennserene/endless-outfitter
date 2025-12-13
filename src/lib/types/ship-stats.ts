import type { Ship } from "@/lib/schemas/ship";

/**
 * Configuration for rendering a single ship stat attribute.
 */
export type StatConfig = {
  key: keyof Ship["attributes"];
  label: string;
  unit?: string;
  formatter?: (value: number) => string;
  className?: string;
};

/**
 * Configuration for rendering a composite stat that combines multiple attributes.
 */
export type CompositeStatConfig = {
  keys: Array<keyof Ship["attributes"]>;
  label: string;
  formatter: (values: Record<string, number | undefined>) => string;
};
