import { createClient } from '@/lib/supabase.client';
import { PollAnswer, PollDraft, PollQuestionDraft } from './types';

export async function createPoll(draft: PollDraft, memberId: string): Promise<string | null> {
  const supabase = createClient();

  const { data: poll, error: pollErr } = await supabase
    .from('polls')
    .insert({
      title: draft.title,
      description: draft.description || null,
      closes_at: draft.closes_at || null,
      is_active: draft.is_active,
      created_by: memberId,
    })
    .select('id')
    .single();

  if (pollErr || !poll) return null;

  const ok = await upsertQuestions(poll.id, draft.questions);
  return ok ? poll.id : null;
}

export async function updatePoll(
  id: string,
  draft: PollDraft,
  existingQuestionIds: string[],
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('polls')
    .update({
      title: draft.title,
      description: draft.description || null,
      closes_at: draft.closes_at || null,
      is_active: draft.is_active,
    })
    .eq('id', id);

  if (error) return false;

  const keptIds = draft.questions.map((q) => q.id).filter((v): v is string => Boolean(v));
  const removedIds = existingQuestionIds.filter((qid) => !keptIds.includes(qid));
  if (removedIds.length) {
    await supabase.from('poll_questions').delete().in('id', removedIds);
  }

  return upsertQuestions(id, draft.questions);
}

async function upsertQuestions(pollId: string, questions: PollQuestionDraft[]): Promise<boolean> {
  const supabase = createClient();

  for (const [i, q] of questions.entries()) {
    const qPayload = {
      poll_id: pollId,
      text: q.text,
      type: q.type,
      required: q.required,
      order_index: i,
    };

    let questionId = q.id;

    if (questionId) {
      const { error } = await supabase
        .from('poll_questions')
        .update({ text: q.text, type: q.type, required: q.required, order_index: i })
        .eq('id', questionId);
      if (error) return false;
    } else {
      const { data, error } = await supabase
        .from('poll_questions')
        .insert(qPayload)
        .select('id')
        .single();
      if (error || !data) return false;
      questionId = data.id;
    }

    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      // Fetch existing options to diff
      const { data: existing } = await supabase
        .from('poll_options')
        .select('id')
        .eq('question_id', questionId);

      const existingIds = (existing ?? []).map((o) => o.id);
      const keptOptionIds = q.options.map((o) => o.id).filter((v): v is string => Boolean(v));
      const removedIds = existingIds.filter((oid) => !keptOptionIds.includes(oid));
      if (removedIds.length) {
        await supabase.from('poll_options').delete().in('id', removedIds);
      }

      for (const [j, opt] of q.options.entries()) {
        const optPayload = { question_id: questionId, label: opt.label, order_index: j };
        if (opt.id) {
          await supabase
            .from('poll_options')
            .update({ label: opt.label, order_index: j })
            .eq('id', opt.id);
        } else {
          await supabase.from('poll_options').insert(optPayload);
        }
      }
    }
  }

  return true;
}

export async function deletePoll(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('polls').delete().eq('id', id);
  return !error;
}

export async function togglePollActive(id: string, is_active: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('polls').update({ is_active }).eq('id', id);
  return !error;
}

export async function updatePollResponse(
  pollId: string,
  memberId: string,
  answers: PollAnswer[],
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('poll_responses')
    .delete()
    .eq('poll_id', pollId)
    .eq('member_id', memberId);
  if (error) return false;
  return submitPollResponse(pollId, memberId, answers);
}

export async function submitPollResponse(
  pollId: string,
  memberId: string,
  answers: PollAnswer[],
): Promise<boolean> {
  const supabase = createClient();

  const { data: response, error: respErr } = await supabase
    .from('poll_responses')
    .insert({ poll_id: pollId, member_id: memberId })
    .select('id')
    .single();

  if (respErr || !response) return false;
  if (answers.length === 0) return true;

  const rows = answers.map((a) => ({
    response_id: response.id,
    question_id: a.question_id,
    option_id: a.option_id ?? null,
    text_value: a.text_value ?? null,
    number_value: a.number_value ?? null,
  }));

  const { error: ansErr } = await supabase.from('poll_answers').insert(rows);
  return !ansErr;
}
