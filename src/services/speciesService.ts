import { species as demoSpecies } from '../data/species';
import type { Species as AppSpecies } from '../types';
import type { Species as DbSpecies } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const mapSpecies = (item: DbSpecies): AppSpecies => ({
  id: item.id,
  name: item.name,
  category: item.category as AppSpecies['category'],
  multiplier: Number(item.multiplier),
  fishingMethod: item.fishing_method,
  minimumWeightKg: Number(item.minimum_weight_kg),
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

  const { data, error } = await supabase.from('species').select('*').eq('is_active', true).order('name');
  if (error) {
    throw error;
  }

  return data.map(mapSpecies);
};
