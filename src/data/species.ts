import type { Species } from '../types';

export const species: Species[] = [
  {
    id: 'dourado-mar',
    name: 'Dourado-do-mar',
    category: 'Nobre',
    multiplier: 2.2,
    fishingMethod: 'Corrico oceânico',
    minimumWeightKg: 3,
    coinMinimumWeightKg: 5,
  },
  {
    id: 'atum',
    name: 'Atum',
    category: 'Nobre',
    multiplier: 2,
    fishingMethod: 'Isca natural embarcada',
    minimumWeightKg: 4,
    coinMinimumWeightKg: 6,
  },
  {
    id: 'cavala',
    name: 'Cavala',
    category: 'Especial',
    multiplier: 1.7,
    fishingMethod: 'Corrico costeiro',
    minimumWeightKg: 2,
  },
  {
    id: 'serra',
    name: 'Peixe-serra',
    category: 'Especial',
    multiplier: 1.5,
    fishingMethod: 'Arremesso com isca artificial',
    minimumWeightKg: 1.5,
  },
  {
    id: 'cioba',
    name: 'Cioba',
    category: 'Tradicional',
    multiplier: 1.3,
    fishingMethod: 'Linha de fundo',
    minimumWeightKg: 1,
  },
  {
    id: 'xareu',
    name: 'Xaréu',
    category: 'Tradicional',
    multiplier: 1.2,
    fishingMethod: 'Jigging leve',
    minimumWeightKg: 1.2,
  },
  {
    id: 'garoupa',
    name: 'Garoupa',
    category: 'Conservação',
    multiplier: 1.1,
    fishingMethod: 'Pesca esportiva com soltura recomendada',
    minimumWeightKg: 2.5,
  },
  {
    id: 'bonito',
    name: 'Bonito',
    category: 'Tradicional',
    multiplier: 1,
    fishingMethod: 'Corrico leve',
    minimumWeightKg: 1,
  },
];

export const findSpecies = (id: string) => species.find((item) => item.id === id) ?? species[0];
