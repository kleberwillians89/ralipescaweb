import { ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { ruleCards } from '../data/rules';

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
    </div>
  );
}
