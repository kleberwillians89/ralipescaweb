import { ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { captainDecalogue, ruleCards } from '../data/rules';

export function RulesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Regulamento navegável"
        title="Regras em cards"
        description="Sem PDF: as regras ficam escaneáveis, responsivas e prontas para evoluir com validação operacional."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {ruleCards.map((rule) => {
          const Icon = rule.icon;
          return (
            <Card key={rule.title} className="group">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand/65 text-gold">
                  <Icon size={23} strokeWidth={1.7} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-sea">{rule.title}</h2>
                    <ChevronRight className="text-turquoise transition group-hover:translate-x-1" size={18} strokeWidth={1.8} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-graphite/70">{rule.text}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="mt-8">
        <PageHeader
          eyebrow="Espírito do Rali"
          title="Tábua de Bordo"
          description="Fé, mar, competição leal e partilha orientam a operação do Rali de Pesca Solidária Noronha 2026."
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card>
            <h2 className="text-xl font-bold text-sea">Regras Gerais</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-graphite/70">
              <p>Até 6 peixes válidos pontuam por equipe; capturas excedentes permanecem no histórico oficial.</p>
              <p>O cálculo considera peso em gramas, categoria da espécie, Peixe da Moeda, Cardume, Providência e penalidades.</p>
              <p>O desempate segue maior peso bruto total, maior peixe individual e horário de entrega.</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-sea">Decálogo do Capitão</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-graphite/70">
              {captainDecalogue.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="font-bold text-gold">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </section>
    </div>
  );
}
