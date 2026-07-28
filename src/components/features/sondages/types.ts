export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'rating';

// ── Formulaire admin ─────────────────────────────────────────────────────────

export type PollOptionDraft = {
  id?: string;    // présent si déjà en DB
  label: string;
  order_index: number;
};

export type PollQuestionDraft = {
  id?: string;
  text: string;
  type: QuestionType;
  required: boolean;
  order_index: number;
  options: PollOptionDraft[];   // vide pour text/rating
};

export type PollDraft = {
  title: string;
  description: string;
  closes_at: string;            // datetime-local string, '' si vide
  is_active: boolean;
  questions: PollQuestionDraft[];
};

// ── Lecture (avec relations) ─────────────────────────────────────────────────

export type PollOption = {
  id: string;
  question_id: string;
  label: string;
  order_index: number;
};

export type PollQuestion = {
  id: string;
  poll_id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  order_index: number;
  poll_options: PollOption[];
};

export type Poll = {
  id: string;
  title: string;
  description: string | null;
  closes_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  poll_questions: PollQuestion[];
};

export type PollSummary = Omit<Poll, 'poll_questions'> & {
  response_count: number;
  has_responded: boolean;
};

// ── Réponses ─────────────────────────────────────────────────────────────────

export type PollAnswer = {
  question_id: string;
  option_id: string | null;
  text_value: string | null;
  number_value: number | null;
};

export type PollResponse = {
  id: string;
  poll_id: string;
  member_id: string;
  submitted_at: string;
  member: {
    first_name: string | null;
    last_name: string | null;
    voice_part: { name: string } | null;
  };
  poll_answers: PollAnswer[];
};

// ── Résultats agrégés ────────────────────────────────────────────────────────

export type OptionResult = {
  option_id: string;
  label: string;
  count: number;
};

export type QuestionResult = {
  question_id: string;
  text: string;
  type: QuestionType;
  total_responses: number;
  // single/multiple choice
  options?: OptionResult[];
  // text
  text_answers?: string[];
  // rating
  average?: number;
  rating_distribution?: Record<number, number>;  // {1:2, 2:5, ...}
};

export type PollResults = {
  poll: Omit<Poll, 'poll_questions'>;
  total_responses: number;
  question_results: QuestionResult[];
  responses: PollResponse[];
};
