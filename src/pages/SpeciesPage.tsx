import { Scale, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { getActiveSpecies } from '../services/speciesService';
import type { Species } from '../types';

export function SpeciesPage() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getActiveSpecies()
      .then(setSpecies)
      .catch((error) => {
        console.error('[Rali Noronha] Erro ao carregar espécies:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar espécies.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Tabela técnica"
        title="Espécies do rali"
        description="Espécies oficiais carregadas da tabela species, com multiplicadores e critérios de pesagem."
      />

      {loading ? <p className="text-sm font-semibold text-graphite/70">Carregando espécies...</p> : null}
      {error ? <p className="rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">{error}</p> : null}
      {!loading && !error && species.length === 0 ? <p className="rounded-2xl bg-sand/45 px-4 py-3 text-sm font-semibold text-graphite/75">Nenhuma espécie ativa cadastrada.</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {species.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{item.category}</p>
                <h2 className="mt-2 text-2xl font-bold text-sea">{item.name}</h2>
                {item.isCoinFish || item.coinMinimumWeightKg ? (
                  <span className="mt-3 inline-flex rounded-full bg-sand px-3 py-1 text-xs font-bold text-sea">Peixe da Moeda</span>
                ) : null}
              </div>
              <span className="rounded-full bg-sea px-3 py-1 text-sm font-bold text-white">x{item.multiplier}</span>
            </div>
            <div className="mt-6 space-y-3 text-sm text-graphite/70">
              <p className="flex gap-3">
                <Waves className="mt-0.5 text-turquoise" size={18} strokeWidth={1.7} />
                <span>{item.fishingMethod}</span>
              </p>
              <p className="flex gap-3">
                <Scale className="mt-0.5 text-turquoise" size={18} strokeWidth={1.7} />
                <span>
                  Peso mínimo: {item.minimumWeightKg ? `${item.minimumWeightKg.toLocaleString('pt-BR')} kg` : 'Não configurado'}
                </span>
              </p>
              {item.coinMinimumWeightKg ? (
                <p className="flex gap-3">
                  <Scale className="mt-0.5 text-gold" size={18} strokeWidth={1.7} />
                  <span>Peso mínimo Peixe da Moeda: {item.coinMinimumWeightKg.toLocaleString('pt-BR')} kg · bônus +20%</span>
                </p>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
