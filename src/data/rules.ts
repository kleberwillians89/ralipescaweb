import { Clock, Fish, Medal, ShieldCheck, Sparkles, Waves } from 'lucide-react';

export const ruleCards = [
  {
    title: 'Pontuação base',
    icon: Fish,
    text: 'Pontos = peso em gramas x multiplicador da espécie. Premium vale 1.40, Intermediária vale 1.15 e Comum permanece entre 0.75 e 0.90 conforme cadastro.',
  },
  {
    title: 'Peixe da Moeda',
    icon: Medal,
    text: 'Espécies marcadas como Peixe da Moeda recebem bônus de +20% quando atingem o peso mínimo configurado.',
  },
  {
    title: 'Bônus Cardume',
    icon: Waves,
    text: 'Se 1 peixe ou 3 ou mais peixes ficarem entre +5% e 14% acima do peso mínimo, aplica-se +8% uma única vez. Acima de 14% não conta para esse bônus.',
  },
  {
    title: 'Providência',
    icon: Clock,
    text: 'Entrega até 09h30 recebe +8%. De 09h31 até 10h00 recebe +5%. Após 10h00 não há bônus temporal.',
  },
  {
    title: 'Penalidade de volume',
    icon: ShieldCheck,
    text: 'Equipes com menos de 3 peixes válidos têm redução de 10% na pontuação final.',
  },
  {
    title: 'Desempate',
    icon: Sparkles,
    text: 'Em caso de empate, a ordem é: 1º maior peso bruto total, 2º maior peixe individual e 3º horário de entrega.',
  },
];

export const captainDecalogue = [
  'Amarás o mar e o respeitarás como obra divina.',
  'Honrarás a pescagem e a verdade do peixe.',
  'Não cobiçarás o ponto do próximo.',
  'Ajudarás qualquer irmão em perigo no mar.',
  'Partilharás o pescado com alegria, sem reter para si o que for destinado ao banquete.',
  'Guardarás a segurança da tua tripulação acima da vitória.',
  'Não usarás meios proibidos ou predatórios.',
  'Respeitarás as autoridades e a organização.',
  'Celebrarás com moderação e fraternidade.',
  'Agradecerás pelo retorno seguro ao porto.',
];
