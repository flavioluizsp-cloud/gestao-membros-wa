"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { administrativeRoleOptions, departmentOptions, departmentRoleOptions, ecclesiasticalRoleOptions, familyGroupOptions, personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { AccessContext, Person, PersonStatus } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

const emptyForm = {
  name: "",
  preferred_name: "",
  phone: "",
  email: "",
  birth_date: "",
  hide_birth_year: false,
  birth_city: "",
  status: "visitante" as PersonStatus,
  is_baptized: false,
  baptism_date: "",
  baptism_church: "",
  baptizing_pastor: "",
  administrative_roles: [] as string[],
  ecclesiastical_roles: [] as string[],
  department_roles: [] as string[],
  departments: [] as string[],
  desired_departments: [] as string[],
  family_group: "",
  family_group_leader: "",
  assigned_leader: "",
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

export default function PersonProfilePage({ params }: PageProps) {
  const [id, setId] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const messageTimeout = useRef<number | null>(null);
  const isNew = id === "novo";
  const canManageRestricted = Boolean(access?.isAdminLike);

  useEffect(() => {
    params.then((value) => setId(value.id));
  }, [params]);

  useEffect(() => {
    async function load() {
      if (!supabase || !membrosDb || !id) return;
      const accessContext = await getAccessContext();
      setAccess(accessContext);
      const { data: peopleData } = await membrosDb.from("people").select("*").order("name");
      const allPeople = (peopleData ?? []) as Person[];
      setPeople(allPeople);
      if (id === "novo") return;
      const person = allPeople.find((item) => item.id === id);
      if (!person) return;
      setForm({
        name: person.name,
        preferred_name: person.preferred_name ?? "",
        phone: person.phone,
        email: person.email ?? "",
        birth_date: person.birth_date ?? "",
        hide_birth_year: Boolean(person.hide_birth_year),
        birth_city: person.birth_city ?? "",
        status: person.status,
        is_baptized: Boolean(person.is_baptized),
        baptism_date: person.baptism_date ?? "",
        baptism_church: person.baptism_church ?? "",
        baptizing_pastor: person.baptizing_pastor ?? "",
        administrative_roles: person.administrative_roles ?? [],
        ecclesiastical_roles: person.ecclesiastical_roles ?? [],
        department_roles: person.department_roles ?? [],
        departments: person.departments ?? [],
        desired_departments: person.desired_departments ?? [],
        family_group: person.family_group ?? "",
        family_group_leader: person.family_group_leader ?? "",
        assigned_leader: person.assigned_leader ?? "",
        notes: person.notes ?? "",
        last_contact_at: person.last_contact_at ? person.last_contact_at.slice(0, 10) : ""
      });
    }

    load();
  }, [id]);

  function showTemporaryMessage(text: string, type: "success" | "error") {
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    setMessageType(type);
    setMessage(text);
    messageTimeout.current = window.setTimeout(() => setMessage(""), 4000);
  }

  async function savePerson(event: React.FormEvent) {
    event.preventDefault();
    if (!membrosDb) return;
    const payload = {
      name: form.name,
      preferred_name: form.preferred_name || null,
      phone: form.phone,
      email: form.email || null,
      birth_date: form.birth_date || null,
      hide_birth_year: form.hide_birth_year,
      birth_city: form.birth_city || null,
      is_baptized: form.is_baptized,
      baptism_date: form.baptism_date || null,
      baptism_church: form.baptism_church || null,
      baptizing_pastor: form.baptizing_pastor || null,
      departments: form.departments,
      desired_departments: form.desired_departments,
      family_group: form.family_group || null,
      family_group_leader: getFamilyGroupLeader(form.family_group) || form.family_group_leader || null,
      notes: form.notes || null,
      last_contact_at: form.last_contact_at || null,
      ...(canManageRestricted ? {
        status: form.status,
        administrative_roles: form.administrative_roles,
        ecclesiastical_roles: form.ecclesiastical_roles,
        department_roles: form.department_roles,
        assigned_leader: form.assigned_leader || null,
        roles: [...form.administrative_roles, ...form.ecclesiastical_roles, ...form.department_roles, ...form.departments]
      } : {})
    };

    const result = isNew
      ? await membrosDb.from("people").insert(payload).select("id").single()
      : await membrosDb.from("people").update(payload).eq("id", id);

    if (result.error) {
      showTemporaryMessage(result.error.message, "error");
      return;
    }
    showTemporaryMessage(isNew ? "Pessoa cadastrada com sucesso." : "Perfil atualizado com sucesso.", "success");
    if (isNew && result.data?.id) window.location.href = `/pessoas/${result.data.id}`;
  }

  async function removePerson() {
    if (!membrosDb || !access?.isAdminLike || isNew || !window.confirm("Excluir esta pessoa?")) return;
    await membrosDb.from("people").delete().eq("id", id);
    window.location.href = "/pessoas";
  }

  return (
    <PageShell>
      <PageHeader
        title={isNew ? "Nova pessoa" : form.preferred_name || form.name || "Perfil"}
        description="Perfil organizado por dados pessoais e dados da igreja."
        action={<Link className="rounded-md border border-line px-3 py-2 text-sm font-semibold" href="/pessoas">Voltar para Pessoas</Link>}
      />
      {message ? (
        <div className={`fixed left-1/2 top-6 z-[9999] w-[min(92vw,560px)] -translate-x-1/2 rounded-md px-5 py-4 text-center text-base font-bold shadow-2xl ring-2 ring-white ${messageType === "success" ? "bg-emerald-700 text-white" : "bg-red-600 text-white"}`}>
          {message}
        </div>
      ) : null}
      <form onSubmit={savePerson} className="space-y-5">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">1. Dados pessoais</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome completo"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Como deseja ser chamado"><input className={inputClass} value={form.preferred_name} onChange={(e) => setForm({ ...form, preferred_name: e.target.value })} /></Field>
            <Field label="Numero WhatsApp"><input required className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="E-mail"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Data de nascimento"><input className={inputClass} type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></Field>
            <label className="mt-6 flex h-[42px] items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <input type="checkbox" checked={form.hide_birth_year} onChange={(e) => setForm({ ...form, hide_birth_year: e.target.checked })} />
              Ocultar somente o ano de nascimento
            </label>
            <Field label="Cidade natal"><input className={inputClass} value={form.birth_city} onChange={(e) => setForm({ ...form, birth_city: e.target.value })} /></Field>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">2. Dados da igreja</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pessoa batizada">
              <select className={inputClass} value={form.is_baptized ? "sim" : "nao"} onChange={(e) => setForm({ ...form, is_baptized: e.target.value === "sim" })}>
                <option value="nao">Nao</option>
                <option value="sim">Sim</option>
              </select>
            </Field>
            <Field label="Data do batismo"><input className={inputClass} type="date" value={form.baptism_date} onChange={(e) => setForm({ ...form, baptism_date: e.target.value })} /></Field>
            <Field label="Igreja do batismo"><input className={inputClass} value={form.baptism_church} onChange={(e) => setForm({ ...form, baptism_church: e.target.value })} /></Field>
            <Field label="Pastor que batizou"><input className={inputClass} value={form.baptizing_pastor} onChange={(e) => setForm({ ...form, baptizing_pastor: e.target.value })} /></Field>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Departamentos que participa">
              <CheckboxGroup options={departmentOptions} values={form.departments} onChange={(values) => setForm({ ...form, departments: values })} />
            </Field>
            <Field label="Departamentos que gostaria de participar">
              <CheckboxGroup options={departmentOptions} values={form.desired_departments} onChange={(values) => setForm({ ...form, desired_departments: values })} />
            </Field>
            <Field label="Grupo Familiar">
              <select className={inputClass} value={form.family_group} onChange={(e) => setForm({ ...form, family_group: e.target.value, family_group_leader: getFamilyGroupLeader(e.target.value) })}>
                {familyGroupOptions.map((option) => {
                  const leader = getFamilyGroupLeader(option.value);
                  return <option key={option.label} value={option.value}>{leader ? `${option.label} - ${leader}` : option.label}</option>;
                })}
              </select>
            </Field>
            <Field label="Lider do Grupo Familiar"><input className={inputClass} value={getFamilyGroupLeader(form.family_group) || "Sem lider definido"} readOnly /></Field>
            <Field label="Observacoes"><textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>
        </Card>

        {canManageRestricted ? (
          <Card>
            <h3 className="mb-4 text-lg font-semibold">3. Informacoes administrativas</h3>
            <div className="grid gap-4">
              <Field label="Status determinado pelo pastor global">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PersonStatus })}>
                  {Object.entries(personStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field label="Cargos administrativos">
                <CheckboxGroup options={administrativeRoleOptions} values={form.administrative_roles} onChange={(values) => setForm({ ...form, administrative_roles: values })} />
              </Field>
              <Field label="Cargos eclesiasticos">
                <CheckboxGroup options={ecclesiasticalRoleOptions} values={form.ecclesiastical_roles} onChange={(values) => setForm({ ...form, ecclesiastical_roles: values })} />
              </Field>
              <Field label="Cargo no departamento">
                <CheckboxGroup options={departmentRoleOptions} values={form.department_roles} onChange={(values) => setForm({ ...form, department_roles: values })} />
              </Field>
              <Field label="Atribuicao">
                <select className={inputClass} value={form.assigned_leader} onChange={(e) => setForm({ ...form, assigned_leader: e.target.value })}>
                  <option value="">Sem atribuicao</option>
                  {people.map((person) => <option key={person.id} value={person.name}>{person.name}</option>)}
                </select>
              </Field>
            </div>
          </Card>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {access?.isAdminLike && !isNew ? <button type="button" onClick={removePerson} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"><Trash2 className="h-4 w-4" />Excluir</button> : <span />}
          <Button className="gap-2"><Save className="h-4 w-4" />Salvar perfil</Button>
        </div>
      </form>
    </PageShell>
  );
}
