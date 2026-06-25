import type { Species } from '../types';

export const species: Species[] = [
  {
    id: 'dourado-mar',
    name: 'Dourado-do-mar',
    category: 'Premium',
    multiplier: 1.4,
    fishingMethod: 'Corrico oceânico',
    minimumWeightKg: 3,
    isCoinFish: true,
    coinMinimumWeightKg: 5,
  },
  {
    id: 'atum',
    name: 'Atum',
    category: 'Premium',
    multiplier: 1.4,
    fishingMethod: 'Isca natural embarcada',
    minimumWeightKg: 4,
    isCoinFish: true,
    coinMinimumWeightKg: 6,
  },
  {
    id: 'cavala',
    name: 'Cavala',
    category: 'Intermediária',
    multiplier: 1.15,
    fishingMethod: 'Corrico costeiro',
    minimumWeightKg: 2,
  },
  {
    id: 'serra',
    name: 'Peixe-serra',
    category: 'Intermediária',
    multiplier: 1.15,
    fishingMethod: 'Arremesso com isca artificial',
    minimumWeightKg: 1.5,
  },
  {
    id: 'cioba',
    name: 'Cioba',
    category: 'Comum',
    multiplier: 0.9,
    fishingMethod: 'Linha de fundo',
    minimumWeightKg: 1,
  },
  {
    id: 'xareu',
    name: 'Xaréu',
    category: 'Comum',
    multiplier: 0.85,
    fishingMethod: 'Jigging leve',
    minimumWeightKg: 1.2,
  },
  {
    id: 'garoupa',
    name: 'Garoupa',
    category: 'Comum',
    multiplier: 0.9,
    fishingMethod: 'Pesca esportiva com soltura recomendada',
    minimumWeightKg: 2.5,
  },
  {
    id: 'bonito',
    name: 'Bonito',
    category: 'Comum',
    multiplier: 0.75,
    fishingMethod: 'Corrico leve',
    minimumWeightKg: 1,
  },
];

export const findSpecies = (id: string) => species.find((item) => item.id === id) ?? species[0];
