create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'uploading' check (status in ('uploading', 'submitted', 'reviewing', 'accepted', 'declined', 'paid', 'proof_sent', 'approved', 'printing', 'shipped', 'complete', 'cancelled')),
  idempotency_key text not null unique,
  order_type text not null,
  sport text not null,
  package_interest text not null,
  add_on_interest text,
  style text not null,
  athlete_first_name text not null,
  athlete_last_name text not null,
  jersey_number text not null,
  position_event text not null,
  team_name text not null,
  primary_color text not null,
  secondary_color text not null,
  graduation_year text,
  season_year text,
  headline text,
  stats text,
  team_size integer,
  customer_name text not null,
  customer_email text not null,
  country text not null,
  state text,
  phone text,
  instagram text,
  deadline_date text,
  notes text,
  guardian_consent boolean not null default false,
  photo_rights_consent boolean not null default false,
  terms_consent boolean not null default false,
  portfolio_contact_opt_in boolean not null default false,
  source text not null default 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  landing_path text,
  photo_count integer not null default 0 check (photo_count between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  sort_order integer not null default 0,
  photo_role text not null default 'additional' check (photo_role in ('face', 'action', 'uniform', 'additional')),
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_created_at_idx on public.submissions(status, created_at desc);
create index if not exists submissions_customer_email_idx on public.submissions(customer_email);
create index if not exists submission_files_submission_id_idx on public.submission_files(submission_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

alter table public.submissions enable row level security;
alter table public.submission_files enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('athlete-submissions', 'athlete-submissions', false, 20971520, array['image/webp', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No public table or storage policies are intentionally created. The server uses
-- the Supabase service role to issue one-time signed upload URLs and temporary
-- review links. Keep SUPABASE_SERVICE_ROLE_KEY server-side only.
