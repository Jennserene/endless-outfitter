import type { Ship, ExtendedAttributes } from "@/lib/models/ship";
import type { StatContribution } from "./ship-stats-accordion";
import { sortContributionsByValue } from "./ship-stats-accordion";

/**
 * Calculates the actual contribution each outfit makes to max speed.
 * Max speed = 60 * forwardThrust / drag
 *
 * For each outfit, we calculate how much it changes the max speed by
 * comparing the current max speed with and without that outfit.
 */
export function getMaxSpeedContributions(
  ship: Ship,
  baseAttrs: ExtendedAttributes,
  baseDrag: number
): StatContribution[] {
  const contributions: StatContribution[] = [];
  const outfits = ship.getOutfits();

  // Get base thrust (from hull only, no outfits)
  // Base thrust values are not needed for this calculation
  // We only need the outfitted values to compare against

  // Current outfitted values
  const outfittedAttrs = ship.outfittedAttributes;
  const outfittedThrust = outfittedAttrs.thrust ?? 0;
  const outfittedAfterburnerThrust = outfittedAttrs["afterburner thrust"] ?? 0;
  const outfittedForwardThrust =
    outfittedThrust > 0 ? outfittedThrust : outfittedAfterburnerThrust;
  const outfittedDrag = outfittedAttrs.drag ?? baseDrag;
  const currentMaxSpeed =
    outfittedForwardThrust > 0 && outfittedDrag > 0
      ? (60 * outfittedForwardThrust) / outfittedDrag
      : 0;

  // Group outfits by name
  const outfitMap = new Map<
    string,
    { outfit: (typeof outfits)[0]; quantity: number }
  >();
  for (const outfit of outfits) {
    const existing = outfitMap.get(outfit.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      outfitMap.set(outfit.name, { outfit, quantity: 1 });
    }
  }

  // Calculate contribution for each unique outfit
  for (const { outfit, quantity } of outfitMap.values()) {
    // Create a ship without this outfit to calculate its contribution
    let shipWithoutOutfit = ship;
    for (let i = 0; i < quantity; i++) {
      shipWithoutOutfit = shipWithoutOutfit.removeOutfit(outfit.name, 1);
    }

    const attrsWithout = shipWithoutOutfit.outfittedAttributes;
    const thrustWithout = attrsWithout.thrust ?? 0;
    const afterburnerThrustWithout = attrsWithout["afterburner thrust"] ?? 0;
    const forwardThrustWithout =
      thrustWithout > 0 ? thrustWithout : afterburnerThrustWithout;
    const dragWithout = attrsWithout.drag ?? baseDrag;
    const maxSpeedWithout =
      forwardThrustWithout > 0 && dragWithout > 0
        ? (60 * forwardThrustWithout) / dragWithout
        : 0;

    // Contribution is the difference
    const contribution = currentMaxSpeed - maxSpeedWithout;

    if (Math.abs(contribution) > 0.001) {
      // Only include if significant
      contributions.push({
        name: outfit.name,
        slug: outfit.slug,
        quantity,
        value: contribution,
      });
    }
  }

  return sortContributionsByValue(contributions);
}

/**
 * Calculates the actual contribution each outfit makes to acceleration.
 * Acceleration = 3600 * forwardThrust * (1 + acceleration multiplier) / mass
 */
export function getAccelerationContributions(
  ship: Ship,
  baseAttrs: ExtendedAttributes,
  baseMass: number
): StatContribution[] {
  const contributions: StatContribution[] = [];
  const outfits = ship.getOutfits();

  // Current outfitted values
  const outfittedAttrs = ship.outfittedAttributes;
  const outfittedMass = ship.getOutfittedMass() ?? baseMass;
  const outfittedThrust = outfittedAttrs.thrust ?? 0;
  const outfittedAfterburnerThrust = outfittedAttrs["afterburner thrust"] ?? 0;
  const outfittedForwardThrust =
    outfittedThrust > 0 ? outfittedThrust : outfittedAfterburnerThrust;
  const outfittedAccelMultiplier =
    outfittedAttrs["acceleration multiplier"] ?? 0;
  const outfittedInertiaReduction = outfittedAttrs["inertia reduction"] ?? 0;
  const reduction = 1 + outfittedInertiaReduction;
  const effectiveMass = outfittedMass / reduction;
  const cargoSpace = outfittedAttrs["cargo space"] ?? 0;
  const fullMass = (effectiveMass + cargoSpace) / reduction;
  const currentAccel =
    outfittedForwardThrust > 0 && fullMass > 0
      ? (3600 * outfittedForwardThrust * (1 + outfittedAccelMultiplier)) /
        fullMass
      : 0;

  // Group outfits by name
  const outfitMap = new Map<
    string,
    { outfit: (typeof outfits)[0]; quantity: number }
  >();
  for (const outfit of outfits) {
    const existing = outfitMap.get(outfit.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      outfitMap.set(outfit.name, { outfit, quantity: 1 });
    }
  }

  // Calculate contribution for each unique outfit
  for (const { outfit, quantity } of outfitMap.values()) {
    // Create a ship without this outfit
    let shipWithoutOutfit = ship;
    for (let i = 0; i < quantity; i++) {
      shipWithoutOutfit = shipWithoutOutfit.removeOutfit(outfit.name, 1);
    }

    const attrsWithout = shipWithoutOutfit.outfittedAttributes;
    const massWithout = shipWithoutOutfit.getOutfittedMass() ?? baseMass;
    const thrustWithout = attrsWithout.thrust ?? 0;
    const afterburnerThrustWithout = attrsWithout["afterburner thrust"] ?? 0;
    const forwardThrustWithout =
      thrustWithout > 0 ? thrustWithout : afterburnerThrustWithout;
    const accelMultiplierWithout = attrsWithout["acceleration multiplier"] ?? 0;
    const inertiaReductionWithout = attrsWithout["inertia reduction"] ?? 0;
    const reductionWithout = 1 + inertiaReductionWithout;
    const effectiveMassWithout = massWithout / reductionWithout;
    const cargoSpaceWithout = attrsWithout["cargo space"] ?? 0;
    const fullMassWithout =
      (effectiveMassWithout + cargoSpaceWithout) / reductionWithout;
    const accelWithout =
      forwardThrustWithout > 0 && fullMassWithout > 0
        ? (3600 * forwardThrustWithout * (1 + accelMultiplierWithout)) /
          fullMassWithout
        : 0;

    // Contribution is the difference (use the lower bound for range display)
    const contribution = currentAccel - accelWithout;

    if (Math.abs(contribution) > 0.001) {
      contributions.push({
        name: outfit.name,
        slug: outfit.slug,
        quantity,
        value: contribution,
      });
    }
  }

  return sortContributionsByValue(contributions);
}

/**
 * Calculates the actual contribution each outfit makes to turning.
 * Turning = 60 * turn * (1 + turn multiplier) / mass
 */
export function getTurningContributions(
  ship: Ship,
  baseAttrs: ExtendedAttributes,
  baseMass: number
): StatContribution[] {
  const contributions: StatContribution[] = [];
  const outfits = ship.getOutfits();

  // Current outfitted values
  const outfittedAttrs = ship.outfittedAttributes;
  const outfittedMass = ship.getOutfittedMass() ?? baseMass;
  const outfittedTurn = outfittedAttrs.turn ?? 0;
  const outfittedTurnMultiplier = outfittedAttrs["turn multiplier"] ?? 0;
  const outfittedInertiaReduction = outfittedAttrs["inertia reduction"] ?? 0;
  const reduction = 1 + outfittedInertiaReduction;
  const effectiveMass = outfittedMass / reduction;
  const cargoSpace = outfittedAttrs["cargo space"] ?? 0;
  const fullMass = (effectiveMass + cargoSpace) / reduction;
  const currentTurning =
    outfittedTurn > 0 && fullMass > 0
      ? (60 * outfittedTurn * (1 + outfittedTurnMultiplier)) / fullMass
      : 0;

  // Group outfits by name
  const outfitMap = new Map<
    string,
    { outfit: (typeof outfits)[0]; quantity: number }
  >();
  for (const outfit of outfits) {
    const existing = outfitMap.get(outfit.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      outfitMap.set(outfit.name, { outfit, quantity: 1 });
    }
  }

  // Calculate contribution for each unique outfit
  for (const { outfit, quantity } of outfitMap.values()) {
    // Create a ship without this outfit
    let shipWithoutOutfit = ship;
    for (let i = 0; i < quantity; i++) {
      shipWithoutOutfit = shipWithoutOutfit.removeOutfit(outfit.name, 1);
    }

    const attrsWithout = shipWithoutOutfit.outfittedAttributes;
    const massWithout = shipWithoutOutfit.getOutfittedMass() ?? baseMass;
    const turnWithout = attrsWithout.turn ?? 0;
    const turnMultiplierWithout = attrsWithout["turn multiplier"] ?? 0;
    const inertiaReductionWithout = attrsWithout["inertia reduction"] ?? 0;
    const reductionWithout = 1 + inertiaReductionWithout;
    const effectiveMassWithout = massWithout / reductionWithout;
    const cargoSpaceWithout = attrsWithout["cargo space"] ?? 0;
    const fullMassWithout =
      (effectiveMassWithout + cargoSpaceWithout) / reductionWithout;
    const turningWithout =
      turnWithout > 0 && fullMassWithout > 0
        ? (60 * turnWithout * (1 + turnMultiplierWithout)) / fullMassWithout
        : 0;

    // Contribution is the difference
    const contribution = currentTurning - turningWithout;

    if (Math.abs(contribution) > 0.001) {
      contributions.push({
        name: outfit.name,
        slug: outfit.slug,
        quantity,
        value: contribution,
      });
    }
  }

  return sortContributionsByValue(contributions);
}
