import { Minus, Plus, RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { species as demoSpecies } from '../data/species';
import { saveTeamCalculation } from '../services/catchService';
import { formatSupabaseError } from '../services/errorMessages';
import { canManageTeams } from '../services/permissions';
import { calculateScore, createCatchEntry } from '../services/scoring';
import { getActiveSpecies } from '../services/speciesService';
import { getTeams } from '../services/teamService';
import type { CatchEntry, Species } from '../types';
import type { Team } from '../types/database';

const formatScore = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export function CalculatorPage() {
  const { profile } = useAuth();
  const [species, setSpecies] = useState<Species[]>(demoSpecies);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState('');
  const [entries, setEntries] = useState<CatchEntry[]>([createCatchEntry(), createCatchEntry(), createCatchEntry()]);
  const [returnedAt, setReturnedAt] = useState('');
  const [applyManualPenalty, setApplyManualPenalty] = useState(false);
  const [manualPenaltyMode, setManualPenaltyMode] = useState<'percent' | 'points'>('percent');
  const [manualPenaltyValue, setManualPenaltyValue] = useState('');
  const [manualPenaltyReason, setManualPenaltyReason] = useState('');
  const [manualPenaltyNotes, setManualPenaltyNotes] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [savingCalculation, setSavingCalculation] = useState(false);

  useEffect(() => {
    Promise.all([getActiveSpecies(), getTeams()])
      .then(([loadedSpecies, loadedTeams]) => {
        setSpecies(loadedSpecies);
        setTeams(loadedTeams);
        setTeamId(loadedTeams[0]?.id ?? '');
        setEntries((current) => current.map((entry) => ({ ...entry, speciesId: loadedSpecies.some((item) => item.id === entry.speciesId) ? entry.speciesId : loadedSpecies[0]?.id ?? entry.speciesId })));
      })
      .catch((error) => {
        console.error('[Calculator] Erro ao carregar dados:', error);
        setLoadError(formatSupabaseError(error, 'Erro ao carregar dados da calculadora.'));
      });
  }, []);

  const score = useMemo(
    () =>
      calculateScore(
        entries,
        {
          returnedAt,
          manualPenaltyMode,
          manualPenaltyValue: applyManualPenalty ? Number(manualPenaltyValue) : 0,
        },
        species,
      ),
    [applyManualPenalty, entries, manualPenaltyMode, manualPenaltyValue, returnedAt, species],
  );
  const canAddFish = entries.length < 12;
  const canSaveOfficialCalculation = canManageTeams(profile);

  const updateEntry = (id: string, changes: Partial<CatchEntry>) => {
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
  };

  const removeEntry = (id: string) => {
    setEntries((current) => (current.length === 1 ? current : current.filter((entry) => entry.id !== id)));
  };

  const resetCalculator = () => {
    setEntries([createCatchEntry(species[0]?.id), createCatchEntry(species[0]?.id), createCatchEntry(species[0]?.id)]);
    setReturnedAt('');
    setApplyManualPenalty(false);
    setManualPenaltyValue('');
    setManualPenaltyReason('');
    setManualPenaltyNotes('');
    setSaveFeedback('');
  };

  const getCoinFishStatus = (entry: CatchEntry) => {
    const selectedSpecies = species.find((item) => item.id === entry.speciesId);
    const coinMinimumWeightKg = selectedSpecies?.coinMinimumWeightKg ?? selectedSpecies?.minimumWeightKg ?? null;

    return Boolean(
      selectedSpecies &&
        (selectedSpecies.isCoinFish || selectedSpecies.coinMinimumWeightKg) &&
        coinMinimumWeightKg &&
        entry.weightKg >= coinMinimumWeightKg,
    );
  };

  const handleSaveCalculation = async () => {
    setSaveFeedback('');

    if (!teamId) {
      setSaveFeedback('Selecione uma equipe antes de salvar o cálculo.');
      return;
    }

    const validEntries = entries.filter((entry) => entry.weightKg > 0 && (entry.quantity ?? 1) > 0);
    if (validEntries.length === 0) {
      setSaveFeedback('Adicione pelo menos um peixe válido antes de salvar.');
      return;
    }

    const totalFishPresented = validEntries.reduce((total, entry) => total + Math.max(1, Math.floor(entry.quantity ?? 1)), 0);
    const notes = [manualPenaltyReason, manualPenaltyNotes].filter(Boolean).join(' · ') || null;

    setSavingCalculation(true);
    try {
      const payload = {
        teamId,
        fishes: validEntries.map((entry) => ({
          speciesId: entry.speciesId,
          weightKg: entry.weightKg,
          quantity: Math.max(1, Math.floor(entry.quantity ?? 1)),
          isCoinFish: getCoinFishStatus(entry),
        })),
        returnedAt,
        totalFishPresented,
        submittedBy: profile?.id ?? null,
        replaceExisting: false,
        notes,
      };

      const result = await saveTeamCalculation(payload);
      if (result.status === 'conflict') {
        const confirmed = window.confirm('Esta equipe já possui pesagens salvas. Deseja substituir os dados anteriores?');
        if (!confirmed) {
          return;
        }

        await saveTeamCalculation({ ...payload, replaceExisting: true });
      }

      setSaveFeedback('Cálculo salvo com sucesso para a equipe.');
    } catch (error) {
      console.error('[saveTeamCalculation] erro detalhado:', error);
      setSaveFeedback(error instanceof Error ? error.message : 'Erro ao salvar cálculo. Verifique sua permissão e tente novamente.');
    } finally {
      setSavingCalculation(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora oficial"
        title="Pontuação em tempo real"
        description="Informe até 6 peixes, selecione a espécie e aplique os bônus do regulamento. O total é recalculado automaticamente."
      />

      <Card className="mb-5">
        {loadError ? <p className="mb-4 rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">{loadError}</p> : null}
        {teams.length === 0 ? (
          <p className="mb-4 rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">
            Nenhuma equipe cadastrada. Cadastre uma equipe antes de calcular oficialmente.
          </p>
        ) : null}
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-graphite/70">Equipe</span>
            <select
              className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-base outline-none transition focus:border-gold"
              onChange={(event) => setTeamId(event.target.value)}
              required
              value={teamId}
            >
              <option value="">Selecione uma equipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}{team.boat_name ? ` - ${team.boat_name}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4 lg:order-1">
          {entries.map((entry, index) => (
            <Card key={entry.id} className="overflow-hidden">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-sea">Peixe {index + 1}</h2>
                {index >= 6 ? <span className="rounded-full bg-sand/70 px-3 py-1 text-xs font-bold text-graphite/70">Histórico</span> : null}
                <button
                  aria-label="Remover peixe"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sand text-graphite/70 transition hover:border-gold hover:text-sea disabled:opacity-30"
                  disabled={entries.length === 1}
                  onClick={() => removeEntry(entry.id)}
                  type="button"
                >
                  <Minus size={18} strokeWidth={1.8} />
                </button>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)_minmax(0,0.55fr)]">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-graphite/70">Espécie</span>
                  <select
                    className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-base outline-none transition focus:border-gold"
                    onChange={(event) => updateEntry(entry.id, { speciesId: event.target.value })}
                    value={entry.speciesId}
                  >
                    {species.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} x{item.multiplier}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-graphite/70">Peso em kg</span>
                  <input
                    className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-base outline-none transition focus:border-gold"
                    inputMode="decimal"
                    min="0"
                    onChange={(event) => updateEntry(entry.id, { weightKg: Number(event.target.value) })}
                    placeholder="0,0"
                    step="0.1"
                    type="number"
                    value={entry.weightKg || ''}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-graphite/70">Quantidade</span>
                  <input
                    className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-base outline-none transition focus:border-gold"
                    inputMode="numeric"
                    min="1"
                    onChange={(event) => updateEntry(entry.id, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                    step="1"
                    type="number"
                    value={entry.quantity || 1}
                  />
                </label>
              </div>
              {(() => {
                const selectedSpecies = species.find((item) => item.id === entry.speciesId);
                return selectedSpecies?.isCoinFish || selectedSpecies?.coinMinimumWeightKg ? (
                  <div className="mt-4 rounded-2xl border border-gold/40 bg-sand/35 px-4 py-3 text-sm font-semibold text-sea">
                    Peixe da Moeda +20%
                    {selectedSpecies.coinMinimumWeightKg ? (
                      <span className="block text-xs font-semibold text-graphite/70">
                        Peso mínimo: {selectedSpecies.coinMinimumWeightKg.toLocaleString('pt-BR')} kg
                      </span>
                    ) : null}
                  </div>
                ) : null;
              })()}
            </Card>
          ))}

          <div className="sticky bottom-24 z-20 grid gap-3 rounded-[24px] border border-sand/60 bg-white/94 p-3 shadow-soft backdrop-blur sm:static sm:flex sm:flex-wrap sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-turquoise disabled:opacity-40"
              disabled={!canAddFish}
              onClick={() => setEntries((current) => [...current, createCatchEntry(species[0]?.id)])}
              type="button"
            >
              <Plus size={18} strokeWidth={1.8} />
              Adicionar peixe
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-5 py-3 text-sm font-bold text-sea transition hover:-translate-y-0.5 hover:border-gold"
              onClick={resetCalculator}
              type="button"
            >
              <RotateCcw size={18} strokeWidth={1.8} />
              Reiniciar
            </button>
          </div>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:order-2 lg:self-start">
          <Card className="bg-sea text-white">
            <p className="text-sm text-white/65">Total oficial</p>
            <p className="mt-2 break-words text-4xl font-bold sm:text-5xl">{formatScore(score.total)}</p>
            <p className="mt-1 text-sm text-white/65">pontos</p>
          </Card>

          {canSaveOfficialCalculation ? (
            <Card>
              <div className="grid gap-3">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sea px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-turquoise disabled:opacity-60"
                  disabled={savingCalculation}
                  onClick={() => void handleSaveCalculation()}
                  type="button"
                >
                  <Save size={18} strokeWidth={1.8} />
                  {savingCalculation ? 'Salvando...' : 'Salvar cálculo na equipe'}
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand bg-white px-5 py-3 text-sm font-bold text-sea transition hover:-translate-y-0.5 hover:border-gold"
                  onClick={resetCalculator}
                  type="button"
                >
                  <RotateCcw size={18} strokeWidth={1.8} />
                  Reiniciar
                </button>
                <p className="text-sm font-semibold text-graphite/65">Este salvamento alimenta o ranking oficial.</p>
                {saveFeedback ? <p className="rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">{saveFeedback}</p> : null}
              </div>
            </Card>
          ) : null}

          <Card>
            <div className="space-y-3">
              <label className="grid min-w-0 gap-2 rounded-2xl border border-sand/70 p-4 transition hover:border-gold">
                <span>
                  <span className="block font-bold text-sea">Bônus Temporal</span>
                  <span className="text-sm text-graphite/70">Até 09h30: +8%. 09h31 até 10h00: +5%.</span>
                </span>
                <input
                  className="min-h-12 w-full rounded-2xl border border-sand bg-white px-4 py-3"
                  onChange={(event) => setReturnedAt(event.target.value)}
                  type="datetime-local"
                  value={returnedAt}
                />
              </label>
              <label className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-sand/70 p-4 transition hover:border-gold">
                <span className="min-w-0">
                  <span className="block font-bold text-sea">Penalidade manual</span>
                  <span className="text-sm text-graphite/70">Percentual ou pontos fixos</span>
                </span>
                <input checked={applyManualPenalty} className="h-5 w-5 accent-gold" onChange={(event) => setApplyManualPenalty(event.target.checked)} type="checkbox" />
              </label>
              {applyManualPenalty ? (
                <div className="grid gap-3 rounded-2xl border border-sand/70 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3" onChange={(event) => setManualPenaltyMode(event.target.value as 'percent' | 'points')} value={manualPenaltyMode}>
                      <option value="percent">Percentual</option>
                      <option value="points">Pontos</option>
                    </select>
                    <input className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3" min="0" onChange={(event) => setManualPenaltyValue(event.target.value)} placeholder={manualPenaltyMode === 'percent' ? '10%' : '10 pontos'} type="number" value={manualPenaltyValue} />
                  </div>
                  <input className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3" onChange={(event) => setManualPenaltyReason(event.target.value)} placeholder="Motivo" value={manualPenaltyReason} />
                  <input className="min-h-12 rounded-2xl border border-sand bg-white px-4 py-3" onChange={(event) => setManualPenaltyNotes(event.target.value)} placeholder="Observação" value={manualPenaltyNotes} />
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="min-w-0">Base por espécie</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.baseScore)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="min-w-0">Peixe da Moeda +20%</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.coinFishBonus)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="min-w-0">Bônus Cardume</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.schoolBonus)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="min-w-0">Bônus Temporal ({Math.round(score.temporalRate * 100)}%)</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.temporalBonus)}</dd></div>
              <div className="flex justify-between gap-4 text-gold"><dt className="min-w-0">Penalidade automática</dt><dd className="shrink-0 font-bold">-{formatScore(score.lowVolumePenalty)}</dd></div>
              <div className="flex justify-between gap-4 text-gold"><dt className="min-w-0">Penalidade manual</dt><dd className="shrink-0 font-bold">-{formatScore(score.manualPenalty)}</dd></div>
              <div className="border-t border-sand pt-3 text-graphite/70">
                <p>{score.scoredFishCount} peixe(s) pontuando de {score.validFishCount} válido(s).</p>
                <p>Penalidade calculada sobre {score.fishCountForPenalty} peixe(s) apresentado(s).</p>
                {score.ignoredFishCount ? <p>{score.ignoredFishCount} peixe(s) mantido(s) no histórico sem pontuar.</p> : null}
                <p>Peso bruto total: {score.grossWeightTotalKg.toLocaleString('pt-BR')} kg</p>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
