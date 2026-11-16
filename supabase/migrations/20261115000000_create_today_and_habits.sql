-- LevelUp: daily priorities, habits and habit check-ins.
-- Every row belongs to one user; row-level security limits each user to their own rows.
-- Days are calendar dates in the user's local time zone, supplied by the apps.

-- ─── Priorities ──────────────────────────────────────────────────────────────
create table public.priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  -- Up to three priorities per day: one per slot 0–2.
  position smallint not null check (position between 0 and 2),
  title text not null check (char_length(trim(title)) between 1 and 120),
  area text check (
    area in ('health', 'mind', 'career', 'learning', 'relationships', 'finance', 'creativity')
  ),
  status text not null default 'open' check (status in ('open', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day, position),
  check ((status = 'done') = (completed_at is not null))
);

comment on table public.priorities is 'Up to three priorities per user per day.';
create index priorities_user_day_idx on public.priorities (user_id, day);

-- ─── Habits ──────────────────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  area text check (
    area in ('health', 'mind', 'career', 'learning', 'relationships', 'finance', 'creativity')
  ),
  -- daily: every day · weekdays: specific ISO weekdays (1 = Mon … 7 = Sun) · weekly: N times a week
  schedule_type text not null default 'daily' check (schedule_type in ('daily', 'weekdays', 'weekly')),
  schedule_days smallint[] check (schedule_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  weekly_target smallint check (weekly_target between 1 and 7),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Lets check-ins reference (habit, owner) so a check-in can never point at another user's habit.
  unique (id, user_id),
  check (
    (schedule_type = 'weekdays') = (schedule_days is not null and cardinality(schedule_days) between 1 and 7)
  ),
  check ((schedule_type = 'weekly') = (weekly_target is not null))
);

comment on table public.habits is 'Habits with a schedule; archived habits keep their history.';
create index habits_user_idx on public.habits (user_id) where archived_at is null;

-- ─── Habit check-ins ─────────────────────────────────────────────────────────
create table public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  habit_id uuid not null,
  day date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, day),
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);

comment on table public.habit_checkins is 'One row per habit per day it was completed.';
create index habit_checkins_user_day_idx on public.habit_checkins (user_id, day);

-- ─── Row-level security ──────────────────────────────────────────────────────
alter table public.priorities enable row level security;
alter table public.habits enable row level security;
alter table public.habit_checkins enable row level security;

create policy "Users manage their own priorities"
  on public.priorities for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own habits"
  on public.habits for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own habit check-ins"
  on public.habit_checkins for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.priorities to authenticated;
grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, delete on public.habit_checkins to authenticated;

-- ─── Keep updated_at current (function from the profiles migration) ──────────
create trigger priorities_set_updated_at
  before update on public.priorities
  for each row execute function public.set_updated_at();

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();
