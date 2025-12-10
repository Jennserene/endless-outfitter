import { z } from "zod";

const OutfitSchema = z.object({
  name: z.string(),
  plural: z.string().optional(),
  category: z.string().optional(),
  series: z.string().optional(),
  index: z.number().optional(),
  cost: z.number().optional(),
  thumbnail: z.string().optional(),
  mass: z.number().optional(),
  "outfit space": z.number().optional(),
  descriptions: z.array(z.string()).default([]),
  // Dynamic attributes - capture all other numeric/string/array/object attributes
  // Using z.any() for flexibility with nested structures in weapon objects, etc.
  attributes: z.record(z.string(), z.any()).default({}),
});

export type Outfit = z.infer<typeof OutfitSchema>;
export { OutfitSchema };
