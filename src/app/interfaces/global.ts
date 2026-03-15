export const lotteryOptions = [
  'maismilionaria',
  'megasena',
  'lotofacil',
  'quina',
  'lotomania',
  'timemania',
  'duplasena',
  'federal',
  'diadesorte',
  'supersete'
] as const;

export type LotteryType = (typeof lotteryOptions)[number];

export const defaultLotteryType: LotteryType = 'lotofacil';

export const lotteryLabelMap: Record<LotteryType, string> = {
  maismilionaria: 'Mais Milionária',
  megasena: 'Mega-Sena',
  lotofacil: 'Lotofácil',
  quina: 'Quina',
  lotomania: 'Lotomania',
  timemania: 'Timemania',
  duplasena: 'Dupla Sena',
  federal: 'Federal',
  diadesorte: 'Dia de Sorte',
  supersete: 'Super Sete'
};

export function getLotteryLabel(type?: string): string {
  if (!type) {
    return '';
  }

  const normalized = type.toLowerCase();
  return lotteryLabelMap[normalized as LotteryType] ?? type;
}

export function normalizeLotteryType(type?: string): LotteryType {
  if (!type) {
    return defaultLotteryType;
  }

  const normalized = type.toLowerCase();
  return lotteryOptions.includes(normalized as LotteryType)
    ? (normalized as LotteryType)
    : defaultLotteryType;
}
