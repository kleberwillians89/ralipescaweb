import { rankingTeams } from '../data/ranking';
import type { RankingTeam } from '../types';
import type { RankingRow } from '../types/database';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export type RankingCallback = (ranking: RankingTeam[]) => void;

const mapRankingRow = (row: RankingRow): RankingTeam => ({
  position: row.position,
  team: row.team_name,
  captain: row.boat_name ?? 'Equipe',
  boatName: row.boat_name,
  score: Number(row.total_score),
  fishCount: row.valid_catches_count,
  highlight: row.biggest_fish_species
    ? `Maior peixe: ${row.biggest_fish_species} (${Number(row.biggest_fish_weight ?? 0).toLocaleString('pt-BR')} kg)`
    : 'Pesagens validadas',
  biggestFishWeight: row.biggest_fish_weight,
  biggestFishSpecies: row.biggest_fish_species,
});

export const getRanking = async (): Promise<RankingTeam[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return rankingTeams;
  }

  const { data, error } = await supabase.from('ranking_view').select('*').order('position', { ascending: true });
  if (error) {
    throw error;
  }

  return data.map(mapRankingRow);
};

export const subscribeToRanking = (callback: RankingCallback) => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const refresh = () => {
    getRanking().then(callback).catch((error) => console.error('[Rali Noronha] Erro ao atualizar ranking:', error));
  };

  return supabase
    .channel('ranking-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'catches' }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'score_submissions' }, refresh)
    .subscribe();
};

export const unsubscribe = async (subscription: ReturnType<typeof subscribeToRanking>) => {
  if (!subscription || !supabase) {
    return;
  }

  await supabase.removeChannel(subscription);
};
