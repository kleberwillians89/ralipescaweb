import { species as demoSpecies } from '../data/species';
import type { CatchEntry, Species } from '../types';

const COIN_FISH_BONUS = 15;
const SCHOOL_BONUS_RATE = 0.12;
const TEMPORAL_BONUS_RATE = 0.08;
const LOW_VOLUME_PENALTY_RATE = 0.1;
const MAX_FISH = 6;

export type ScoreOptions = {
  hasCoinFish: boolean;
  hasTemporalBonus: boolean;
  manualPenaltyMode?: 'percent' | 'points';
  manualPenaltyValue?: number;
};

export type ScoreBreakdown = {
  baseScore: number;
  coinFishBonus: number;
  schoolBonus: number;
  temporalBonus: number;
  lowVolumePenalty: number;
  manualPenalty: number;
  total: number;
};

export const createCatchEntry = (speciesId = demoSpecies[0].id): CatchEntry => ({
  id: crypto.randomUUID(),
  speciesId,
  weightKg: 0,
});

export const calculateScore = (entries: CatchEntry[], options: ScoreOptions, availableSpecies: Species[] = demoSpecies): ScoreBreakdown => {
  const validEntries = entries.slice(0, MAX_FISH).filter((entry) => entry.weightKg > 0);
  const baseScore = validEntries.reduce((total, entry) => {
    const selectedSpecies = availableSpecies.find((item) => item.id === entry.speciesId) ?? availableSpecies[0] ?? demoSpecies[0];
    return total + entry.weightKg * selectedSpecies.multiplier * 10;
  }, 0);

  const coinFishBonus = options.hasCoinFish && validEntries.length > 0 ? COIN_FISH_BONUS : 0;
  const schoolBonus = validEntries.length === MAX_FISH ? baseScore * SCHOOL_BONUS_RATE : 0;
  const temporalBonus = options.hasTemporalBonus && validEntries.length > 0 ? baseScore * TEMPORAL_BONUS_RATE : 0;
  const subtotal = baseScore + coinFishBonus + schoolBonus + temporalBonus;
  const lowVolumePenalty = validEntries.length > 0 && validEntries.length < 3 ? subtotal * LOW_VOLUME_PENALTY_RATE : 0;
  const manualPenaltyValue = Number(options.manualPenaltyValue ?? 0);
  const manualPenalty =
    manualPenaltyValue > 0
      ? options.manualPenaltyMode === 'points'
        ? manualPenaltyValue
        : subtotal * (manualPenaltyValue / 100)
      : 0;
  const total = Math.max(0, subtotal - lowVolumePenalty - manualPenalty);

  return {
    baseScore,
    coinFishBonus,
    schoolBonus,
    temporalBonus,
    lowVolumePenalty,
    manualPenalty,
    total,
  };
};
