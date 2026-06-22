create type app_role as enum ('admin', 'pastor', 'lider', 'membro');
create type scope_type as enum ('grupo_familiar', 'departamento');

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  role app_role not null default 'membro',
  is_global_leader boolean not null default false,
  created_at timestamptz not null default now(),
  unique (auth_user_id)
);

create table if not exists public.user_scopes (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  scope_type scope_type not null,
  scope_value text not null,
  created_at timestamptz not null default now(),
  unique (user_profile_id, scope_type, scope_value)
);

alter table public.user_profiles enable row level security;
alter table public.user_scopes enable row level security;

create policy "authenticated read profiles" on public.user_profiles for select to authenticated using (true);
create policy "authenticated manage profiles" on public.user_profiles for all to authenticated using (true) with check (true);
create policy "authenticated read scopes" on public.user_scopes for select to authenticated using (true);
create policy "authenticated manage scopes" on public.user_scopes for all to authenticated using (true) with check (true);
