import { species as demoSpecies } from '../data/species';
import type { CatchEntry, Species } from '../types';

const COIN_FISH_BONUS_RATE = 0.2;
const SCHOOL_BONUS_RATE = 0.08;
const TEMPORAL_BONUS_RATE = 0.08;
const TEMPORAL_PARTIAL_BONUS_RATE = 0.05;
const LOW_VOLUME_PENALTY_RATE = 0.1;
const MAX_FISH = 6;

export type ScoreOptions = {
  returnedAt?: string;
  manualPenaltyMode?: 'percent' | 'points';
  manualPenaltyValue?: number;
};

export type ScoreBreakdown = {
  baseScore: number;
  coinFishBonus: number;
  schoolBonus: number;
  temporalBonus: number;
  temporalRate: number;
  lowVolumePenalty: number;
  manualPenalty: number;
  total: number;
  validFishCount: number;
  fishCountForPenalty: number;
  scoredFishCount: number;
  ignoredFishCount: number;
  grossWeightTotalKg: number;
  biggestFishWeightKg: number;
};

export const createCatchEntry = (speciesId = demoSpecies[0].id): CatchEntry => ({
  id: crypto.randomUUID(),
  speciesId,
  weightKg: 0,
  quantity: 1,
});

const getSpecies = (entry: CatchEntry, availableSpecies: Species[]) =>
  availableSpecies.find((item) => item.id === entry.speciesId) ?? availableSpecies[0] ?? demoSpecies[0];

const getEntryScore = (entry: CatchEntry, selectedSpecies: Species) => entry.weightKg * 1000 * selectedSpecies.multiplier;

const getTemporalRate = (returnedAt?: string) => {
  if (!returnedAt) {
    return 0;
  }

  const date = new Date(returnedAt);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes <= 9 * 60 + 30) {
    return TEMPORAL_BONUS_RATE;
  }

  if (minutes <= 10 * 60) {
    return TEMPORAL_PARTIAL_BONUS_RATE;
  }

  return 0;
};

export const calculateScore = (entries: CatchEntry[], options: ScoreOptions, availableSpecies: Species[] = demoSpecies): ScoreBreakdown => {
  const allValidEntries = entries
    .filter((entry) => entry.weightKg > 0 && (entry.quantity ?? 1) > 0)
    .flatMap((entry) =>
      Array.from({ length: Math.max(1, Math.floor(entry.quantity ?? 1)) }, (_, index) => ({
        ...entry,
        id: `${entry.id}-${index}`,
        quantity: 1,
      })),
    );
  const allValidEntriesWithSpecies = allValidEntries.map((entry) => ({
    entry,
    selectedSpecies: getSpecies(entry, availableSpecies),
  }));
  const scoredEntriesWithSpecies = [...allValidEntriesWithSpecies]
    .sort((a, b) => getEntryScore(b.entry, b.selectedSpecies) - getEntryScore(a.entry, a.selectedSpecies))
    .slice(0, MAX_FISH);
  const baseScore = scoredEntriesWithSpecies.reduce((total, { entry, selectedSpecies }) => total + getEntryScore(entry, selectedSpecies), 0);
  const coinFishBonus = scoredEntriesWithSpecies.reduce((total, { entry, selectedSpecies }) => {
    const coinMinimumWeightKg = selectedSpecies.coinMinimumWeightKg ?? selectedSpecies.minimumWeightKg ?? null;
    const isEligibleCoinFish = Boolean(selectedSpecies.isCoinFish || selectedSpecies.coinMinimumWeightKg);
    if (!isEligibleCoinFish || !coinMinimumWeightKg || entry.weightKg < coinMinimumWeightKg) {
      return total;
    }

    return total + getEntryScore(entry, selectedSpecies) * COIN_FISH_BONUS_RATE;
  }, 0);

  const schoolEligibleCount = scoredEntriesWithSpecies.filter(({ entry, selectedSpecies }) => {
    const minimumWeightKg = selectedSpecies.minimumWeightKg ?? selectedSpecies.coinMinimumWeightKg;
    if (!minimumWeightKg) {
      return false;
    }

    const aboveMinimumRate = (entry.weightKg - minimumWeightKg) / minimumWeightKg;
    return aboveMinimumRate >= 0.05 && aboveMinimumRate <= 0.14;
  }).length;
  const schoolBonus = schoolEligibleCount === 1 || schoolEligibleCount >= 3 ? baseScore * SCHOOL_BONUS_RATE : 0;
  const temporalRate = getTemporalRate(options.returnedAt);
  const temporalBonus = scoredEntriesWithSpecies.length > 0 ? baseScore * temporalRate : 0;
  const subtotal = baseScore + coinFishBonus + schoolBonus + temporalBonus;
  const fishCountForPenalty = allValidEntries.length;
  const lowVolumePenalty = fishCountForPenalty > 0 && fishCountForPenalty < 3 ? subtotal * LOW_VOLUME_PENALTY_RATE : 0;
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
    temporalRate,
    lowVolumePenalty,
    manualPenalty,
    total,
    validFishCount: allValidEntries.length,
    fishCountForPenalty,
    scoredFishCount: scoredEntriesWithSpecies.length,
    ignoredFishCount: Math.max(0, allValidEntries.length - MAX_FISH),
    grossWeightTotalKg: allValidEntries.reduce((total, entry) => total + entry.weightKg, 0),
    biggestFishWeightKg: Math.max(0, ...allValidEntries.map((entry) => entry.weightKg)),
  };
};
