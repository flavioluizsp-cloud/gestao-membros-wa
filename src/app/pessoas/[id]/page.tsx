"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { parseBirthDateInput } from "@/lib/date";
import { administrativeRoleOptions, departmentOptions, departmentRoleOptions, ecclesiasticalRoleOptions, familyGroupOptions, personStatusDescriptions, personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { AccessContext, FamilyMember, MaritalStatus, Person, PersonStatus } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

const emptyForm = {
  name: "",
  preferred_name: "",
  phone: "",
  email: "",
  birth_date: "",
  birth_day: null as number | null,
  birth_month: null as number | null,
  hide_birth_year: false,
  birth_city: "",
  marital_status: "" as MaritalStatus,
  family_members: [] as FamilyMember[],
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

const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
  { value: "", label: "Nao informado" },
  { value: "solteiro", label: "Solteiro" },
  { value: "casado", label: "Casado" },
  { value: "uniao_estavel", label: "Uniao estavel" },
  { value: "juntos_sem_casar", label: "Juntos sem casar" }
];

const relationshipOptions = ["Conjuge", "Filho(a)", "Pais", "Sobrinho(a)", "Outro"];

const emptyMember: FamilyMember = { name: "", relationship: "Conjuge", birth_date: "", linked_person_id: null };

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function CheckboxGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <label key={option} className="flex min-h-10 items-center gap-2 rounded-md border border-line px-2 py-2 text-sm">
          <input type="checkbox" checked={values.includes(option)} onChange={() => onChange(toggleValue(values, option))} />
          <span className="min-w-0 leading-snug">{option}</span>
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

function normalizeFamilyMembers(members: FamilyMember[]) {
  return members
    .map((member) => ({ ...member, birth_date: member.birth_date || (member as FamilyMember & { birth_year?: string }).birth_year || "" }))
    .filter((member) => member.name.trim() || member.relationship.trim() || member.birth_date.trim());
}

function formatDateBR(dateStr: string) {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const [year, month, day] = dateStr.split("-");
  if (!day) return "";
  return `${day}/${month}/${year}`;
}

function normalizeDate(dateStr: string) {
  const value = dateStr.trim();
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}


function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}
export default function PersonProfilePage({ params }: PageProps) {
  const [id, setId] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [newMember, setNewMember] = useState<FamilyMember>(emptyMember);
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
      if (id === "novo" && accessContext.isMember) {
        window.location.href = "/membro";
        return;
      }
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
        birth_date: person.birth_date ?? (person.birth_day && person.birth_month ? `${String(person.birth_day).padStart(2, "0")}/${String(person.birth_month).padStart(2, "0")}` : ""),
        birth_day: person.birth_day,
        birth_month: person.birth_month,
        hide_birth_year: Boolean(person.hide_birth_year),
        birth_city: person.birth_city ?? "",
        marital_status: person.marital_status ?? "",
        family_members: (person.family_members ?? []).map((member) => ({
          name: member.name ?? "",
          relationship: member.relationship ?? "",
          birth_date: member.birth_date || (member as FamilyMember & { birth_year?: string }).birth_year || "",
          linked_person_id: member.linked_person_id ?? null
        })),
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
    const parsedBirthDate = parseBirthDateInput(form.birth_date);
    const payload = {
      name: form.name,
      preferred_name: form.preferred_name || null,
      phone: form.phone,
      email: form.email || null,
      ...parsedBirthDate,
      hide_birth_year: form.hide_birth_year,
      birth_city: form.birth_city || null,
      marital_status: form.marital_status || null,
      family_members: normalizeFamilyMembers(form.family_members).map((member) => ({ ...member, birth_date: normalizeDate(member.birth_date) ?? "" })),
      is_baptized: form.is_baptized,
      baptism_date: normalizeDate(form.baptism_date),
      baptism_church: form.baptism_church || null,
      baptizing_pastor: form.baptizing_pastor || null,
      departments: form.departments,
      desired_departments: form.desired_departments.filter((department) => !form.departments.includes(department)),
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

  function confirmNewMember() {
    if (!newMember.name.trim()) return;
    setForm({ ...form, family_members: [...form.family_members, { ...newMember, birth_date: normalizeDate(newMember.birth_date) ?? "" }] });
    setNewMember(emptyMember);
    setShowFamilyForm(false);
  }

  function removeFamilyMember(index: number) {
    setForm({ ...form, family_members: form.family_members.filter((_, i) => i !== index) });
  }

  return (
    <PageShell>
      <div className="mb-4">
        <Link href="/pessoas" className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-sage">← Voltar para Pessoas</Link>
      </div>
      <PageHeader
        title={isNew ? "Nova pessoa" : form.preferred_name || form.name || "Perfil"}
        description="Perfil organizado por dados pessoais e dados da igreja."
      />
      {message ? (
        <div className={`fixed left-1/2 top-6 z-[9999] w-[min(92vw,560px)] -translate-x-1/2 rounded-md px-5 py-4 text-center text-base font-bold shadow-2xl ring-2 ring-white ${messageType === "success" ? "bg-emerald-700 text-white" : "bg-red-600 text-white"}`}>
          {message}
        </div>
      ) : null}
      <form onSubmit={savePerson} className="space-y-4">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">1. Dados pessoais</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Como e conhecido"><input className={inputClass} value={form.preferred_name} onChange={(e) => setForm({ ...form, preferred_name: e.target.value })} /></Field>
            <Field label="Numero WhatsApp"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="E-mail"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <div className="col-span-2 flex items-end gap-3">
              <label className="block flex-1">
                <span className="mb-1 block text-sm font-medium text-ink">Data de nascimento</span>
                <input className={inputClass} type="text" inputMode="numeric" placeholder="dd/mm ou dd/mm/aaaa" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: maskDate(e.target.value) })} />
              </label>
              <label className="flex h-[42px] shrink-0 items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
                <input type="checkbox" checked={form.hide_birth_year} onChange={(e) => setForm({ ...form, hide_birth_year: e.target.checked })} />
                Ocultar ano
              </label>
            </div>
            <Field label="Cidade natal"><input className={inputClass} value={form.birth_city} onChange={(e) => setForm({ ...form, birth_city: e.target.value })} /></Field>
            <Field label="Situacao conjugal">
              <select className={inputClass} value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value as MaritalStatus })}>
                {maritalStatusOptions.map((option) => <option key={option.value || "empty"} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-4 rounded-md border border-line p-3 sm:p-4">
            <h4 className="font-semibold text-ink">Dados da familia</h4>
            <p className="mt-1 text-sm text-ink/60">Cadastre conjuge, filhos ou outros familiares ligados a voce.</p>

            {/* Cards dos familiares já salvos */}
            {form.family_members.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.family_members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border border-line bg-white px-3 py-2.5">
                    <div className="min-w-0">
                      {member.linked_person_id ? (
                        <Link href={`/pessoas/${member.linked_person_id}`} className="text-sm font-semibold text-moss hover:underline">
                          {member.name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-ink">{member.name}</p>
                      )}
                      <p className="text-xs text-ink/60">
                        {member.relationship}{member.birth_date ? ` · ${formatDateBR(member.birth_date)}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(index)}
                      className="ml-3 shrink-0 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário inline de novo familiar */}
            {showFamilyForm ? (
              <div className="mt-3 rounded-md border border-line bg-sage p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Selecionar pessoa cadastrada">
                    <select
                      className={inputClass}
                      value={newMember.linked_person_id ?? ""}
                      onChange={(e) => {
                        const selected = people.find((person) => person.id === e.target.value);
                        setNewMember({
                          ...newMember,
                          linked_person_id: selected?.id ?? null,
                          name: selected?.name ?? "",
                          birth_date: selected?.birth_date ?? (
                            selected?.birth_day && selected?.birth_month
                              ? `${String(selected.birth_day).padStart(2, "0")}/${String(selected.birth_month).padStart(2, "0")}`
                              : ""
                          )
                        });
                      }}
                    >
                      <option value="">Digitar nome manualmente</option>
                      {people.filter((person) => person.id !== id).map((person) => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Nome">
                    <input
                      className={inputClass}
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value, linked_person_id: null })}
                      placeholder="Nome do familiar"
                    />
                  </Field>
                  <Field label="Parentesco">
                    <select className={inputClass} value={newMember.relationship} onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}>
                      {relationshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </Field>
                  <Field label="Data nascimento">
                    <input className={inputClass} type="text" inputMode="numeric" placeholder="dd/mm ou dd/mm/aaaa" value={newMember.birth_date ?? ""} onChange={(e) => setNewMember({ ...newMember, birth_date: maskDate(e.target.value) })} />
                  </Field>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmNewMember}
                    className="rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowFamilyForm(false); setNewMember(emptyMember); }}
                    className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowFamilyForm(true)}
                className="mt-3 w-full rounded-md border border-line bg-sage px-3 py-2.5 text-sm font-semibold text-ink hover:bg-sage/80"
              >
                {form.family_members.length === 0 ? "Adicionar primeiro familiar" : "Adicionar outro familiar"}
              </button>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">2. Dados da igreja</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Voce e batizado?">
              <select className={inputClass} value={form.is_baptized ? "sim" : "nao"} onChange={(e) => setForm({ ...form, is_baptized: e.target.value === "sim" })}>
                <option value="nao">Nao</option>
                <option value="sim">Sim</option>
              </select>
            </Field>
            <Field label="Data do batismo"><input className={inputClass} type="text" inputMode="numeric" placeholder="dd/mm/aaaa" value={form.baptism_date} onChange={(e) => setForm({ ...form, baptism_date: maskDate(e.target.value) })} /></Field>
            <Field label="Igreja do batismo"><input className={inputClass} value={form.baptism_church} onChange={(e) => setForm({ ...form, baptism_church: e.target.value })} /></Field>
            <Field label="Pastor que batizou"><input className={inputClass} value={form.baptizing_pastor} onChange={(e) => setForm({ ...form, baptizing_pastor: e.target.value })} /></Field>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Departamentos que participa">
              <CheckboxGroup options={departmentOptions} values={form.departments} onChange={(values) => setForm({ ...form, departments: values, desired_departments: form.desired_departments.filter((department) => !values.includes(department)) })} />
            </Field>
            <Field label="Departamentos que gostaria de participar">
              <CheckboxGroup options={departmentOptions.filter((department) => !form.departments.includes(department))} values={form.desired_departments} onChange={(values) => setForm({ ...form, desired_departments: values })} />
            </Field>
            <Field label="Grupo Familiar">
              <select className={inputClass} value={form.family_group} onChange={(e) => setForm({ ...form, family_group: e.target.value, family_group_leader: getFamilyGroupLeader(e.target.value) })}>
                {familyGroupOptions.map((option) => {
                  const leader = getFamilyGroupLeader(option.value);
                  return <option key={option.label} value={option.value}>{leader ? `${option.label} - ${leader}` : option.label}</option>;
                })}
              </select>
            </Field>
            
            
          </div>
        </Card>

        {access?.isLeader && !access?.isAdminLike ? (
          <Card>
            <h3 className="mb-3 text-lg font-semibold">Informacao da lideranca</h3>
            <div className="flex items-center justify-between rounded-md border border-line px-3 py-2.5">
              <span className="text-sm text-ink/60">Status</span>
              <span className="text-sm font-semibold text-moss">{personStatusLabels[form.status]}</span>
            </div>
          </Card>
        ) : null}

        {canManageRestricted ? (
          <Card>
            <h3 className="mb-4 text-lg font-semibold">3. Informacoes administrativas</h3>
            <div className="grid gap-4">
              <Field label="Status determinado pelo pastor global">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PersonStatus })}>
                  {Object.entries(personStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <p className="mt-2 text-xs leading-relaxed text-ink/60">{personStatusDescriptions[form.status]}</p>
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {access?.isAdminLike && !isNew ? <button type="button" onClick={removePerson} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"><Trash2 className="h-4 w-4" />Excluir</button> : <span />}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-56">
            <Button className="gap-2"><Save className="h-4 w-4" />Salvar perfil</Button>
            <Link href="/pessoas" className="inline-flex items-center justify-center rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-sage">
              Voltar para Pessoas
            </Link>
          </div>
        </div>
      </form>
    </PageShell>
  );
}
