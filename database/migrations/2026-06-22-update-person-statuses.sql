alter type person_status add value if not exists 'frequentador';
alter type person_status add value if not exists 'transferido';

update public.people
set status = 'membro'
where status::text = 'lider';
