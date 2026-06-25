import { Clock, Fish, Medal, ShieldCheck, Sparkles, Waves } from 'lucide-react';

export const ruleCards = [
  {
    title: 'Pontuação base',
    icon: Fish,
    text: 'Cada peixe válido soma peso em kg multiplicado pelo coeficiente da espécie. A calculadora limita a prova a até 6 peixes por equipe.',
  },
  {
    title: 'Peixe da Moeda',
    icon: Medal,
    text: 'Quando ativado, adiciona 15 pontos ao total por representar a captura destaque indicada pela organização.',
  },
  {
    title: 'Bônus Cardume',
    icon: Waves,
    text: 'Equipes com 6 peixes válidos recebem 12% de bônus sobre a pontuação parcial.',
  },
  {
    title: 'Bônus Temporal',
    icon: Clock,
    text: 'Capturas registradas dentro da janela estratégica da prova recebem 8% de bônus sobre a pontuação parcial.',
  },
  {
    title: 'Penalidade de volume',
    icon: ShieldCheck,
    text: 'Equipes com menos de 3 peixes têm redução de 20% no total para valorizar constância e planejamento.',
  },
  {
    title: 'Critério solidário',
    icon: Sparkles,
    text: 'O ranking inicial é esportivo e demonstrativo. A arquitetura está pronta para integrar validação, doações e auditoria via Supabase.',
  },
];
