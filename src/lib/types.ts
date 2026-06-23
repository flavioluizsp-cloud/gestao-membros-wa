export type PersonStatus = "visitante" | "frequentador" | "novo_convertido" | "membro" | "afastado" | "transferido";
export type VisitorOrigin = "culto" | "celula" | "indicacao" | "evento" | "online";
export type VisitorStatus = "novo" | "em_acompanhamento" | "integrado" | "sem_retorno";
export type TaskType = "ligar" | "visitar" | "orar" | "convidar" | "discipular";
export type TaskStatus = "pendente" | "concluido";
export type TemplateKey = "boas_vindas" | "aniversario" | "convite_culto" | "acompanhamento" | "afastados";
export type UserRole = "admin" | "pastor" | "lider" | "membro";
export type ScopeType = "grupo_familiar" | "departamento";
export type MaritalStatus = "solteiro" | "casado" | "uniao_estavel" | "juntos_sem_casar" | "";

export type FamilyMember = {
  name: string;
  relationship: string;
  birth_date: string;
};

export type Person = {
  id: string;
  name: string;
  preferred_name: string | null;
  phone: string;
  email: string | null;
  birth_date: string | null;
  hide_birth_year: boolean;
  birth_city: string | null;
  marital_status: MaritalStatus | null;
  family_members: FamilyMember[] | null;
  status: PersonStatus;
  notes: string | null;
  last_contact_at: string | null;
  family_group: string | null;
  family_group_leader: string | null;
  assigned_leader: string | null;
  is_baptized: boolean;
  baptism_date: string | null;
  baptism_church: string | null;
  baptizing_pastor: string | null;
  roles: string[] | null;
  administrative_roles: string[] | null;
  ecclesiastical_roles: string[] | null;
  department_roles: string[] | null;
  departments: string[] | null;
  desired_departments: string[] | null;
  visitor_origin: VisitorOrigin | null;
  visitor_status: VisitorStatus | null;
  pending_approval: boolean | null;
  privacy_consent: boolean | null;
  privacy_consent_at: string | null;
  privacy_consent_version: string | null;
  created_at: string;
};

export type PastoralTask = {
  id: string;
  person_id: string | null;
  title: string;
  type: TaskType;
  responsible: string | null;
  due_date: string | null;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  people?: Pick<Person, "name" | "phone"> | null;
};

export type Interaction = {
  id: string;
  person_id: string;
  type: string;
  notes: string;
  created_at: string;
  people?: Pick<Person, "name"> | null;
};

export type MessageTemplate = {
  id: string;
  key: TemplateKey;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type ChurchEvent = {
  id: string;
  name: string;
  event_date: string;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export type Attendance = {
  id: string;
  event_id: string;
  person_id: string;
  present: boolean;
  created_at: string;
  people?: Pick<Person, "name" | "status"> | null;
  events?: Pick<ChurchEvent, "name" | "event_date"> | null;
};

export type UserProfile = {
  id: string;
  auth_user_id: string;
  person_id: string | null;
  role: UserRole;
  is_global_leader: boolean;
  privacy_consent: boolean | null;
  privacy_consent_at: string | null;
  privacy_consent_version: string | null;
  data_responsibility_consent: boolean | null;
  data_responsibility_consent_at: string | null;
  data_responsibility_version: string | null;
  created_at: string;
  people?: Pick<Person, "id" | "name" | "phone"> | null;
};

export type UserScope = {
  id: string;
  user_profile_id: string;
  scope_type: ScopeType;
  scope_value: string;
  created_at: string;
};

export type AccessContext = {
  profile: UserProfile | null;
  scopes: UserScope[];
  person: Person | null;
  isAdminLike: boolean;
  isLeader: boolean;
  isMember: boolean;
};
