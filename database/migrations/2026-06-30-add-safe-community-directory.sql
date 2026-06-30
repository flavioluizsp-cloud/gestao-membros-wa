begin;

-- Limited directory for a department, family group, or direct pastoral assignment.
-- Sensitive fields (email, status for members, notes, roles, baptism, consent) are omitted.
create or replace function membros.segment_directory(p_type text, p_name text)
returns table (
  id uuid,
  name text,
  preferred_name text,
  phone text,
  birth_date date,
  birth_day integer,
  birth_month integer,
  hide_birth_year boolean,
  departments text[],
  family_group text,
  assigned_leader text,
  status text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_person membros.people%rowtype;
  allowed boolean := false;
  staff boolean := membros.is_admin_like() or membros.is_leader();
begin
  select * into caller_person
  from membros.people
  where membros.people.id = membros.current_person_id();

  if membros.is_admin_like() then
    allowed := true;
  elsif p_type = 'departamento' then
    allowed := coalesce(caller_person.departments, '{}'::text[]) @> array[p_name]
      or exists (
        select 1 from membros.user_scopes scope
        where scope.user_profile_id = membros.current_profile_id()
          and scope.scope_type::text = 'departamento'
          and scope.scope_value = p_name
      );
  elsif p_type = 'grupo-familiar' then
    allowed := caller_person.family_group = p_name
      or exists (
        select 1 from membros.user_scopes scope
        where scope.user_profile_id = membros.current_profile_id()
          and scope.scope_type::text = 'grupo_familiar'
          and scope.scope_value = p_name
      );
  elsif p_type = 'atribuicao' and membros.is_leader() then
    allowed := p_name in (caller_person.name, caller_person.preferred_name);
  end if;

  if not coalesce(allowed, false) then
    return;
  end if;

  return query
  select
    person.id,
    person.name,
    person.preferred_name,
    person.phone,
    person.birth_date,
    person.birth_day::integer,
    person.birth_month::integer,
    person.hide_birth_year,
    person.departments,
    person.family_group,
    case when staff then person.assigned_leader else null end,
    case when staff then person.status::text else null end
  from membros.people person
  where coalesce(person.pending_approval, false) is false
    and (
      (p_type = 'departamento' and coalesce(person.departments, '{}'::text[]) @> array[p_name])
      or (p_type = 'grupo-familiar' and person.family_group = p_name)
      or (p_type = 'atribuicao' and person.assigned_leader = p_name)
    )
  order by person.name;
end
$$;

-- Global birthday radar with only the fields required for congratulations.
create or replace function membros.birthday_directory()
returns table (
  id uuid,
  name text,
  preferred_name text,
  phone text,
  birth_date date,
  birth_day integer,
  birth_month integer,
  hide_birth_year boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    person.id,
    person.name,
    person.preferred_name,
    person.phone,
    person.birth_date,
    person.birth_day::integer,
    person.birth_month::integer,
    person.hide_birth_year
  from membros.people person
  where auth.uid() is not null
    and coalesce(person.pending_approval, false) is false
    and (person.birth_date is not null or (person.birth_day is not null and person.birth_month is not null))
  order by person.name
$$;

-- Assigned pastoral contact and global pastor, without exposing their full profiles.
create or replace function membros.pastoral_contacts()
returns table (
  id uuid,
  name text,
  preferred_name text,
  phone text,
  contact_type text
)
language sql
stable
security definer
set search_path = ''
as $$
  with caller as (
    select person.*
    from membros.people person
    where person.id = membros.current_person_id()
  ), contacts as (
    select person.id, person.name, person.preferred_name, person.phone, 'assigned_leader'::text as contact_type, 1 as priority
    from membros.people person, caller
    where caller.assigned_leader is not null
      and (
        lower(person.name) = lower(caller.assigned_leader)
        or lower(coalesce(person.preferred_name, '')) = lower(caller.assigned_leader)
      )
    union all
    select person.id, person.name, person.preferred_name, person.phone, 'lead_pastor'::text, 2
    from membros.people person
    where coalesce(person.ecclesiastical_roles, '{}'::text[]) @> array['Pastor']
       or lower(person.name) like '%flavio%'
  )
  select distinct on (contacts.id, contacts.contact_type)
    contacts.id, contacts.name, contacts.preferred_name, contacts.phone, contacts.contact_type
  from contacts
  where auth.uid() is not null
  order by contacts.id, contacts.contact_type, contacts.priority
$$;

revoke all on function membros.segment_directory(text, text) from public;
revoke all on function membros.birthday_directory() from public;
revoke all on function membros.pastoral_contacts() from public;
grant execute on function membros.segment_directory(text, text) to authenticated;
grant execute on function membros.birthday_directory() to authenticated;
grant execute on function membros.pastoral_contacts() to authenticated;

commit;
