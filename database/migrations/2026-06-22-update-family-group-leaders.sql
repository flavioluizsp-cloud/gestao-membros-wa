-- Atualiza líderes e co-líderes dos Grupos Familiares.
-- Rode depois das colunas family_group, family_group_leader, department_roles e departments existirem.

update public.people
set family_group = 'GF 1',
    family_group_leader = 'Elias / Ivonete',
    ecclesiastical_roles = array(select distinct unnest(coalesce(ecclesiastical_roles, '{}') || array['Pastor'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Pr Elias%' or name ilike 'Elias%';

update public.people
set family_group = 'GF 1',
    family_group_leader = 'Elias / Ivonete',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Ivonete%';

update public.people
set family_group = 'GF 2',
    family_group_leader = 'Daniel / Ana Santin',
    ecclesiastical_roles = array(select distinct unnest(coalesce(ecclesiastical_roles, '{}') || array['Diacono'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Dc Daniel%' or name ilike 'Daniel Mingotti%';

update public.people
set family_group = 'GF 2',
    family_group_leader = 'Daniel / Ana Santin',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Ana Santin%';

update public.people
set family_group = 'GF 3',
    family_group_leader = 'Kelvin / Cleoni',
    ecclesiastical_roles = array(select distinct unnest(coalesce(ecclesiastical_roles, '{}') || array['Diacono'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Dc Kelvin%' or name ilike 'Kelvin Pompeo%';

update public.people
set family_group = 'GF 3',
    family_group_leader = 'Kelvin / Cleoni',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Cleoni%';

update public.people
set family_group = 'GF 4',
    family_group_leader = 'Diego / Jennifer',
    ecclesiastical_roles = array(select distinct unnest(coalesce(ecclesiastical_roles, '{}') || array['Diacono'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Dc Diego%' or name ilike 'Diego Gomes%';

update public.people
set family_group = 'GF 4',
    family_group_leader = 'Diego / Jennifer',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Jennifer%';

update public.people
set family_group = 'GF 5',
    family_group_leader = 'Joao Marcelo / Tiago Gomes',
    ecclesiastical_roles = array(select distinct unnest(coalesce(ecclesiastical_roles, '{}') || array['Presbitero'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Pb João Marcelo%' or name ilike 'Pb Joao Marcelo%' or name ilike 'João Marcelo Schulmeister%' or name ilike 'Joao Marcelo Schulmeister%';

update public.people
set family_group = 'GF 5',
    family_group_leader = 'Joao Marcelo / Tiago Gomes',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Tiago Gomes%';

update public.people
set family_group = 'GF 6',
    family_group_leader = 'Abigail / Marcelo Lins',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Abigail%';

update public.people
set family_group = 'GF 6',
    family_group_leader = 'Abigail / Marcelo Lins',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Marcelo Lins%' or name ilike 'Marcelo José Gonçalves Lins%' or name ilike 'Marcelo Jose Goncalves Lins%';

update public.people
set family_group = 'GF 7',
    family_group_leader = 'Nuria / Geslaine',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Nuria%' or name ilike 'Núria%';

update public.people
set family_group = 'GF 7',
    family_group_leader = 'Nuria / Geslaine',
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Co-Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Geslaine%';

update public.people
set family_group = 'GF 8',
    family_group_leader = 'Toni',
    ecclesiastical_roles = array(select distinct unnest(coalesce(ecclesiastical_roles, '{}') || array['Presbitero'])),
    department_roles = array(select distinct unnest(coalesce(department_roles, '{}') || array['Lider'])),
    departments = array(select distinct unnest(coalesce(departments, '{}') || array['Grupo Familiar']))
where name ilike 'Pb Toni%' or name ilike 'Antônio da Silva%' or name ilike 'Antonio da Silva%' or name ilike 'Toni%';
