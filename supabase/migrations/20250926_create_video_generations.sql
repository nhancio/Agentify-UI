-- Create table for AI video generations (Alibaba Wan 2.2 via WaveSpeed)
create table if not exists public.video_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text,
  api_provider text not null default 'alibaba_wan_2_2',
  input_image_url text,
  motion_video_url text,
  output_video_url text,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.video_generations enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'video_generations' and policyname = 'read own videos'
  ) then
    create policy "read own videos"
      on public.video_generations for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'video_generations' and policyname = 'delete own videos'
  ) then
    create policy "delete own videos"
      on public.video_generations for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- Ensure users table has credits column
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'credits'
  ) then
    alter table public.users add column credits integer not null default 0;
  end if;
end $$;


