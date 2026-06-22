alter table membros.people
add column if not exists marital_status text,
add column if not exists family_members jsonb not null default '[]'::jsonb;
