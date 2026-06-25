import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { species as demoSpecies } from '../data/species';
import { calculateScore, createCatchEntry } from '../services/scoring';
import { getActiveSpecies } from '../services/speciesService';
import type { CatchEntry, Species } from '../types';

const formatScore = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

export function CalculatorPage() {
  const [species, setSpecies] = useState<Species[]>(demoSpecies);
  const [entries, setEntries] = useState<CatchEntry[]>([createCatchEntry(), createCatchEntry(), createCatchEntry()]);
  const [hasCoinFish, setHasCoinFish] = useState(false);
  const [hasTemporalBonus, setHasTemporalBonus] = useState(false);

  useEffect(() => {
    getActiveSpecies()
      .then((loadedSpecies) => {
        setSpecies(loadedSpecies);
        setEntries((current) => current.map((entry) => ({ ...entry, speciesId: loadedSpecies.some((item) => item.id === entry.speciesId) ? entry.speciesId : loadedSpecies[0]?.id ?? entry.speciesId })));
      })
      .catch((error) => console.error('[Rali Noronha] Erro ao carregar espécies:', error));
  }, []);

  const score = useMemo(() => calculateScore(entries, { hasCoinFish, hasTemporalBonus }, species), [entries, hasCoinFish, hasTemporalBonus, species]);
  const canAddFish = entries.length < 6;

  const updateEntry = (id: string, changes: Partial<CatchEntry>) => {
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));
  };

  const removeEntry = (id: string) => {
    setEntries((current) => (current.length === 1 ? current : current.filter((entry) => entry.id !== id)));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Calculadora oficial"
        title="Pontuação em tempo real"
        description="Informe até 6 peixes, selecione a espécie e aplique os bônus do regulamento. O total é recalculado automaticamente."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4 lg:order-1">
          {entries.map((entry, index) => (
            <Card key={entry.id} className="overflow-hidden">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-sea">Peixe {index + 1}</h2>
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

              <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
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
              </div>
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
              onClick={() => {
                setEntries([createCatchEntry(species[0]?.id), createCatchEntry(species[0]?.id), createCatchEntry(species[0]?.id)]);
                setHasCoinFish(false);
                setHasTemporalBonus(false);
              }}
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

          <Card>
            <div className="space-y-3">
              <label className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-sand/70 p-4 transition hover:border-gold">
                <span className="min-w-0">
                  <span className="block font-bold text-sea">Peixe da Moeda</span>
                  <span className="text-sm text-graphite/70">+15 pontos</span>
                </span>
                <input checked={hasCoinFish} className="h-5 w-5 accent-gold" onChange={(event) => setHasCoinFish(event.target.checked)} type="checkbox" />
              </label>
              <label className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-sand/70 p-4 transition hover:border-gold">
                <span className="min-w-0">
                  <span className="block font-bold text-sea">Bônus Temporal</span>
                  <span className="text-sm text-graphite/70">+8% da base</span>
                </span>
                <input checked={hasTemporalBonus} className="h-5 w-5 accent-gold" onChange={(event) => setHasTemporalBonus(event.target.checked)} type="checkbox" />
              </label>
            </div>
          </Card>

          <Card>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="min-w-0">Base por espécie</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.baseScore)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="min-w-0">Peixe da Moeda</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.coinFishBonus)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="min-w-0">Bônus Cardume</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.schoolBonus)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="min-w-0">Bônus Temporal</dt><dd className="shrink-0 font-bold text-sea">{formatScore(score.temporalBonus)}</dd></div>
              <div className="flex justify-between gap-4 text-gold"><dt className="min-w-0">Penalidade</dt><dd className="shrink-0 font-bold">-{formatScore(score.lowVolumePenalty)}</dd></div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
