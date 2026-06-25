import type { LucideIcon } from 'lucide-react';

export type PageKey = 'home' | 'calculator' | 'species' | 'rules' | 'ranking' | 'team' | 'settings' | 'profile';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};

export type FishCategory = 'Premium' | 'Intermediária' | 'Comum';

export type Species = {
  id: string;
  name: string;
  category: FishCategory;
  multiplier: number;
  fishingMethod: string;
  minimumWeightKg?: number | null;
  isCoinFish?: boolean;
  coinMinimumWeightKg?: number | null;
};

export type CatchEntry = {
  id: string;
  speciesId: string;
  weightKg: number;
  quantity: number;
  returnedAt?: string;
};

export type RankingTeam = {
  position: number;
  team: string;
  captain: string;
  boatName?: string | null;
  score: number;
  baseScore?: number;
  coinBonus?: number;
  schoolBonus?: number;
  timeBonus?: number;
  penalty?: number;
  fishCount: number;
  highlight: string;
  biggestFishWeight?: number | null;
  biggestFishSpecies?: string | null;
  returnedAt?: string | null;
  grossWeightTotalKg?: number | null;
  totalFishPresented?: number | null;
};
