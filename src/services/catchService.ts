import type { Catch } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

type TeamCalculationFish = {
  speciesId: string;
  weightKg: number;
  quantity: number;
  isCoinFish?: boolean;
};

type SaveTeamCalculationPayload = {
  teamId: string;
  fishes: TeamCalculationFish[];
  returnedAt?: string;
  totalFishPresented: number;
  submittedBy?: string | null;
  replaceExisting: boolean;
  notes?: string | null;
};

type SaveTeamCalculationResult = {
  status: 'saved' | 'conflict';
  existingCount?: number;
};

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

export const saveTeamCalculation = async ({
  teamId,
  fishes,
  returnedAt,
  totalFishPresented,
  submittedBy,
  replaceExisting,
  notes,
}: SaveTeamCalculationPayload): Promise<SaveTeamCalculationResult> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data: existingCatches, error: existingError } = await supabase
    .from('catches')
    .select('id')
    .eq('team_id', teamId);
  if (existingError) {
    console.error('[saveTeamCalculation] erro detalhado:', existingError);
    throw existingError;
  }

  if ((existingCatches?.length ?? 0) > 0 && !replaceExisting) {
    return { status: 'conflict', existingCount: existingCatches?.length ?? 0 };
  }

  if (replaceExisting && (existingCatches?.length ?? 0) > 0) {
    const { error: deleteError } = await supabase.from('catches').delete().eq('team_id', teamId);
    if (deleteError) {
      console.error('[saveTeamCalculation] erro detalhado:', deleteError);
      throw deleteError;
    }
  }

  const savedAt = returnedAt ? new Date(returnedAt).toISOString() : new Date().toISOString();
  const validFishes = fishes.filter((fish) => fish.weightKg > 0 && fish.quantity > 0);
  if (validFishes.length > 0) {
    const { error: insertError } = await supabase.from('catches').insert(
      validFishes.map((fish) => ({
        team_id: teamId,
        species_id: fish.speciesId,
        weight_kg: fish.weightKg,
        quantity: Math.max(1, Math.floor(fish.quantity)),
        is_coin_fish: Boolean(fish.isCoinFish),
        caught_at: savedAt,
        created_by: submittedBy ?? null,
      })),
    );
    if (insertError) {
      console.error('[saveTeamCalculation] erro detalhado:', insertError);
      throw insertError;
    }
  }

  const submissionPayload = {
    team_id: teamId,
    returned_at: returnedAt ? savedAt : null,
    total_fish_presented: totalFishPresented,
    submitted_by: submittedBy ?? null,
    notes: notes ?? null,
  };

  const { data: existingSubmission, error: submissionLookupError } = await supabase
    .from('score_submissions')
    .select('id')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (submissionLookupError) {
    console.error('[saveTeamCalculation] erro detalhado:', submissionLookupError);
    throw submissionLookupError;
  }

  if (existingSubmission?.id) {
    const { error: updateSubmissionError } = await supabase
      .from('score_submissions')
      .update(submissionPayload)
      .eq('id', existingSubmission.id);
    if (updateSubmissionError) {
      console.error('[saveTeamCalculation] erro detalhado:', updateSubmissionError);
      throw updateSubmissionError;
    }
  } else {
    const { error: insertSubmissionError } = await supabase.from('score_submissions').insert(submissionPayload);
    if (insertSubmissionError) {
      console.error('[saveTeamCalculation] erro detalhado:', insertSubmissionError);
      throw insertSubmissionError;
    }
  }

  return { status: 'saved' };
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
