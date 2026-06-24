alter table membros.people
add column if not exists birth_day smallint,
add column if not exists birth_month smallint,
add column if not exists life_stage text;

alter table membros.people
drop constraint if exists people_birth_day_check,
drop constraint if exists people_birth_month_check,
drop constraint if exists people_life_stage_check;

alter table membros.people
add constraint people_birth_day_check check (birth_day is null or birth_day between 1 and 31),
add constraint people_birth_month_check check (birth_month is null or birth_month between 1 and 12),
add constraint people_life_stage_check check (life_stage is null or life_stage in ('crianca', 'adolescente'));

update membros.people
set
  birth_day = coalesce(birth_day, extract(day from birth_date)::smallint),
  birth_month = coalesce(birth_month, extract(month from birth_date)::smallint)
where birth_date is not null;
