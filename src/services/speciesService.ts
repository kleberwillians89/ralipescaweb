import { species as demoSpecies } from '../data/species';
import type { Species as AppSpecies } from '../types';
import type { Species as DbSpecies } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const mapSpecies = (item: DbSpecies): AppSpecies => ({
  id: item.id,
  name: item.name,
  category: item.category as AppSpecies['category'],
  multiplier: Number(item.multiplier),
  fishingMethod: item.method ?? 'Não informado',
  minimumWeightKg: 0,
  coinMinimumWeightKg: item.coin_min_weight == null ? null : Number(item.coin_min_weight),
});

export const getSpecies = async (): Promise<AppSpecies[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return demoSpecies;
  }

  const { data, error } = await supabase.from('species').select('*').order('name');
  if (error) {
    throw error;
  }

  return data.map(mapSpecies);
};

export const getActiveSpecies = async (): Promise<AppSpecies[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return demoSpecies;
  }

  const { data, error } = await supabase.from('species').select('*').eq('active', true).order('name', { ascending: true });
  if (error) {
    throw error;
  }

  return data.map(mapSpecies);
};
