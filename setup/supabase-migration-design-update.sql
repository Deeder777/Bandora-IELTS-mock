-- Run ONCE if you already created practice_progress with the earlier supabase.sql.
-- Allows the optional "plan" field used by the redesigned pricing section.
-- Writing/Speaking criterion ratings live inside history items and need no change.
begin;

alter table public.practice_progress drop constraint if exists practice_progress_profile_fields;
alter table public.practice_progress add constraint practice_progress_profile_fields check (
  data ?& array['history', 'target', 'dailyGoal', 'examDate']
  and data - array['history', 'target', 'dailyGoal', 'examDate', 'plan'] = '{}'::jsonb
);

alter table public.practice_progress drop constraint if exists practice_progress_plan;
alter table public.practice_progress add constraint practice_progress_plan check (
  not (data ? 'plan')
  or (jsonb_typeof(data -> 'plan') = 'object'
      and data -> 'plan' ->> 'id' in ('starter', 'pro', 'intensive'))
);

commit;
