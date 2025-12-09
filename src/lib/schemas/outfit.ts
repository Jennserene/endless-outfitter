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
  // Dynamic attributes - capture all other numeric/string attributes
  attributes: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .default({}),
});

export type Outfit = z.infer<typeof OutfitSchema>;
export { OutfitSchema };
