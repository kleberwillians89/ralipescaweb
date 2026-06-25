import type { Penalty } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const createPenalty = async (payload: Pick<Penalty, 'team_id' | 'mode' | 'value'> & Partial<Penalty>): Promise<Penalty> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('penalties').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};
