import { z } from "zod";

const ShipAttributeSchema = z.object({
  category: z.string(),
  cost: z.number().optional(),
  shields: z.number().optional(),
  hull: z.number().optional(),
  "required crew": z.number().optional(),
  bunks: z.number().optional(),
  mass: z.number().optional(),
  drag: z.number().optional(),
  "heat dissipation": z.number().optional(),
  "fuel capacity": z.number().optional(),
  "cargo space": z.number().optional(),
  "outfit space": z.number().optional(),
  "weapon capacity": z.number().optional(),
  "engine capacity": z.number().optional(),
  licenses: z.array(z.string()).optional(),
  weapon: z
    .object({
      "blast radius": z.number().optional(),
      "shield damage": z.number().optional(),
      "hull damage": z.number().optional(),
      "hit force": z.number().optional(),
    })
    .optional(),
});

const ShipPositionSchema = z.object({
  type: z.enum([
    "engine",
    "gun",
    "turret",
    "bay",
    "leak",
    "explode",
    "final explode",
  ]),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(), // For engine thrust
  outfit: z.string().optional(), // For gun/turret/bay
  bayType: z.string().optional(), // For bay
  launchEffect: z.string().optional(), // For bay
  effect: z.string().optional(), // For leak/explode
  count: z.number().optional(), // For explode
});

const ShipSchema = z.object({
  name: z.string(),
  plural: z.string().optional(),
  sprite: z.string().optional(),
  thumbnail: z.string().optional(),
  attributes: ShipAttributeSchema,
  outfits: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().default(1),
    })
  ),
  positions: z.array(ShipPositionSchema),
  descriptions: z.array(z.string()).default([]),
});

export type Ship = z.infer<typeof ShipSchema>;
export { ShipSchema };
