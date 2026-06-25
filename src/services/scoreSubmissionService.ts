import type { ScoreSubmission } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const createScoreSubmission = async (
  payload: Pick<ScoreSubmission, 'team_id' | 'total_score'> & Partial<ScoreSubmission>,
): Promise<ScoreSubmission> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('score_submissions').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};
