-- Run once in the SQL Editor of YOUR Supabase project.
-- Intended for a new practice_progress table; it is not a general migration
-- for an unrelated table with the same name. No real user data is seeded.
begin;

create table if not exists public.practice_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint practice_progress_object check (jsonb_typeof(data) = 'object'),
  constraint practice_progress_profile_fields check (
    data ?& array['history', 'target', 'dailyGoal', 'examDate']
    and data - array['history', 'target', 'dailyGoal', 'examDate', 'plan'] = '{}'::jsonb
  ),
  constraint practice_progress_history_limit check (
    jsonb_typeof(data -> 'history') = 'array'
    and jsonb_array_length(data -> 'history') <= 50
  ),
  constraint practice_progress_size check (octet_length(data::text) <= 4194304)
);

alter table public.practice_progress enable row level security;

-- Grants and policies work together: visitors receive no table privileges.
revoke all on table public.practice_progress from public, anon, authenticated;
grant select, insert, update on table public.practice_progress to authenticated;

drop policy if exists "Learners read their own progress" on public.practice_progress;
create policy "Learners read their own progress"
  on public.practice_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Learners create their own progress" on public.practice_progress;
create policy "Learners create their own progress"
  on public.practice_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Learners update their own progress" on public.practice_progress;
create policy "Learners update their own progress"
  on public.practice_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- No DELETE privilege or DELETE policy is granted to browser clients.
-- user_id's primary key also indexes the column used by the RLS policies.
-- Optional chosen plan: {"id": "starter"|"pro"|"intensive", "date": <ms>}. No payment data is stored.
alter table public.practice_progress drop constraint if exists practice_progress_plan;
alter table public.practice_progress add constraint practice_progress_plan check (
  not (data ? 'plan')
  or (jsonb_typeof(data -> 'plan') = 'object'
      and data -> 'plan' ->> 'id' in ('starter', 'pro', 'intensive'))
);

comment on table public.practice_progress is
  'Private learner practice history and settings. Self-reported learning data, not certified exam scores.';

commit;
