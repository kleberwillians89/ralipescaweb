import type { Catch } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const createCatch = async (payload: Pick<Catch, 'team_id' | 'species_id' | 'weight_kg'> & Partial<Catch>): Promise<Catch> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('catches').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};

export const updateCatch = async (catchId: string, updates: Partial<Catch>): Promise<Catch> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('catches').update(updates).eq('id', catchId).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};

export const deleteCatch = async (catchId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { error } = await supabase.from('catches').delete().eq('id', catchId);
  if (error) {
    throw error;
  }
};

export const getCatchesByTeam = async (teamId: string): Promise<Catch[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.from('catches').select('*').eq('team_id', teamId).order('created_at', { ascending: false });
  if (error) {
    throw error;
  }

  return data;
};

export const getAllCatches = async (): Promise<Catch[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.from('catches').select('*').order('created_at', { ascending: false });
  if (error) {
    throw error;
  }

  return data;
};
