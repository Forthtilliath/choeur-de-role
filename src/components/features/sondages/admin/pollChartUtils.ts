// Palette des graphiques de résultats
export const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#84cc16',
];

// Infobulle Recharts : « N réponse(s) »
export const formatAnswerCount = (value: unknown): [string, string] => {
  const n = Number(value ?? 0);
  return [`${n} réponse${n !== 1 ? 's' : ''}`, ''];
};
