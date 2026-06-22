alter table public.people
add column if not exists family_group text,
add column if not exists family_group_leader text;
