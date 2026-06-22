alter table public.people
add column if not exists administrative_roles text[] not null default '{}',
add column if not exists ecclesiastical_roles text[] not null default '{}',
add column if not exists department_roles text[] not null default '{}',
add column if not exists departments text[] not null default '{}';
