create table if not exists membros.department_assignments (
  id uuid primary key default gen_random_uuid(),
  department_name text not null references membros.department_settings(name) on delete cascade,
  person_id uuid not null references membros.people(id) on delete cascade,
  role text not null check (role in ('lider', 'co_lider')),
  created_at timestamptz not null default now(),
  unique (department_name, person_id)
);

alter table membros.department_assignments enable row level security;

drop policy if exists "authenticated read department assignments" on membros.department_assignments;
drop policy if exists "authenticated manage department assignments" on membros.department_assignments;

create policy "authenticated read department assignments" on membros.department_assignments
  for select to authenticated using (true);

create policy "authenticated manage department assignments" on membros.department_assignments
  for all to authenticated using (true) with check (true);

insert into membros.department_assignments (department_name, person_id, role)
select name, leader_person_id, 'lider'
from membros.department_settings
where leader_person_id is not null
on conflict (department_name, person_id) do update set role = 'lider';

insert into membros.department_assignments (department_name, person_id, role)
select department_settings.name, unnest(department_settings.co_leader_person_ids), 'co_lider'
from membros.department_settings
where co_leader_person_ids is not null
  and array_length(co_leader_person_ids, 1) is not null
on conflict (department_name, person_id) do update set role = 'co_lider';
