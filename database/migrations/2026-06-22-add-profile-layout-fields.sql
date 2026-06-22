alter table membros.people
add column if not exists preferred_name text,
add column if not exists hide_birth_year boolean not null default false,
add column if not exists birth_city text,
add column if not exists baptizing_pastor text;
