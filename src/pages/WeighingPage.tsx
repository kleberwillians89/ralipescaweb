import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { createCatch } from '../services/catchService';
import { getCatchesByTeam } from '../services/catchService';
import { createPenalty } from '../services/penaltyService';
import { calculateScore } from '../services/scoring';
import { createScoreSubmission } from '../services/scoreSubmissionService';
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
  const [applyManualPenalty, setApplyManualPenalty] = useState(false);
  const [manualPenaltyMode, setManualPenaltyMode] = useState<'percent' | 'points'>('percent');
  const [manualPenaltyValue, setManualPenaltyValue] = useState('');
  const [manualPenaltyReason, setManualPenaltyReason] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedSpecies = species.find((item) => item.id === speciesId);
  const weightNumber = Number(weightKg);
  const isCoinFishByRule = Boolean(
    selectedSpecies &&
      (selectedSpecies.isCoinFish || selectedSpecies.coinMinimumWeightKg) &&
      selectedSpecies.coinMinimumWeightKg &&
      weightNumber >= selectedSpecies.coinMinimumWeightKg,
  );

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

    if (!teamId || !speciesId || weightNumber <= 0) {
      setFeedback('Informe equipe, espécie e peso válido.');
      return;
    }

    const selectedTeam = teams.find((team) => team.id === teamId);
    const confirmed = window.confirm(`Confirmar pesagem de ${weightNumber.toLocaleString('pt-BR')} kg para ${selectedTeam?.name ?? 'equipe'} (${selectedSpecies?.name ?? 'espécie'})?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      const savedCatch = await createCatch({
        team_id: teamId,
        species_id: speciesId,
        weight_kg: weightNumber,
        is_coin_fish: isCoinFish || isCoinFishByRule,
        returned_at: returnedAt ? new Date(returnedAt).toISOString() : null,
        created_by: profile?.id ?? null,
        notes: notes || null,
      });

      if (applyManualPenalty && Number(manualPenaltyValue) > 0) {
        await createPenalty({
          team_id: teamId,
          mode: manualPenaltyMode,
          value: Number(manualPenaltyValue),
          reason: manualPenaltyReason || null,
          notes: notes || null,
          created_by: profile?.id ?? null,
        });
      }

      const teamCatches = await getCatchesByTeam(teamId);
      const entries = teamCatches.map((item) => ({
        id: item.id,
          speciesId: item.species_id,
          weightKg: Number(item.weight_kg),
        }));
      if (!teamCatches.some((item) => item.id === savedCatch.id)) {
        entries.push({ id: savedCatch.id, speciesId: savedCatch.species_id, weightKg: Number(savedCatch.weight_kg) });
      }
      const score = calculateScore(
        entries,
        {
          returnedAt,
          manualPenaltyMode,
          manualPenaltyValue: applyManualPenalty ? Number(manualPenaltyValue) : 0,
        },
        species,
      );

      await createScoreSubmission({
        team_id: teamId,
        base_score: score.baseScore,
        coin_bonus: score.coinFishBonus,
        school_bonus: score.schoolBonus,
        time_bonus: score.temporalBonus,
        penalty: score.lowVolumePenalty + score.manualPenalty,
        total_score: score.total,
        submitted_by: profile?.id ?? null,
        returned_at: returnedAt ? new Date(returnedAt).toISOString() : null,
        notes: notes || null,
      });
      setFeedback('Pesagem salva com sucesso.');
      setWeightKg('');
      setIsCoinFish(false);
      setReturnedAt('');
      setApplyManualPenalty(false);
      setManualPenaltyValue('');
      setManualPenaltyReason('');
      setNotes('');
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
        {teams.length === 0 ? (
          <p className="mb-4 rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">
            Nenhuma equipe cadastrada. A comissão precisa cadastrar uma equipe antes da pesagem.
          </p>
        ) : null}
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-graphite/70">Equipe</span>
            <select className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold" onChange={(event) => setTeamId(event.target.value)} value={teamId}>
              <option value="">Selecione uma equipe</option>
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
            <span className="text-sm text-graphite/70">
              {selectedSpecies?.coinMinimumWeightKg
                ? `Bônus automático com ${selectedSpecies.coinMinimumWeightKg.toLocaleString('pt-BR')} kg ou mais.`
                : 'Marca a captura como bônus especial.'}
            </span>
            {isCoinFishByRule ? <span className="mt-2 inline-flex rounded-full bg-sand px-3 py-1 text-xs font-bold text-sea">Peixe da Moeda +20%</span> : null}
          </span>
          <input checked={isCoinFish} className="h-5 w-5 accent-gold" onChange={(event) => setIsCoinFish(event.target.checked)} type="checkbox" />
        </label>

        <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-sand/70 p-4">
          <span>
            <span className="block font-bold text-sea">Penalidade manual</span>
            <span className="text-sm text-graphite/70">Aplicar na submissão oficial</span>
          </span>
          <input checked={applyManualPenalty} className="h-5 w-5 accent-gold" onChange={(event) => setApplyManualPenalty(event.target.checked)} type="checkbox" />
        </label>

        {applyManualPenalty ? (
          <div className="mt-4 grid gap-4 rounded-2xl border border-sand/70 p-4 md:grid-cols-2">
            <select className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3" onChange={(event) => setManualPenaltyMode(event.target.value as 'percent' | 'points')} value={manualPenaltyMode}>
              <option value="percent">Percentual</option>
              <option value="points">Pontos</option>
            </select>
            <input className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3" min="0" onChange={(event) => setManualPenaltyValue(event.target.value)} placeholder="Valor" type="number" value={manualPenaltyValue} />
            <input className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3 md:col-span-2" onChange={(event) => setManualPenaltyReason(event.target.value)} placeholder="Motivo da penalidade" value={manualPenaltyReason} />
          </div>
        ) : null}

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-semibold text-graphite/70">Observação</span>
          <textarea className="min-h-24 w-full rounded-2xl border border-sand bg-white px-4 py-3 outline-none focus:border-gold" onChange={(event) => setNotes(event.target.value)} value={notes} />
        </label>

        <div className="sticky bottom-24 z-20 mt-6 grid gap-3 rounded-[24px] border border-sand/60 bg-white/94 p-3 shadow-soft backdrop-blur sm:static sm:flex sm:flex-wrap sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-turquoise disabled:opacity-60" disabled={saving || !teamId} onClick={handleSave} type="button">
            <Save size={18} strokeWidth={1.8} />
            {saving ? 'Salvando...' : 'Salvar pesagem'}
          </button>
          {feedback ? <p className="text-sm font-semibold text-graphite/70">{feedback}</p> : null}
        </div>
      </Card>
    </div>
  );
}
