alter table public.people
add column if not exists roles text[] not null default '{}';
