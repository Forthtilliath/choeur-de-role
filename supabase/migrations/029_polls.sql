-- Sondages

create table polls (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  closes_at    timestamptz,
  is_active    boolean not null default true,
  created_by   uuid references members(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table poll_questions (
  id          uuid primary key default gen_random_uuid(),
  poll_id     uuid not null references polls(id) on delete cascade,
  text        text not null,
  type        text not null check (type in ('single_choice', 'multiple_choice', 'text', 'rating')),
  required    boolean not null default true,
  order_index int not null default 0
);

create table poll_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references poll_questions(id) on delete cascade,
  label        text not null,
  order_index  int not null default 0
);

create table poll_responses (
  id           uuid primary key default gen_random_uuid(),
  poll_id      uuid not null references polls(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique(poll_id, member_id)
);

create table poll_answers (
  id           uuid primary key default gen_random_uuid(),
  response_id  uuid not null references poll_responses(id) on delete cascade,
  question_id  uuid not null references poll_questions(id) on delete cascade,
  option_id    uuid references poll_options(id) on delete cascade,
  text_value   text,
  number_value int,
  unique(response_id, question_id, option_id)
);

-- RLS
alter table polls          enable row level security;
alter table poll_questions  enable row level security;
alter table poll_options    enable row level security;
alter table poll_responses  enable row level security;
alter table poll_answers    enable row level security;

-- Lecture : tous les choristes
create policy "polls: read by members" on polls
  for select using (auth.role() = 'authenticated');

create policy "poll_questions: read by members" on poll_questions
  for select using (auth.role() = 'authenticated');

create policy "poll_options: read by members" on poll_options
  for select using (auth.role() = 'authenticated');

-- Réponses : chaque membre voit les siennes ; les admins voient tout
create policy "poll_responses: read own or admin" on poll_responses
  for select using (
    member_id = auth.uid()
    or get_my_role() in ('admin', 'super_admin')
  );

create policy "poll_answers: read own or admin" on poll_answers
  for select using (
    exists (
      select 1 from poll_responses pr
      where pr.id = response_id
      and (
        pr.member_id = auth.uid()
        or get_my_role() in ('admin', 'super_admin')
      )
    )
  );

-- Écriture polls/questions/options : admins seulement
create policy "polls: write by admin" on polls
  for all using (get_my_role() in ('admin', 'super_admin'));

create policy "poll_questions: write by admin" on poll_questions
  for all using (get_my_role() in ('admin', 'super_admin'));

create policy "poll_options: write by admin" on poll_options
  for all using (get_my_role() in ('admin', 'super_admin'));

-- Réponses : chaque membre gère les siennes
create policy "poll_responses: insert own" on poll_responses
  for insert with check (member_id = auth.uid());

create policy "poll_answers: insert own" on poll_answers
  for insert with check (
    exists (
      select 1 from poll_responses pr
      where pr.id = response_id
      and pr.member_id = auth.uid()
    )
  );
