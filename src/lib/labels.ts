import type { PersonStatus, TaskStatus, TaskType, TemplateKey, VisitorOrigin, VisitorStatus } from "./types";

export const personStatusLabels: Record<PersonStatus, string> = {
  visitante: "Visitante",
  frequentador: "Frequentador",
  membro: "Membro",
  novo_convertido: "Novo convertido",
  afastado: "Afastado",
  transferido: "Transferido"
};

export const visitorOriginLabels: Record<VisitorOrigin, string> = {
  culto: "Culto",
  celula: "Celula",
  indicacao: "Indicacao",
  evento: "Evento",
  online: "Online"
};

export const visitorStatusLabels: Record<VisitorStatus, string> = {
  novo: "Novo",
  em_acompanhamento: "Em acompanhamento",
  integrado: "Integrado",
  sem_retorno: "Sem retorno"
};

export const taskTypeLabels: Record<TaskType, string> = {
  ligar: "Ligar",
  visitar: "Visitar",
  orar: "Orar",
  convidar: "Convidar",
  discipular: "Discipular"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  pendente: "Pendente",
  concluido: "Concluido"
};

export const templateLabels: Record<TemplateKey, string> = {
  boas_vindas: "Boas-vindas",
  aniversario: "Aniversario",
  convite_culto: "Convite para culto",
  acompanhamento: "Acompanhamento",
  afastados: "Afastados"
};

export const administrativeRoleOptions = ["Presidente", "Vice-Presidente", "Tesoureiro", "Secretario"];

export const ecclesiasticalRoleOptions = ["Pastor", "Presbitero", "Diacono"];

export const departmentRoleOptions = ["Lider", "Co-Lider"];

export const departmentOptions = [
  "Pastoral",
  "Louvor",
  "Escola Biblica",
  "Acao Social",
  "Intercessao",
  "Teatro",
  "Jovens",
  "Mulheres",
  "Casais",
  "Homens",
  "Infantil",
  "Introdutores",
  "Comunicacao"
];

export const familyGroupOptions = [
  { value: "", label: "Sem grupo", leader: "", coLeader: "" },
  { value: "GF 1", label: "GF 1", leader: "Elias", coLeader: "Ivonete" },
  { value: "GF 2", label: "GF 2", leader: "Daniel", coLeader: "Ana Santin" },
  { value: "GF 3", label: "GF 3", leader: "Kelvin", coLeader: "Cleoni" },
  { value: "GF 4", label: "GF 4", leader: "Diego", coLeader: "Jennifer" },
  { value: "GF 5", label: "GF 5", leader: "Joao Marcelo", coLeader: "Tiago Gomes" },
  { value: "GF 6", label: "GF 6", leader: "Abigail", coLeader: "Marcelo Lins" },
  { value: "GF 7", label: "GF 7", leader: "Nuria", coLeader: "Geslaine" },
  { value: "GF 8", label: "GF 8", leader: "Toni", coLeader: "" }
];

export const assignmentLeaderOptions = Array.from(
  new Set(
    familyGroupOptions
      .flatMap((group) => [group.leader, group.coLeader])
      .filter(Boolean)
  )
);
