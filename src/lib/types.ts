export type PersonStatus = "visitante" | "frequentador" | "novo_convertido" | "membro" | "afastado" | "transferido";
export type VisitorOrigin = "culto" | "celula" | "indicacao" | "evento" | "online";
export type VisitorStatus = "novo" | "em_acompanhamento" | "integrado" | "sem_retorno";
export type TaskType = "ligar" | "visitar" | "orar" | "convidar" | "discipular";
export type TaskStatus = "pendente" | "concluido";
export type TemplateKey = "boas_vindas" | "aniversario" | "convite_culto" | "acompanhamento" | "afastados";
export type UserRole = "admin" | "pastor" | "lider";

export type Person = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birth_date: string | null;
  status: PersonStatus;
  notes: string | null;
  last_contact_at: string | null;
  family_group: string | null;
  family_group_leader: string | null;
  assigned_leader: string | null;
  is_baptized: boolean;
  baptism_date: string | null;
  baptism_church: string | null;
  roles: string[] | null;
  administrative_roles: string[] | null;
  ecclesiastical_roles: string[] | null;
  department_roles: string[] | null;
  departments: string[] | null;
  visitor_origin: VisitorOrigin | null;
  visitor_status: VisitorStatus | null;
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
