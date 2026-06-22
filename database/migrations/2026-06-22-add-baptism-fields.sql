alter table public.people
add column if not exists is_baptized boolean not null default false,
add column if not exists baptism_date date,
add column if not exists baptism_church text;
