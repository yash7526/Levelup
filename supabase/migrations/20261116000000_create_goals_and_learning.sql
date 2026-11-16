-- LevelUp: goals with milestones, and a learning library with sessions.
-- Every row belongs to one user; row-level security limits each user to their own rows.

-- ─── Goals ───────────────────────────────────────────────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  area text check (
    area in ('health', 'mind', 'career', 'learning', 'relationships', 'finance', 'creativity')
  ),
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check ((status = 'completed') = (completed_at is not null))
);

comment on table public.goals is 'Long-term goals; progress is derived from milestones.';
create index goals_user_status_idx on public.goals (user_id, status);

create table public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  goal_id uuid not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  position integer not null default 0 check (position >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals (id, user_id) on delete cascade
);

comment on table public.goal_milestones is 'Steps toward a goal, in order.';
create index goal_milestones_goal_idx on public.goal_milestones (goal_id, position);
create index goal_milestones_user_idx on public.goal_milestones (user_id);

-- ─── Learning ────────────────────────────────────────────────────────────────
create table public.learning_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  kind text not null check (kind in ('course', 'book', 'skill', 'article')),
  unit text not null check (unit in ('lessons', 'chapters', 'pages', 'modules')),
  total integer not null check (total between 1 and 100000),
  completed integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (completed between 0 and total)
);

comment on table public.learning_items is 'Courses, books, skills and articles being worked through.';
create index learning_items_user_idx on public.learning_items (user_id) where archived_at is null;

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  item_id uuid not null,
  day date not null,
  minutes integer not null check (minutes between 1 and 1440),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  foreign key (item_id, user_id) references public.learning_items (id, user_id) on delete cascade
);

comment on table public.learning_sessions is 'Short study sessions logged against a learning item.';
create index learning_sessions_item_idx on public.learning_sessions (item_id, day desc);
create index learning_sessions_user_day_idx on public.learning_sessions (user_id, day);

-- ─── Row-level security ──────────────────────────────────────────────────────
alter table public.goals enable row level security;
alter table public.goal_milestones enable row level security;
alter table public.learning_items enable row level security;
alter table public.learning_sessions enable row level security;

create policy "Users manage their own goals"
  on public.goals for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own goal milestones"
  on public.goal_milestones for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own learning items"
  on public.learning_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own learning sessions"
  on public.learning_sessions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.goals to authenticated;
grant select, insert, update, delete on public.goal_milestones to authenticated;
grant select, insert, update, delete on public.learning_items to authenticated;
grant select, insert, delete on public.learning_sessions to authenticated;

-- ─── Keep updated_at current (function from the profiles migration) ──────────
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create trigger goal_milestones_set_updated_at
  before update on public.goal_milestones
  for each row execute function public.set_updated_at();

create trigger learning_items_set_updated_at
  before update on public.learning_items
  for each row execute function public.set_updated_at();
