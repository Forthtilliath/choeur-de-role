import type { PollResponse, QuestionResult } from './types';

const NO_PUPITRE = 'Non renseigné';

// Nombre de sélections de chaque option, par pupitre (tout répondant crée une ligne)
export function choiceCountsByPupitre(responses: PollResponse[], questionId: string) {
  const pupitreMap = new Map<string, Record<string, number>>();
  for (const resp of responses) {
    const pupitre = resp.member.voice_part?.name ?? NO_PUPITRE;
    const qAnswers = resp.poll_answers.filter((a) => a.question_id === questionId);
    if (!pupitreMap.has(pupitre)) pupitreMap.set(pupitre, {});
    const entry = pupitreMap.get(pupitre)!;
    for (const ans of qAnswers) {
      if (ans.option_id) entry[ans.option_id] = (entry[ans.option_id] ?? 0) + 1;
    }
  }
  return pupitreMap;
}

// Notes données par pupitre (seuls les répondants ayant noté sont comptés)
export function ratingsByPupitre(responses: PollResponse[], questionId: string) {
  const pupitreMap = new Map<string, number[]>();
  for (const resp of responses) {
    const pupitre = resp.member.voice_part?.name ?? NO_PUPITRE;
    const ans = resp.poll_answers.find((a) => a.question_id === questionId);
    if (ans?.number_value == null) continue;
    if (!pupitreMap.has(pupitre)) pupitreMap.set(pupitre, []);
    pupitreMap.get(pupitre)!.push(ans.number_value);
  }
  return pupitreMap;
}

// Répartition des notes 1–5 et moyenne
export function ratingSummary(vals: number[]) {
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const dist: Record<number, number> = {};
  vals.forEach((v) => {
    dist[v] = (dist[v] ?? 0) + 1;
  });
  return { avg, dist };
}

export function isPupitre(resp: PollResponse, pupitre: string) {
  return (
    resp.member.voice_part?.name === pupitre || (!resp.member.voice_part && pupitre === NO_PUPITRE)
  );
}

// Réponse d'un choriste à une question, en texte (tableaux écran et PDF)
export function formatAnswer(resp: PollResponse, qr: QuestionResult): string {
  const ans = resp.poll_answers.filter((a) => a.question_id === qr.question_id);
  if (qr.type === 'text') return ans[0]?.text_value ?? '—';
  if (qr.type === 'rating') return ans[0]?.number_value?.toString() ?? '—';
  if (ans.length === 0) return '—';
  return ans
    .map((a) => qr.options?.find((o) => o.option_id === a.option_id)?.label ?? '?')
    .join(', ');
}
