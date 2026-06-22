create schema if not exists membros;
create schema if not exists financeiro;

grant usage on schema membros to anon, authenticated, service_role;
grant usage on schema financeiro to authenticated, service_role;

do $$
begin
  if to_regclass('public.users') is not null then alter table public.users set schema membros; end if;
  if to_regclass('public.people') is not null then alter table public.people set schema membros; end if;
  if to_regclass('public.pastoral_tasks') is not null then alter table public.pastoral_tasks set schema membros; end if;
  if to_regclass('public.interactions') is not null then alter table public.interactions set schema membros; end if;
  if to_regclass('public.message_templates') is not null then alter table public.message_templates set schema membros; end if;
  if to_regclass('public.events') is not null then alter table public.events set schema membros; end if;
  if to_regclass('public.attendance') is not null then alter table public.attendance set schema membros; end if;
  if to_regclass('public.user_profiles') is not null then alter table public.user_profiles set schema membros; end if;
  if to_regclass('public.user_scopes') is not null then alter table public.user_scopes set schema membros; end if;
end $$;

do $$
begin
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'user_role') then alter type public.user_role set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'person_status') then alter type public.person_status set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'visitor_origin') then alter type public.visitor_origin set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'visitor_status') then alter type public.visitor_status set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'task_type') then alter type public.task_type set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'task_status') then alter type public.task_status set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'template_key') then alter type public.template_key set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'app_role') then alter type public.app_role set schema membros; end if;
  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typname = 'scope_type') then alter type public.scope_type set schema membros; end if;
end $$;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'touch_updated_at') then
    alter function public.touch_updated_at() set schema membros;
  end if;
end $$;

grant all on all tables in schema membros to authenticated;
grant all on all sequences in schema membros to authenticated;
grant all on all routines in schema membros to authenticated;

alter default privileges in schema membros grant all on tables to authenticated;
alter default privileges in schema membros grant all on sequences to authenticated;
alter default privileges in schema membros grant all on routines to authenticated;
