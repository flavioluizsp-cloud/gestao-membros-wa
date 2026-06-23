create table if not exists membros.department_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  leader_person_id uuid references membros.people(id) on delete set null,
  co_leader_person_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table membros.department_settings enable row level security;

drop policy if exists "authenticated read department settings" on membros.department_settings;
drop policy if exists "authenticated manage department settings" on membros.department_settings;

create policy "authenticated read department settings"
on membros.department_settings for select
to authenticated
using (true);

create policy "authenticated manage department settings"
on membros.department_settings for all
to authenticated
using (true)
with check (true);

insert into membros.department_settings (name)
values
  ('Pastoral'),
  ('Louvor'),
  ('Escola Biblica'),
  ('Acao Social'),
  ('Intercessao'),
  ('Teatro'),
  ('Jovens'),
  ('Mulheres'),
  ('Casais'),
  ('Homens'),
  ('Infantil'),
  ('Introdutores'),
  ('Comunicacao')
on conflict (name) do nothing;

update membros.people
set departments = array_remove(coalesce(departments, '{}'), 'Teste'),
    desired_departments = array_remove(coalesce(desired_departments, '{}'), 'Teste')
where 'Teste' = any(coalesce(departments, '{}'))
   or 'Teste' = any(coalesce(desired_departments, '{}'));
