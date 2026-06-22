alter table membros.people
add column if not exists desired_departments text[] not null default '{}';
