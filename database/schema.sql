create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'pastor', 'lider');
create type person_status as enum ('visitante', 'frequentador', 'novo_convertido', 'membro', 'afastado', 'transferido');
create type visitor_origin as enum ('culto', 'celula', 'indicacao', 'evento', 'online');
create type visitor_status as enum ('novo', 'em_acompanhamento', 'integrado', 'sem_retorno');
create type task_type as enum ('ligar', 'visitar', 'orar', 'convidar', 'discipular');
create type task_status as enum ('pendente', 'concluido');
create type template_key as enum ('boas_vindas', 'aniversario', 'convite_culto', 'acompanhamento', 'afastados');
create type app_role as enum ('admin', 'pastor', 'lider', 'membro');
create type scope_type as enum ('grupo_familiar', 'departamento');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role user_role not null default 'lider',
  created_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  preferred_name text,
  phone text not null,
  email text,
  birth_date date,
  hide_birth_year boolean not null default false,
  birth_city text,
  status person_status not null default 'visitante',
  notes text,
  last_contact_at timestamptz,
  family_group text,
  family_group_leader text,
  assigned_leader text,
  is_baptized boolean not null default false,
  baptism_date date,
  baptism_church text,
  baptizing_pastor text,
  roles text[] not null default '{}',
  administrative_roles text[] not null default '{}',
  ecclesiastical_roles text[] not null default '{}',
  department_roles text[] not null default '{}',
  departments text[] not null default '{}',
  desired_departments text[] not null default '{}',
  visitor_origin visitor_origin,
  visitor_status visitor_status,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pastoral_tasks (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete set null,
  title text not null,
  type task_type not null,
  responsible text,
  due_date date,
  status task_status not null default 'pendente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  type text not null default 'manual',
  notes text not null,
  created_at timestamptz not null default now()
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  key template_key not null unique,
  name text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date timestamptz not null,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  present boolean not null default true,
  created_at timestamptz not null default now(),
  unique (event_id, person_id)
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  role app_role not null default 'membro',
  is_global_leader boolean not null default false,
  created_at timestamptz not null default now(),
  unique (auth_user_id)
);

create table public.user_scopes (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  scope_type scope_type not null,
  scope_value text not null,
  created_at timestamptz not null default now(),
  unique (user_profile_id, scope_type, scope_value)
);

insert into public.message_templates (key, name, body) values
('boas_vindas', 'Boas-vindas', 'Ola {{nome}}, paz! Foi uma alegria receber voce. Conte conosco e seja muito bem-vindo(a).'),
('aniversario', 'Aniversario', 'Ola {{nome}}, feliz aniversario! Que Deus abencoe sua vida com graca, saude e paz.'),
('convite_culto', 'Convite para culto', 'Ola {{nome}}, paz! Queremos te convidar para estar conosco no proximo culto. Sera uma alegria te receber.'),
('acompanhamento', 'Acompanhamento', 'Ola {{nome}}, paz! Estamos passando para saber como voce esta e como podemos orar por voce.'),
('afastados', 'Afastados', 'Ola {{nome}}, sentimos sua falta. Queremos caminhar com voce e te receber com carinho.');

alter table public.users enable row level security;
alter table public.people enable row level security;
alter table public.pastoral_tasks enable row level security;
alter table public.interactions enable row level security;
alter table public.message_templates enable row level security;
alter table public.events enable row level security;
alter table public.attendance enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_scopes enable row level security;

create policy "authenticated can read users" on public.users for select to authenticated using (true);
create policy "authenticated manage people" on public.people for all to authenticated using (true) with check (true);
create policy "authenticated manage tasks" on public.pastoral_tasks for all to authenticated using (true) with check (true);
create policy "authenticated manage interactions" on public.interactions for all to authenticated using (true) with check (true);
create policy "authenticated manage templates" on public.message_templates for all to authenticated using (true) with check (true);
create policy "authenticated manage events" on public.events for all to authenticated using (true) with check (true);
create policy "authenticated manage attendance" on public.attendance for all to authenticated using (true) with check (true);
create policy "authenticated manage profiles" on public.user_profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage scopes" on public.user_scopes for all to authenticated using (true) with check (true);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger people_touch_updated_at before update on public.people for each row execute function public.touch_updated_at();
create trigger pastoral_tasks_touch_updated_at before update on public.pastoral_tasks for each row execute function public.touch_updated_at();
create trigger message_templates_touch_updated_at before update on public.message_templates for each row execute function public.touch_updated_at();
