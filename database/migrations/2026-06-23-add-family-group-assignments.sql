create table if not exists membros.family_group_assignments (
  id uuid primary key default gen_random_uuid(),
  family_group text not null,
  person_id uuid not null references membros.people(id) on delete cascade,
  role text not null check (role in ('lider', 'co_lider')),
  created_at timestamptz not null default now(),
  unique (family_group, person_id)
);

alter table membros.family_group_assignments enable row level security;

drop policy if exists "authenticated read family group assignments" on membros.family_group_assignments;
drop policy if exists "authenticated manage family group assignments" on membros.family_group_assignments;

create policy "authenticated read family group assignments" on membros.family_group_assignments
  for select to authenticated using (true);

create policy "authenticated manage family group assignments" on membros.family_group_assignments
  for all to authenticated using (true) with check (true);
