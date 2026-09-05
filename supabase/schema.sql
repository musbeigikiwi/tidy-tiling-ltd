create extension if not exists pgcrypto;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text not null,
  project_type text not null,
  location text,
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','site_visit','quote_sent','accepted','in_progress','completed','declined')),
  estimated_value numeric(12,2),
  preferred_date date,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists quotes_created_at_idx on public.quotes(created_at desc);

alter table public.quotes enable row level security;

-- No public policies are intentionally created.
-- Website submissions go through the Next.js server route using the service-role key.
-- Admin access should use authenticated server-side requests only.
