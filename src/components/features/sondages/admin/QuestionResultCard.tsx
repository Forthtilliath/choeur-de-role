import type { PollResponse, QuestionResult } from '../types';

import { ChoiceChart } from './ChoiceChart';
import { RatingChart } from './RatingChart';

export function QuestionResultCard({
  result,
  index,
  responses,
}: {
  result: QuestionResult;
  index: number;
  responses: PollResponse[];
}) {
  return (
    <div className="border border-border rounded-2xl p-5 bg-background-secondary flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-foreground/40 mb-0.5">Question {index + 1}</p>
        <p className="text-sm font-semibold text-foreground">{result.text}</p>
        <p className="text-xs text-foreground/40 mt-0.5">
          {result.total_responses} réponse{result.total_responses !== 1 ? 's' : ''}
        </p>
      </div>

      {(result.type === 'single_choice' || result.type === 'multiple_choice') && result.options && (
        <ChoiceChart
          options={result.options}
          total={result.total_responses}
          questionId={result.question_id}
          responses={responses}
        />
      )}

      {result.type === 'rating' && result.rating_distribution !== undefined && (
        <RatingChart
          distribution={result.rating_distribution}
          average={result.average ?? 0}
          total={result.total_responses}
          questionId={result.question_id}
          responses={responses}
        />
      )}

      {result.type === 'text' && result.text_answers && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {result.text_answers.map((t, i) => (
            // Réponses libres en lecture seule, doublons possibles : l'index est la seule clé stable
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <p key={i} className="text-sm text-foreground/70 border-l-2 border-border pl-3">
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
