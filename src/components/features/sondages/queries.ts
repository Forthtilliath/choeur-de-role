import { createServerClient } from '@/lib/supabase.server';
import { Poll, PollResults, PollSummary, QuestionResult } from './types';

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

export async function getPolls(): Promise<Poll[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('polls')
    .select(`*, poll_questions(*, poll_options(*))`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    ...p,
    poll_questions: sortQuestions((p.poll_questions ?? []) as unknown as RawQuestion[]),
  })) as unknown as Poll[];
}

export async function getPoll(id: string): Promise<Poll> {
  const supabase = await createServerClient();
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

export async function getActivePollsForMember(): Promise<PollSummary[]> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const memberId = user?.id ?? null;

  const { data, error } = await supabase
    .from('polls')
    .select(`*, poll_responses(member_id)`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    closes_at: p.closes_at,
    is_active: p.is_active,
    created_by: p.created_by,
    created_at: p.created_at,
    response_count: ((p.poll_responses ?? []) as { member_id: string }[]).length,
    has_responded: memberId
      ? ((p.poll_responses ?? []) as { member_id: string }[]).some((r) => r.member_id === memberId)
      : false,
  })) as PollSummary[];
}

export async function getPollResults(pollId: string): Promise<PollResults> {
  const supabase = await createServerClient();

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
