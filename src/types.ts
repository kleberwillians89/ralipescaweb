import type { LucideIcon } from 'lucide-react';

export type PageKey = 'home' | 'calculator' | 'species' | 'rules' | 'ranking' | 'team' | 'settings' | 'profile' | 'weighing';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};

export type FishCategory = 'Nobre' | 'Especial' | 'Tradicional' | 'Conservação';

export type Species = {
  id: string;
  name: string;
  category: FishCategory;
  multiplier: number;
  fishingMethod: string;
  minimumWeightKg: number;
};

export type CatchEntry = {
  id: string;
  speciesId: string;
  weightKg: number;
};

export type RankingTeam = {
  position: number;
  team: string;
  captain: string;
  boatName?: string | null;
  score: number;
  fishCount: number;
  highlight: string;
  biggestFishWeight?: number | null;
  biggestFishSpecies?: string | null;
};
