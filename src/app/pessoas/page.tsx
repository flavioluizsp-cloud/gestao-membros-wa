"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Pencil, Save, X } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { administrativeRoleOptions, departmentOptions, departmentRoleOptions, ecclesiasticalRoleOptions, familyGroupOptions, personStatusLabels } from "@/lib/labels";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/date";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { filterPeopleByAccess, getAccessContext } from "@/lib/access";
import type { AccessContext, Person, PersonStatus } from "@/lib/types";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  birth_date: "",
  status: "visitante" as PersonStatus,
  administrative_roles: [] as string[],
  ecclesiastical_roles: [] as string[],
  department_roles: [] as string[],
  departments: [] as string[],
  family_group: "",
  family_group_leader: "",
  assigned_leader: "",
  is_baptized: false,
  baptism_date: "",
  baptism_church: "",
  notes: "",
  last_contact_at: ""
};

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function CheckboxGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
          <input type="checkbox" checked={values.includes(option)} onChange={() => onChange(toggleValue(values, option))} />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function getFamilyGroupLeader(group: string) {
  const selected = familyGroupOptions.find((option) => option.value === group);
  if (!selected?.leader) return "";
  return selected.coLeader ? `${selected.leader} / ${selected.coLeader}` : selected.leader;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [access, setAccess] = useState<AccessContext | null>(null);
  const messageTimeout = useRef<number | null>(null);

  async function loadPeople() {
    if (!supabase) return;
    const accessContext = await getAccessContext();
    const { data } = await supabase.from("people").select("*").order("created_at", { ascending: false });
    setAccess(accessContext);
    setPeople(filterPeopleByAccess((data ?? []) as Person[], accessContext));
  }

  useEffect(() => {
    loadPeople();
  }, []);

  async function savePerson(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessageType("error");
      setMessage("Configure as variaveis do Supabase primeiro.");
      showTemporaryMessage("Configure as variaveis do Supabase primeiro.", "error");
      return;
    }
    setLoading(true);
    setMessage("");
    const payload = {
      ...form,
      email: form.email || null,
      birth_date: form.birth_date || null,
      last_contact_at: form.last_contact_at || null,
      roles: [...form.administrative_roles, ...form.ecclesiastical_roles, ...form.department_roles, ...form.departments],
      administrative_roles: form.administrative_roles,
      ecclesiastical_roles: form.ecclesiastical_roles,
      department_roles: form.department_roles,
      departments: form.departments,
      family_group: form.family_group || null,
      family_group_leader: getFamilyGroupLeader(form.family_group) || form.family_group_leader || null,
      assigned_leader: form.assigned_leader || null,
      is_baptized: form.is_baptized,
      baptism_date: form.baptism_date || null,
      baptism_church: form.baptism_church || null,
      notes: form.notes || null
    };
    let error;
    if (editingId) {
      const result = await supabase.from("people").update(payload).eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase.from("people").insert(payload);
      error = result.error;
    }
    if (error) {
      showTemporaryMessage(error.message, "error");
      setLoading(false);
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    setLoading(false);
    showTemporaryMessage(editingId ? "Pessoa atualizada com sucesso." : "Pessoa cadastrada com sucesso.", "success");
    loadPeople();
  }

  function showTemporaryMessage(text: string, type: "success" | "error") {
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    setMessageType(type);
    setMessage(text);
    messageTimeout.current = window.setTimeout(() => setMessage(""), 4000);
  }

  function startEditing(person: Person) {
    setEditingId(person.id);
    setForm({
      name: person.name,
      phone: person.phone,
      email: person.email ?? "",
      birth_date: person.birth_date ?? "",
      status: person.status,
      administrative_roles: person.administrative_roles ?? [],
      ecclesiastical_roles: person.ecclesiastical_roles ?? [],
      department_roles: person.department_roles ?? [],
      departments: person.departments ?? [],
      family_group: person.family_group ?? "",
      family_group_leader: person.family_group_leader ?? "",
      assigned_leader: person.assigned_leader ?? "",
      is_baptized: Boolean(person.is_baptized),
      baptism_date: person.baptism_date ?? "",
      baptism_church: person.baptism_church ?? "",
      notes: person.notes ?? "",
      last_contact_at: person.last_contact_at ? person.last_contact_at.slice(0, 10) : ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function removePerson(id: string) {
    if (!supabase || !access?.isAdminLike) return;
    const person = people.find((item) => item.id === id);
    const confirmed = window.confirm(`Tem certeza que deseja excluir ${person?.name ?? "esta pessoa"}?`);
    if (!confirmed) return;
    await supabase.from("people").delete().eq("id", id);
    loadPeople();
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredPeople = normalizedSearch
    ? people.filter((person) => {
        const haystack = [
          person.name,
          person.phone,
          person.email,
          person.family_group,
          person.family_group_leader,
          person.assigned_leader,
          person.baptism_church,
          person.is_baptized ? "batizada batizado batismo" : "nao batizada nao batizado",
          person.notes,
          ...(person.roles ?? []),
          ...(person.administrative_roles ?? []),
          ...(person.ecclesiastical_roles ?? []),
          ...(person.department_roles ?? []),
          ...(person.departments ?? [])
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : people;

  return (
    <PageShell>
      <PageHeader title="Pessoas" description="Cadastro central de membros, visitantes, lideres, afastados e novos convertidos." />
      {message ? (
        <div className={`fixed left-1/2 top-6 z-[9999] w-[min(92vw,560px)] -translate-x-1/2 rounded-md px-5 py-4 text-center text-base font-bold shadow-2xl ring-2 ring-white ${messageType === "success" ? "bg-emerald-700 text-white" : "bg-red-600 text-white"}`}>
          {message}
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <form onSubmit={savePerson} className="space-y-3">
            {editingId ? (
              <div className="flex items-center justify-between rounded-md bg-sage px-3 py-2">
                <span className="text-sm font-semibold text-moss">Editando pessoa</span>
                <button type="button" onClick={cancelEditing} className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  <X className="h-4 w-4" />Cancelar
                </button>
              </div>
            ) : null}
            <Field label="Nome"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Telefone"><input required className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="E-mail opcional"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Data de nascimento"><input className={inputClass} type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PersonStatus })}>
                {Object.entries(personStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <div className="rounded-md border border-line p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input type="checkbox" checked={form.is_baptized} onChange={(e) => setForm({ ...form, is_baptized: e.target.checked })} />
                Pessoa batizada
              </label>
              <div className="mt-3 grid gap-3">
                <Field label="Data do batismo"><input className={inputClass} type="date" value={form.baptism_date} onChange={(e) => setForm({ ...form, baptism_date: e.target.value })} /></Field>
                <Field label="Igreja do batismo"><input className={inputClass} placeholder="Nome da igreja" value={form.baptism_church} onChange={(e) => setForm({ ...form, baptism_church: e.target.value })} /></Field>
              </div>
            </div>
            <Field label="Cargos administrativos">
              <CheckboxGroup options={administrativeRoleOptions} values={form.administrative_roles} onChange={(values) => setForm({ ...form, administrative_roles: values })} />
            </Field>
            <Field label="Cargos eclesiasticos">
              <CheckboxGroup options={ecclesiasticalRoleOptions} values={form.ecclesiastical_roles} onChange={(values) => setForm({ ...form, ecclesiastical_roles: values })} />
            </Field>
            <Field label="Cargo no departamento">
              <CheckboxGroup options={departmentRoleOptions} values={form.department_roles} onChange={(values) => setForm({ ...form, department_roles: values })} />
            </Field>
            <Field label="Departamentos">
              <CheckboxGroup options={departmentOptions} values={form.departments} onChange={(values) => setForm({ ...form, departments: values })} />
            </Field>
            <Field label="Grupo Familiar">
              <select
                className={inputClass}
                value={form.family_group}
                onChange={(e) => {
                  const leader = getFamilyGroupLeader(e.target.value);
                  setForm({ ...form, family_group: e.target.value, family_group_leader: leader });
                }}
              >
                {familyGroupOptions.map((option) => {
                  const leader = getFamilyGroupLeader(option.value);
                  return <option key={option.label} value={option.value}>{leader ? `${option.label} - ${leader}` : option.label}</option>;
                })}
              </select>
            </Field>
            <Field label="Lider do Grupo Familiar">
              <input className={inputClass} value={getFamilyGroupLeader(form.family_group) || form.family_group_leader || "Sem lider definido"} readOnly />
            </Field>
            <Field label="Atribuicao">
              <select className={inputClass} value={form.assigned_leader} onChange={(e) => setForm({ ...form, assigned_leader: e.target.value })}>
                <option value="">Sem atribuicao</option>
                {people.map((person) => <option key={person.id} value={person.name}>{person.name}</option>)}
              </select>
            </Field>
            <Field label="Ultimo contato"><input className={inputClass} type="date" value={form.last_contact_at} onChange={(e) => setForm({ ...form, last_contact_at: e.target.value })} /></Field>
            <Field label="Observacoes"><textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            {(access?.isAdminLike || access?.isLeader || access?.isMember) ? (
              <Button disabled={loading} className="w-full gap-2"><Save className="h-4 w-4" />{editingId ? "Salvar alteracoes" : "Salvar pessoa"}</Button>
            ) : null}
          </form>
        </Card>
        <div className="space-y-3">
          <Card>
            <Field label="Pesquisar pessoa">
              <input
                className={inputClass}
                placeholder="Digite nome, telefone, cargo ou grupo"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Field>
            <p className="mt-2 text-sm text-ink/60">
              {filteredPeople.length} de {people.length} pessoas encontradas
            </p>
          </Card>
          {filteredPeople.map((person) => (
            <Card key={person.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{person.name}</h3>
                    <Badge>{personStatusLabels[person.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">{person.phone} · nasc. {formatDate(person.birth_date)}</p>
                  {(person.family_group || person.family_group_leader) ? (
                    <p className="mt-1 text-sm text-ink/65">Grupo Familiar: {person.family_group ?? "-"} · Lider: {person.family_group_leader ?? "-"}</p>
                  ) : null}
                  {person.assigned_leader ? <p className="mt-1 text-sm text-ink/65">Atribuicao: {person.assigned_leader}</p> : null}
                  <p className="mt-1 text-sm text-ink/65">
                    Batismo: {person.is_baptized ? "Sim" : "Nao"}
                    {person.baptism_date ? ` · ${formatDate(person.baptism_date)}` : ""}
                    {person.baptism_church ? ` · ${person.baptism_church}` : ""}
                  </p>
                  {[...(person.administrative_roles ?? []), ...(person.ecclesiastical_roles ?? []), ...(person.department_roles ?? []), ...(person.departments ?? [])].length ? (
                    <p className="mt-1 text-sm text-moss">
                      {[...(person.administrative_roles ?? []), ...(person.ecclesiastical_roles ?? []), ...(person.department_roles ?? []), ...(person.departments ?? [])].join(" · ")}
                    </p>
                  ) : person.roles?.length ? <p className="mt-1 text-sm text-moss">{person.roles.join(" · ")}</p> : null}
                  {person.notes ? <p className="mt-2 text-sm">{person.notes}</p> : null}
                </div>
                <div className="flex gap-2">
                  <a className="inline-flex rounded-md border border-line p-2 text-moss hover:bg-sage" href={buildWhatsAppUrl(person.phone, `Ola ${person.name}, paz!`)} target="_blank"><MessageCircle className="h-4 w-4" /></a>
                  <button className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm" onClick={() => startEditing(person)}><Pencil className="h-4 w-4" />Editar</button>
                  {access?.isAdminLike ? <button className="rounded-md border border-line px-3 py-2 text-sm" onClick={() => removePerson(person.id)}>Excluir</button> : null}
                </div>
              </div>
            </Card>
          ))}
          {people.length === 0 ? <EmptyState title="Nenhuma pessoa cadastrada" text="Comece pelo formulario ao lado." /> : null}
          {people.length > 0 && filteredPeople.length === 0 ? <EmptyState title="Nenhum resultado" text="Tente buscar por outro nome, telefone, cargo ou grupo." /> : null}
        </div>
      </div>
    </PageShell>
  );
}
