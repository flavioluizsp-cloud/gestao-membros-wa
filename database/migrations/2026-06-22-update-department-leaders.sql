-- Marca líderes e co-líderes dos departamentos informados.
-- Use com nomes aproximados já cadastrados em people.

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Pastoral'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Flávio%' or name ilike 'Flavio%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Pastoral'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider']))
where name ilike 'Raquel%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Louvor'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Daniel%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Infantil'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Jennifer%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Acao Social'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Diego%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Mulheres'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Abigail%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Mulheres'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider']))
where name ilike 'Geslaine%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Homens'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'João Marcelo%' or name ilike 'Joao Marcelo%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Jovens'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Elias%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Jovens'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider']))
where name ilike 'Karine%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Casais'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Gabi%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Casais'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider']))
where name ilike 'Kelvin%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Introdutores'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Abigail%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Introdutores'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider']))
where name ilike 'Farina%' or name ilike 'Volmir Farina%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Intercessao'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider']))
where name ilike 'Cleoni%';

update public.people
set departments = array(select distinct unnest(coalesce(departments, '{}') || array['Intercessao'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider']))
where name ilike 'Nuria%' or name ilike 'Núria%';
