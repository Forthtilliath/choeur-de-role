import { createClient } from '@/lib/supabase.client';
import { Poll, PollAnswer, PollResults, QuestionResult } from './types';

type RawAnswer = {
  question_id: string;
  option_id: string | null;
  text_value: string | null;
  number_value: number | null;
};

type RawOption = { id: string; label: string; order_index: number };

type RawQuestion = {
  id: string;
  text: string;
  type: string;
  required: boolean;
  order_index: number;
  poll_options: RawOption[];
};

type RawResponse = {
  id: string;
  poll_id: string;
  member_id: string;
  submitted_at: string;
  member: { first_name: string | null; last_name: string | null; voice_part: { name: string } | null };
  poll_answers: RawAnswer[];
};

function sortQuestions(questions: RawQuestion[]): RawQuestion[] {
  return [...questions]
    .sort((a, b) => a.order_index - b.order_index)
    .map((q) => ({
      ...q,
      poll_options: [...q.poll_options].sort((a, b) => a.order_index - b.order_index),
    }));
}

export async function getMyPollAnswers(
  pollId: string,
  memberId: string,
): Promise<Record<string, PollAnswer[]>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('poll_responses')
    .select('poll_answers(question_id, option_id, text_value, number_value)')
    .eq('poll_id', pollId)
    .eq('member_id', memberId)
    .single();

  if (!data) return {};
  const answers = (data.poll_answers ?? []) as PollAnswer[];
  return answers.reduce<Record<string, PollAnswer[]>>((acc, a) => {
    if (!acc[a.question_id]) acc[a.question_id] = [];
    acc[a.question_id].push(a);
    return acc;
  }, {});
}

export async function getPoll(id: string): Promise<Poll> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('polls')
    .select(`*, poll_questions(*, poll_options(*))`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return {
    ...data,
    poll_questions: sortQuestions((data.poll_questions ?? []) as unknown as RawQuestion[]),
  } as unknown as Poll;
}

export async function getPollResults(pollId: string): Promise<PollResults> {
  const supabase = createClient();

  const [pollRes, responsesRes] = await Promise.all([
    supabase
      .from('polls')
      .select(`*, poll_questions(*, poll_options(*))`)
      .eq('id', pollId)
      .single(),
    supabase
      .from('poll_responses')
      .select(
        `*, member:members(first_name, last_name, voice_part:voice_parts(name)), poll_answers(*)`,
      )
      .eq('poll_id', pollId)
      .order('submitted_at'),
  ]);

  if (pollRes.error) throw pollRes.error;
  if (responsesRes.error) throw responsesRes.error;

  const poll = pollRes.data;
  const responses = (responsesRes.data ?? []) as unknown as RawResponse[];
  const questions = sortQuestions((poll.poll_questions ?? []) as unknown as RawQuestion[]);
  const allAnswers: RawAnswer[] = responses.flatMap((r) => r.poll_answers ?? []);

  const question_results: QuestionResult[] = questions.map((q) => {
    const qAnswers = allAnswers.filter((a) => a.question_id === q.id);

    if (q.type === 'text') {
      return {
        question_id: q.id,
        text: q.text,
        type: 'text' as const,
        total_responses: qAnswers.length,
        text_answers: qAnswers.map((a) => a.text_value).filter((t): t is string => t !== null),
      };
    }

    if (q.type === 'rating') {
      const nums = qAnswers
        .map((a) => a.number_value)
        .filter((n): n is number => n !== null);
      const dist: Record<number, number> = {};
      nums.forEach((n) => { dist[n] = (dist[n] ?? 0) + 1; });
      return {
        question_id: q.id,
        text: q.text,
        type: 'rating' as const,
        total_responses: nums.length,
        average: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0,
        rating_distribution: dist,
      };
    }

    return {
      question_id: q.id,
      text: q.text,
      type: (q.type === 'multiple_choice' ? 'multiple_choice' : 'single_choice') as 'single_choice' | 'multiple_choice',
      total_responses: qAnswers.length,
      options: q.poll_options.map((opt) => ({
        option_id: opt.id,
        label: opt.label,
        count: qAnswers.filter((a) => a.option_id === opt.id).length,
      })),
    };
  });

  return {
    poll: {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      closes_at: poll.closes_at,
      is_active: poll.is_active,
      created_by: poll.created_by,
      created_at: poll.created_at,
    },
    total_responses: responses.length,
    question_results,
    responses: responses as unknown as PollResults['responses'],
  };
}
