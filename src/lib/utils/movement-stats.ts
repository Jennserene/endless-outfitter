import { formatNumber } from "@/lib/utils/format";
import type { Ship } from "@/lib/schemas/ship";

/**
 * Extended ship attributes that may include movement-related attributes
 * not defined in the schema but calculated from outfits.
 */
type ExtendedAttributes = Ship["attributes"] & {
  thrust?: number;
  "reverse thrust"?: number;
  "afterburner thrust"?: number;
  turn?: number;
  "turn multiplier"?: number;
  "acceleration multiplier"?: number;
  "inertia reduction"?: number;
  [key: string]: unknown; // Allow any additional attributes
};

/**
 * Result of movement stats calculation.
 */
export type MovementStatsResult =
  | {
      hasThruster: false;
      hasSteering: boolean;
      error: "no thruster!";
    }
  | {
      hasThruster: boolean;
      hasSteering: false;
      error: "no steering!";
    }
  | {
      hasThruster: true;
      hasSteering: true;
      maxSpeed: string;
      acceleration: string;
      turning: string;
    };

/**
 * Calculates movement stats for a ship based on its attributes.
 * Matches the logic from Endless Sky's ShipInfoDisplay.cpp.
 *
 * @param attrs - Ship attributes (may include movement attributes from outfits)
 * @param mass - Current ship mass (includes cargo and outfits)
 * @param drag - Ship drag value
 * @param isGeneric - Whether this is a generic ship (no cargo) vs named ship
 * @returns Movement stats result with either error messages or calculated values
 */
export function calculateMovementStats(
  attrs: ExtendedAttributes,
  mass: number | undefined,
  drag: number | undefined,
  isGeneric: boolean = true
): MovementStatsResult {
  // Check for thruster (thrust, reverse thrust, or afterburner thrust)
  const thrust = attrs.thrust ?? 0;
  const reverseThrust = attrs["reverse thrust"] ?? 0;
  const afterburnerThrust = attrs["afterburner thrust"] ?? 0;
  const hasThruster = thrust > 0 || reverseThrust > 0 || afterburnerThrust > 0;

  // Check for steering (turn)
  const turn = attrs.turn ?? 0;
  const hasSteering = turn > 0;

  // If no thruster, return error
  if (!hasThruster) {
    return {
      hasThruster: false,
      hasSteering,
      error: "no thruster!",
    };
  }

  // If no steering, return error
  if (!hasSteering) {
    return {
      hasThruster: true,
      hasSteering: false,
      error: "no steering!",
    };
  }

  // Both thruster and steering are present, calculate stats
  if (!drag || drag <= 0) {
    // Shouldn't happen if drag is defined, but handle gracefully
    return {
      hasThruster: true,
      hasSteering: true,
      maxSpeed: "0",
      acceleration: "0",
      turning: "0",
    };
  }

  // Use forward thrust, or afterburner thrust if regular thrust is 0
  const forwardThrust = thrust > 0 ? thrust : afterburnerThrust;

  // Calculate max speed: 60 * forwardThrust / drag
  const maxSpeed = (60 * forwardThrust) / drag;

  // Calculate effective mass with inertia reduction
  const inertiaReduction = attrs["inertia reduction"] ?? 0;
  const reduction = 1 + inertiaReduction;

  if (!mass || mass <= 0) {
    return {
      hasThruster: true,
      hasSteering: true,
      maxSpeed: formatNumber(maxSpeed),
      acceleration: "0",
      turning: "0",
    };
  }

  const emptyMass = mass / reduction;
  const cargoSpace = attrs["cargo space"] ?? 0;
  const fullMass = (emptyMass + cargoSpace) / reduction;
  const currentMass = mass / reduction;

  // Calculate acceleration: 3600 * forwardThrust * (1 + acceleration multiplier) / mass
  const accelerationMultiplier = attrs["acceleration multiplier"] ?? 0;
  const baseAccel = 3600 * forwardThrust * (1 + accelerationMultiplier);

  const acceleration = isGeneric
    ? `${formatNumber(baseAccel / fullMass)} - ${formatNumber(baseAccel / emptyMass)}`
    : formatNumber(baseAccel / currentMass);

  // Calculate turning: 60 * turn * (1 + turn multiplier) / mass
  const turnMultiplier = attrs["turn multiplier"] ?? 0;
  const baseTurn = 60 * turn * (1 + turnMultiplier);

  const turning = isGeneric
    ? `${formatNumber(baseTurn / fullMass)} - ${formatNumber(baseTurn / emptyMass)}`
    : formatNumber(baseTurn / currentMass);

  return {
    hasThruster: true,
    hasSteering: true,
    maxSpeed: formatNumber(maxSpeed),
    acceleration,
    turning,
  };
}
