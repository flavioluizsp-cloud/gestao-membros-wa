update public.people
set departments = array(
  select distinct unnest(coalesce(departments, '{}') || array['Teste'])
)
where name ilike 'Flávio%'
   or name ilike 'Flavio%'
   or name ilike 'Raquel%'
   or name ilike 'Ana Lígia%'
   or name ilike 'Ana Ligia%'
   or name ilike 'Isabel%';
