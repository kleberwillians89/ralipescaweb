import type { Team, TeamMember } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export const createTeam = async (payload: Pick<Team, 'name'> & Partial<Team>): Promise<Team> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase
    .from('teams')
    .insert(payload)
    .select('*')
    .single();
  if (error) {
    throw error;
  }

  return data;
};

export const getMyTeam = async (): Promise<Team | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { getCurrentProfile } = await import('./profileService');
  const profile = await getCurrentProfile();
  if (!profile) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('profile_id', profile.id)
    .maybeSingle();
  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    return null;
  }

  const { data, error } = await supabase.from('teams').select('*').eq('id', membership.team_id).maybeSingle();
  if (error) {
    throw error;
  }

  return data;
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.from('teams').select('*').eq('id', id).maybeSingle();
  if (error) {
    throw error;
  }

  return data;
};

export const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<Team> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('teams').update(updates).eq('id', teamId).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { error } = await supabase.from('teams').delete().eq('id', teamId);
  if (error) {
    throw error;
  }
};

export const getTeams = async (): Promise<Team[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.from('teams').select('*').order('name');
  if (error) {
    throw error;
  }

  return data;
};

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.from('team_members').select('*').eq('team_id', teamId).order('created_at');
  if (error) {
    throw error;
  }

  return data;
};

export const createTeamMember = async (payload: Pick<TeamMember, 'team_id'> & Partial<TeamMember>): Promise<TeamMember> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('team_members').insert(payload).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};

export const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.from('team_members').update(updates).eq('id', memberId).select('*').single();
  if (error) {
    throw error;
  }

  return data;
};

export const deleteTeamMember = async (memberId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { error } = await supabase.from('team_members').delete().eq('id', memberId);
  if (error) {
    throw error;
  }
};
