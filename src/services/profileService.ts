import type { Profile } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const getCurrentProfile = async (): Promise<Profile | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return null;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', authData.user.id).maybeSingle();
  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: authData.user.email ?? null,
      full_name: authData.user.user_metadata?.full_name ?? authData.user.email ?? 'Participante',
      role: 'participant',
    })
    .select('*')
    .single();
  if (createError) {
    throw createError;
  }

  return createdProfile;
};

export const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error('Perfil não encontrado.');
  }

  const { data, error } = await supabase.from('profiles').update(updates).eq('id', profile.id).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};
