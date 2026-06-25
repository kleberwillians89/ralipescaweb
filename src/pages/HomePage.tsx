import { Calculator, Fish, HeartHandshake, ListChecks, Settings, Trophy, Users, Waves } from 'lucide-react';
import { Card } from '../components/Card';
import { MetricPill } from '../components/MetricPill';
import type { PageKey } from '../types';

type HomePageProps = {
  onNavigate: (page: PageKey) => void;
};

const quickActions = [
  { page: 'calculator' as const, label: 'Calculadora', icon: Calculator, detail: 'Pontuação oficial em tempo real' },
  { page: 'species' as const, label: 'Espécies', icon: Fish, detail: 'Multiplicadores e pesos mínimos' },
  { page: 'ranking' as const, label: 'Ranking', icon: Trophy, detail: 'Classificação simulada da prova' },
  { page: 'rules' as const, label: 'Regulamento', icon: ListChecks, detail: 'Regras navegáveis em cards' },
  { page: 'team' as const, label: 'Minha Equipe', icon: Users, detail: 'Tripulação e embarcação' },
  { page: 'settings' as const, label: 'Configurações', icon: Settings, detail: 'Conta e preferências' },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="home-content space-y-6">
      <section className="hero relative overflow-hidden rounded-[24px] bg-sea text-white shadow-premium sm:rounded-[38px]">
        <img alt="Corrida do Rali de Pesca" className="absolute inset-0 h-full w-full object-cover object-center" src="/hero-corrida.png" />
        <div className="hero-content relative grid gap-8 px-5 py-8 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] md:items-end md:px-10 md:py-12">
          <div className="min-w-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <Waves size={17} strokeWidth={1.8} />
              Fernando de Noronha
            </div>
            <h1 className="hero-title font-bold tracking-normal">
              Pesca Solidária
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/88 sm:text-lg">
              Noronha 2026 reúne fé, estratégia e partilha em uma experiência premium para equipes e organização.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <button
                className="min-h-12 rounded-full bg-gold px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-turquoise"
                onClick={() => onNavigate('calculator')}
                type="button"
              >
                Abrir calculadora
              </button>
              <button
                className="min-h-12 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                onClick={() => onNavigate('rules')}
                type="button"
              >
                Ver regras
              </button>
            </div>
          </div>

          <div className="hero-stats grid gap-3 min-[390px]:grid-cols-2 md:grid-cols-1">
            <MetricPill className="hero-stat-card" label="Limite" value="6 peixes" />
            <MetricPill className="hero-stat-card" label="Bônus" value="3 regras" />
            <MetricPill className="hero-stat-card min-[390px]:col-span-2 md:col-span-1" label="Ranking" value="Tempo real" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button className="h-full w-full" key={action.page} onClick={() => onNavigate(action.page)} type="button">
              <Card className="h-full min-h-44 text-left transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-premium">
                <span className="mb-6 grid h-14 w-14 place-items-center rounded-3xl bg-sand/55 text-sea">
                  <Icon size={29} strokeWidth={1.7} />
                </span>
                <h2 className="text-xl font-bold text-sea">{action.label}</h2>
                <p className="mt-2 text-sm leading-6 text-graphite/70">{action.detail}</p>
              </Card>
            </button>
          );
        })}
      </section>

      <Card className="grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
        <span className="grid h-14 w-14 place-items-center rounded-3xl bg-sand/60 text-gold">
          <HeartHandshake size={28} strokeWidth={1.7} />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-sea">Esporte, fé, conservação e solidariedade em uma só operação.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite/70">
            A interface foi preparada para uso em campo, com leitura rápida no celular e contratos de dados prontos para a futura integração com Supabase.
          </p>
        </div>
      </Card>
    </div>
  );
}
