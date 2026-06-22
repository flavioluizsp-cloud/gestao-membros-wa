update public.people
set family_group_leader = case family_group
  when 'GF 1' then 'Elias / Ivonete'
  when 'GF 2' then 'Daniel / Ana Santin'
  when 'GF 3' then 'Kelvin / Cleoni'
  when 'GF 4' then 'Diego / Jennifer'
  when 'GF 5' then 'Joao Marcelo / Tiago Gomes'
  when 'GF 6' then 'Abigail / Marcelo Lins'
  when 'GF 7' then 'Nuria / Geslaine'
  when 'GF 8' then 'Toni'
  else family_group_leader
end
where family_group in ('GF 1', 'GF 2', 'GF 3', 'GF 4', 'GF 5', 'GF 6', 'GF 7', 'GF 8');
