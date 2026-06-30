-- Read-only audit for the active Supabase project.
-- This script does not create, update, or delete database objects.

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'membros'
  and c.relkind = 'r'
order by c.relname;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'membros'
order by tablename, policyname;

select
  grantee,
  table_name,
  string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'membros'
  and grantee in ('anon', 'authenticated')
group by grantee, table_name
order by table_name, grantee;

select
  role::text,
  is_global_leader,
  count(*) as profiles
from membros.user_profiles
group by role, is_global_leader
order by role, is_global_leader;

select
  count(*) filter (where person_id is null) as profiles_without_person,
  count(*) filter (where auth_user_id is null) as profiles_without_auth_user,
  count(*) as total_profiles
from membros.user_profiles;

select
  count(*) as privileged_profiles
from membros.user_profiles
where role::text in ('admin', 'pastor')
   or is_global_leader is true;

