begin;

-- Refuse to continue if the migration would lock every administrator out.
do $$
begin
  if not exists (
    select 1
    from membros.user_profiles
    where role::text in ('admin', 'pastor')
       or is_global_leader is true
  ) then
    raise exception 'RLS migration cancelled: no admin, pastor, or global leader profile exists.';
  end if;
end
$$;

-- Security-definer helpers avoid recursive RLS lookups. They expose only booleans/ids.
create or replace function membros.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from membros.user_profiles
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function membros.current_person_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select person_id
  from membros.user_profiles
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function membros.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role::text
  from membros.user_profiles
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function membros.is_admin_like()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(bool_or(role::text in ('admin', 'pastor') or is_global_leader), false)
  from membros.user_profiles
  where auth_user_id = auth.uid()
$$;

create or replace function membros.is_leader()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(bool_or(role::text = 'lider'), false)
  from membros.user_profiles
  where auth_user_id = auth.uid()
$$;

create or replace function membros.can_access_person(target_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    membros.is_admin_like()
    or target_person_id = membros.current_person_id()
    or (
      membros.is_leader()
      and exists (
        select 1
        from membros.people target
        where target.id = target_person_id
          and (
            exists (
              select 1
              from membros.user_scopes scope
              where scope.user_profile_id = membros.current_profile_id()
                and (
                  (scope.scope_type::text = 'grupo_familiar' and target.family_group = scope.scope_value)
                  or
                  (scope.scope_type::text = 'departamento' and coalesce(target.departments, '{}'::text[]) @> array[scope.scope_value])
                )
            )
            or exists (
              select 1
              from membros.people leader_person
              where leader_person.id = membros.current_person_id()
                and target.assigned_leader in (leader_person.name, leader_person.preferred_name)
            )
          )
      )
    )
$$;

create or replace function membros.can_claim_pending_person(target_person_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from membros.people person
    where person.id = target_person_id
      and person.pending_approval is true
      and person.email is not null
      and lower(person.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

revoke all on function membros.current_profile_id() from public;
revoke all on function membros.current_person_id() from public;
revoke all on function membros.current_app_role() from public;
revoke all on function membros.is_admin_like() from public;
revoke all on function membros.is_leader() from public;
revoke all on function membros.can_access_person(uuid) from public;
revoke all on function membros.can_claim_pending_person(uuid) from public;
grant execute on function membros.current_profile_id() to authenticated;
grant execute on function membros.current_person_id() to authenticated;
grant execute on function membros.current_app_role() to authenticated;
grant execute on function membros.is_admin_like() to authenticated;
grant execute on function membros.is_leader() to authenticated;
grant execute on function membros.can_access_person(uuid) to authenticated;
grant execute on function membros.can_claim_pending_person(uuid) to authenticated;

-- Remove every previous policy from the protected tables, including legacy names.
do $$
declare
  table_name text;
  policy_record record;
begin
  foreach table_name in array array[
    'users', 'people', 'pastoral_tasks', 'interactions', 'message_templates',
    'events', 'attendance', 'user_profiles', 'user_scopes',
    'department_settings', 'department_assignments', 'family_group_assignments'
  ]
  loop
    if to_regclass(format('membros.%I', table_name)) is not null then
      execute format('alter table membros.%I enable row level security', table_name);
      for policy_record in
        select policyname
        from pg_policies
        where schemaname = 'membros' and tablename = table_name
      loop
        execute format('drop policy if exists %I on membros.%I', policy_record.policyname, table_name);
      end loop;
    end if;
  end loop;
end
$$;

-- People: public submissions remain possible, but only as consented pending visitors.
create policy people_public_submit
on membros.people
for insert
to anon, authenticated
with check (
  pending_approval is true
  and privacy_consent is true
  and status::text = 'visitante'
  and assigned_leader is null
  and coalesce(cardinality(roles), 0) = 0
  and coalesce(cardinality(administrative_roles), 0) = 0
  and coalesce(cardinality(ecclesiastical_roles), 0) = 0
  and coalesce(cardinality(department_roles), 0) = 0
);

create policy people_select_by_access
on membros.people
for select
to authenticated
using (
  membros.can_access_person(id)
  or membros.can_claim_pending_person(id)
);

create policy people_staff_insert
on membros.people
for insert
to authenticated
with check (membros.is_admin_like() or membros.is_leader());

create policy people_update_by_access
on membros.people
for update
to authenticated
using (membros.can_access_person(id))
with check (membros.can_access_person(id));

create policy people_admin_delete
on membros.people
for delete
to authenticated
using (membros.is_admin_like());

-- A member may update personal/church self-service fields, but never pastoral controls.
create or replace function membros.protect_people_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if membros.is_admin_like() or membros.is_leader() then
    return new;
  end if;

  if old.id <> membros.current_person_id() then
    raise exception 'You may update only your own profile.';
  end if;

  if new.status is distinct from old.status
    or new.pending_approval is distinct from old.pending_approval
    or new.assigned_leader is distinct from old.assigned_leader
    or new.roles is distinct from old.roles
    or new.administrative_roles is distinct from old.administrative_roles
    or new.ecclesiastical_roles is distinct from old.ecclesiastical_roles
    or new.department_roles is distinct from old.department_roles
    or new.visitor_status is distinct from old.visitor_status
  then
    raise exception 'This update contains fields restricted to church leadership.';
  end if;

  return new;
end
$$;

drop trigger if exists people_protect_restricted_fields on membros.people;
create trigger people_protect_restricted_fields
before update on membros.people
for each row execute function membros.protect_people_fields();

-- User profiles: users see/update consent on themselves; only admins manage privileges.
create policy profiles_select_own_or_admin
on membros.user_profiles
for select
to authenticated
using (auth_user_id = auth.uid() or membros.is_admin_like());

create policy profiles_insert_own_member
on membros.user_profiles
for insert
to authenticated
with check (
  auth_user_id = auth.uid()
  and role::text = 'membro'
  and is_global_leader is false
  and membros.can_claim_pending_person(person_id)
);

create policy profiles_admin_insert
on membros.user_profiles
for insert
to authenticated
with check (membros.is_admin_like());

create policy profiles_update_own_or_admin
on membros.user_profiles
for update
to authenticated
using (auth_user_id = auth.uid() or membros.is_admin_like())
with check (auth_user_id = auth.uid() or membros.is_admin_like());

create policy profiles_admin_delete
on membros.user_profiles
for delete
to authenticated
using (membros.is_admin_like());

create or replace function membros.protect_user_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if membros.is_admin_like() then
    return new;
  end if;

  if old.auth_user_id <> auth.uid()
    or new.auth_user_id is distinct from old.auth_user_id
    or new.person_id is distinct from old.person_id
    or new.role is distinct from old.role
    or new.is_global_leader is distinct from old.is_global_leader
  then
    raise exception 'Only an administrator may change account permissions.';
  end if;

  return new;
end
$$;

drop trigger if exists user_profiles_protect_privileges on membros.user_profiles;
create trigger user_profiles_protect_privileges
before update on membros.user_profiles
for each row execute function membros.protect_user_profile_fields();

-- Scopes and leadership assignments are administrative data.
create policy scopes_select_own_or_admin
on membros.user_scopes
for select
to authenticated
using (user_profile_id = membros.current_profile_id() or membros.is_admin_like());
create policy scopes_admin_insert on membros.user_scopes for insert to authenticated with check (membros.is_admin_like());
create policy scopes_admin_update on membros.user_scopes for update to authenticated using (membros.is_admin_like()) with check (membros.is_admin_like());
create policy scopes_admin_delete on membros.user_scopes for delete to authenticated using (membros.is_admin_like());

create policy department_settings_read on membros.department_settings for select to authenticated using (true);
create policy department_settings_admin_insert on membros.department_settings for insert to authenticated with check (membros.is_admin_like());
create policy department_settings_admin_update on membros.department_settings for update to authenticated using (membros.is_admin_like()) with check (membros.is_admin_like());
create policy department_settings_admin_delete on membros.department_settings for delete to authenticated using (membros.is_admin_like());

create policy department_assignments_read on membros.department_assignments for select to authenticated using (true);
create policy department_assignments_admin_insert on membros.department_assignments for insert to authenticated with check (membros.is_admin_like());
create policy department_assignments_admin_update on membros.department_assignments for update to authenticated using (membros.is_admin_like()) with check (membros.is_admin_like());
create policy department_assignments_admin_delete on membros.department_assignments for delete to authenticated using (membros.is_admin_like());

create policy family_group_assignments_read on membros.family_group_assignments for select to authenticated using (true);
create policy family_group_assignments_admin_insert on membros.family_group_assignments for insert to authenticated with check (membros.is_admin_like());
create policy family_group_assignments_admin_update on membros.family_group_assignments for update to authenticated using (membros.is_admin_like()) with check (membros.is_admin_like());
create policy family_group_assignments_admin_delete on membros.family_group_assignments for delete to authenticated using (membros.is_admin_like());

-- Pastoral data follows the related person's access scope.
create policy tasks_staff_select
on membros.pastoral_tasks for select to authenticated
using (membros.is_admin_like() or (membros.is_leader() and (person_id is null or membros.can_access_person(person_id))));
create policy tasks_staff_insert
on membros.pastoral_tasks for insert to authenticated
with check (membros.is_admin_like() or (membros.is_leader() and (person_id is null or membros.can_access_person(person_id))));
create policy tasks_staff_update
on membros.pastoral_tasks for update to authenticated
using (membros.is_admin_like() or (membros.is_leader() and (person_id is null or membros.can_access_person(person_id))))
with check (membros.is_admin_like() or (membros.is_leader() and (person_id is null or membros.can_access_person(person_id))));
create policy tasks_staff_delete
on membros.pastoral_tasks for delete to authenticated
using (membros.is_admin_like() or (membros.is_leader() and (person_id is null or membros.can_access_person(person_id))));

create policy interactions_staff_select
on membros.interactions for select to authenticated
using (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));
create policy interactions_staff_insert
on membros.interactions for insert to authenticated
with check (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));
create policy interactions_staff_update
on membros.interactions for update to authenticated
using (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)))
with check (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));
create policy interactions_staff_delete
on membros.interactions for delete to authenticated
using (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));

-- Shared operational tables.
create policy templates_authenticated_read on membros.message_templates for select to authenticated using (true);
create policy templates_staff_insert on membros.message_templates for insert to authenticated with check (membros.is_admin_like() or membros.is_leader());
create policy templates_staff_update on membros.message_templates for update to authenticated using (membros.is_admin_like() or membros.is_leader()) with check (membros.is_admin_like() or membros.is_leader());
create policy templates_admin_delete on membros.message_templates for delete to authenticated using (membros.is_admin_like());

create policy events_authenticated_read on membros.events for select to authenticated using (true);
create policy events_staff_insert on membros.events for insert to authenticated with check (membros.is_admin_like() or membros.is_leader());
create policy events_staff_update on membros.events for update to authenticated using (membros.is_admin_like() or membros.is_leader()) with check (membros.is_admin_like() or membros.is_leader());
create policy events_admin_delete on membros.events for delete to authenticated using (membros.is_admin_like());

create policy attendance_select_by_access
on membros.attendance for select to authenticated
using (membros.can_access_person(person_id));
create policy attendance_staff_insert
on membros.attendance for insert to authenticated
with check (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));
create policy attendance_staff_update
on membros.attendance for update to authenticated
using (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)))
with check (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));
create policy attendance_staff_delete
on membros.attendance for delete to authenticated
using (membros.is_admin_like() or (membros.is_leader() and membros.can_access_person(person_id)));

-- Legacy users table, if still present.
do $$
begin
  if to_regclass('membros.users') is not null then
    execute 'create policy users_select_own_or_admin on membros.users for select to authenticated using (id = auth.uid() or membros.is_admin_like())';
    execute 'create policy users_admin_insert on membros.users for insert to authenticated with check (membros.is_admin_like())';
    execute 'create policy users_admin_update on membros.users for update to authenticated using (membros.is_admin_like()) with check (membros.is_admin_like())';
    execute 'create policy users_admin_delete on membros.users for delete to authenticated using (membros.is_admin_like())';
  end if;
end
$$;

-- Keep grants narrow. RLS remains the final row-level authorization boundary.
revoke all on all tables in schema membros from anon;
grant usage on schema membros to anon, authenticated;
grant insert on membros.people to anon;
grant select, insert, update, delete on all tables in schema membros to authenticated;
grant usage, select on all sequences in schema membros to authenticated;

commit;
