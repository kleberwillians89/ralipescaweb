import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { getRanking, subscribeToRanking, unsubscribe } from '../services/rankingService';
import type { RankingTeam } from '../types';

export function RankingPage() {
  const [rankingTeams, setRankingTeams] = useState<RankingTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    getRanking()
      .then((ranking) => {
        if (mounted) {
          setRankingTeams(ranking);
        }
      })
      .catch((error) => {
        console.error('[Rali Noronha] Erro ao carregar ranking:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar ranking.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const subscription = subscribeToRanking((ranking) => {
      if (mounted) {
        setRankingTeams(ranking);
      }
    });

    return () => {
      mounted = false;
      void unsubscribe(subscription);
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Classificação"
        title="Ranking oficial"
        description="Acompanhe a pontuação das equipes, embarcações e maiores capturas registradas na prova."
      />

      {loading ? <p className="text-sm font-semibold text-graphite/70">Atualizando ranking...</p> : null}
      {error ? <p className="rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">{error}</p> : null}
      {!loading && !error && rankingTeams.length === 0 ? (
        <p className="rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">Nenhuma equipe ou pesagem encontrada no ranking.</p>
      ) : null}

      <div className="space-y-3">
        {rankingTeams.map((team) => (
          <Card key={team.position} className={`p-4 ${team.position <= 3 ? 'border-gold/70 shadow-premium' : ''}`}>
            <div className="grid min-w-0 gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-3xl ${team.position === 1 ? 'bg-gold text-white' : team.position <= 3 ? 'bg-sea text-white' : 'bg-sand/60 text-sea'}`}>
                {team.position === 1 ? <Trophy size={24} strokeWidth={1.7} /> : <span className="text-lg font-bold">{team.position}</span>}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-sea">{team.team}</h2>
                <div className="mt-2 grid gap-1 text-sm text-graphite/70 sm:grid-cols-2">
                  <p className="min-w-0 truncate">Embarcação: {team.boatName ?? team.captain}</p>
                  <p>{team.fishCount} peixes válidos</p>
                  <p className="sm:col-span-2">
                    Maior peixe: {team.biggestFishSpecies ?? 'Não informado'}
                    {team.biggestFishWeight ? ` · ${team.biggestFishWeight.toLocaleString('pt-BR')} kg` : ''}
                  </p>
                  <p>Base: {(team.baseScore ?? 0).toLocaleString('pt-BR')}</p>
                  <p>Bônus moeda: {(team.coinBonus ?? 0).toLocaleString('pt-BR')}</p>
                  <p>Bônus cardume: {(team.schoolBonus ?? 0).toLocaleString('pt-BR')}</p>
                  <p>Bônus temporal: {(team.timeBonus ?? 0).toLocaleString('pt-BR')}</p>
                  <p>Penalidade: {(team.penalty ?? 0).toLocaleString('pt-BR')}</p>
                  <p>Retorno: {team.returnedAt ? new Date(team.returnedAt).toLocaleString('pt-BR') : 'Não informado'}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-sea px-4 py-3 text-left text-white sm:min-w-32 sm:text-right">
                <p className="text-xs text-white/65">Pontuação</p>
                <p className="text-2xl font-bold">{team.score.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
