import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { createCatch } from '../services/catchService';
import { getActiveSpecies } from '../services/speciesService';
import { getTeams } from '../services/teamService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import type { Species } from '../types';
import type { Team } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

export function WeighingPage() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [teamId, setTeamId] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isCoinFish, setIsCoinFish] = useState(false);
  const [returnedAt, setReturnedAt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getTeams(), getActiveSpecies()])
      .then(([loadedTeams, loadedSpecies]) => {
        setTeams(loadedTeams);
        setSpecies(loadedSpecies);
        setTeamId(loadedTeams[0]?.id ?? '');
        setSpeciesId(loadedSpecies[0]?.id ?? '');
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Erro ao carregar dados.'));
  }, []);

  const handleSave = async () => {
    setFeedback('');

    if (!isSupabaseConfigured) {
      setFeedback('Configure o Supabase para salvar pesagens reais.');
      return;
    }

    if (!teamId || !speciesId || Number(weightKg) <= 0) {
      setFeedback('Informe equipe, espécie e peso válido.');
      return;
    }

    const selectedTeam = teams.find((team) => team.id === teamId);
    const selectedSpecies = species.find((item) => item.id === speciesId);
    const confirmed = window.confirm(`Confirmar pesagem de ${Number(weightKg).toLocaleString('pt-BR')} kg para ${selectedTeam?.name ?? 'equipe'} (${selectedSpecies?.name ?? 'espécie'})?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      await createCatch({
        team_id: teamId,
        species_id: speciesId,
        weight_kg: Number(weightKg),
        is_coin_fish: isCoinFish,
        returned_at: returnedAt ? new Date(returnedAt).toISOString() : null,
        created_by: profile?.id ?? null,
      });
      setFeedback('Pesagem salva com sucesso.');
      setWeightKg('');
      setIsCoinFish(false);
      setReturnedAt('');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível salvar a pesagem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Comissão"
        title="Lançar pesagem"
        description="Registre capturas oficiais na tabela catches. O ranking usa ranking_view e fica preparado para atualizar via Realtime."
      />

      <Card className="max-w-3xl overflow-hidden">
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-graphite/70">Equipe</span>
            <select className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold" onChange={(event) => setTeamId(event.target.value)} value={teamId}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}{team.boat_name ? ` - ${team.boat_name}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-graphite/70">Espécie</span>
            <select className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold" onChange={(event) => setSpeciesId(event.target.value)} value={speciesId}>
              {species.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-graphite/70">Peso em kg</span>
            <input className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold" inputMode="decimal" min="0" onChange={(event) => setWeightKg(event.target.value)} step="0.1" type="number" value={weightKg} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-graphite/70">Retorno oficial</span>
            <input className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold" onChange={(event) => setReturnedAt(event.target.value)} type="datetime-local" value={returnedAt} />
          </label>
        </div>

        <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-sand/70 p-4">
          <span>
            <span className="block font-bold text-sea">Peixe da Moeda</span>
            <span className="text-sm text-graphite/70">Marca a captura como bônus especial.</span>
          </span>
          <input checked={isCoinFish} className="h-5 w-5 accent-gold" onChange={(event) => setIsCoinFish(event.target.checked)} type="checkbox" />
        </label>

        <div className="sticky bottom-24 z-20 mt-6 grid gap-3 rounded-[24px] border border-sand/60 bg-white/94 p-3 shadow-soft backdrop-blur sm:static sm:flex sm:flex-wrap sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-turquoise disabled:opacity-60" disabled={saving} onClick={handleSave} type="button">
            <Save size={18} strokeWidth={1.8} />
            {saving ? 'Salvando...' : 'Salvar pesagem'}
          </button>
          {feedback ? <p className="text-sm font-semibold text-graphite/70">{feedback}</p> : null}
        </div>
      </Card>
    </div>
  );
}
