import { species as demoSpecies } from '../data/species';
import type { Species as AppSpecies } from '../types';
import type { Species as DbSpecies } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const normalizeCategory = (category: string): AppSpecies['category'] => {
  if (category === 'Premium' || category === 'Intermediária' || category === 'Comum') {
    return category;
  }

  if (category === 'Nobre') {
    return 'Premium';
  }

  if (category === 'Especial') {
    return 'Intermediária';
  }

  return 'Comum';
};

const normalizeMultiplier = (category: AppSpecies['category'], multiplier: number): number => {
  if (category === 'Premium') {
    return 1.4;
  }

  if (category === 'Intermediária') {
    return 1.15;
  }

  if (multiplier >= 0.75 && multiplier <= 0.9) {
    return multiplier;
  }

  return 0.9;
};

const mapSpecies = (item: DbSpecies): AppSpecies => {
  const category = normalizeCategory(item.category);
  const coinMinimumWeightKg = item.coin_min_weight == null ? null : Number(item.coin_min_weight);

  return {
    id: item.id,
    name: item.name,
    category,
    multiplier: normalizeMultiplier(category, Number(item.multiplier)),
    fishingMethod: item.method ?? 'Não informado',
    minimumWeightKg: coinMinimumWeightKg,
    isCoinFish: coinMinimumWeightKg != null && coinMinimumWeightKg > 0,
    coinMinimumWeightKg,
  };
};

const removeInconsistentSpecies = (items: AppSpecies[]) =>
  items.filter((item) => !['Água-Marinha', 'Agua-Marinha', 'Peixe-Rei', 'Sardinha Pelágica'].includes(item.name));

export const getSpecies = async (): Promise<AppSpecies[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return demoSpecies;
  }

  const { data, error } = await supabase.from('species').select('*').order('name');
  if (error) {
    throw error;
  }

  return removeInconsistentSpecies(data.map(mapSpecies));
};

export const getActiveSpecies = async (): Promise<AppSpecies[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return demoSpecies;
  }

  const { data, error } = await supabase.from('species').select('*').eq('active', true).order('name', { ascending: true });
  if (error) {
    throw error;
  }

  return removeInconsistentSpecies(data.map(mapSpecies));
};
