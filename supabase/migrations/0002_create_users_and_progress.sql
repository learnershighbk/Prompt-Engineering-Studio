-- Migration: create users and progress tables for Prompt Lab
-- Follows project guideline: idempotent, no RLS (disabled explicitly)

-- Ensure pgcrypto is available for gen_random_uuid
create extension if not exists "pgcrypto";

-- 1. users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  student_id varchar(9) unique not null,
  user_type varchar(10) default 'student'
    check (user_type in ('student', 'staff')),
  language varchar(2) default 'ko'
    check (language in ('ko', 'en')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_student_id on public.users (student_id);

comment on table public.users is '사용자 정보';
comment on column public.users.student_id is '학번 또는 사번 (9자리)';
comment on column public.users.user_type is '사용자 유형: student(학생), staff(교직원)';
comment on column public.users.language is '선호 언어: ko(한국어), en(영어)';

-- 2. progress table
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_slug varchar(50) not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, lesson_slug)
);

create index if not exists idx_progress_user_id on public.progress (user_id);
create index if not exists idx_progress_lesson_slug on public.progress (lesson_slug);
create index if not exists idx_progress_user_lesson on public.progress (user_id, lesson_slug);

comment on table public.progress is '학습 진도 정보';
comment on column public.progress.lesson_slug is '학습 단원 식별자 (intro, zero-shot, few-shot, chain-of-thought)';
comment on column public.progress.completed is '완료 여부';
comment on column public.progress.completed_at is '완료 일시';

-- 3. updated_at 자동 갱신 함수 (idempotent)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4. 트리거 생성 (중복 생성 방지)
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_users_updated_at'
  ) then
    create trigger update_users_updated_at
      before update on public.users
      for each row
      execute function public.update_updated_at_column();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_progress_updated_at'
  ) then
    create trigger update_progress_updated_at
      before update on public.progress
      for each row
      execute function public.update_updated_at_column();
  end if;
end;
$$;

-- 5. RLS 비활성화 (프로젝트 가이드라인: RLS 사용 금지)
alter table if exists public.users disable row level security;
alter table if exists public.progress disable row level security;


