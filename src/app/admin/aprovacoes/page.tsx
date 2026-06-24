"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Badge, Card, PageHeader, PageShell } from "@/components/ui";
import { getAccessContext } from "@/lib/access";
import { formatDate } from "@/lib/date";
import { personStatusLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import type { FamilyMember, Person, PersonStatus } from "@/lib/types";

function textOrCurrent(newValue: string | null | undefined, currentValue: string | null | undefined) {
  const clean = newValue?.trim();
  return clean ? clean : currentValue ?? null;
}

function mergeList(current?: string[] | null, incoming?: string[] | null) {
  return Array.from(new Set([...(current ?? []), ...(incoming ?? [])].filter(Boolean)));
}

function mergeFamilyMembers(current?: FamilyMember[] | null, incoming?: FamilyMember[] | null) {
  const byKey = new Map<string, FamilyMember>();
  [...(current ?? []), ...(incoming ?? [])].forEach((member) => {
    const key = `${member.name.trim().toLowerCase()}-${member.relationship.trim().toLowerCase()}`;
    if (member.name.trim()) byKey.set(key, member);
  });
  return Array.from(byKey.values());
}

function mergeNotes(current?: string | null, incoming?: string | null) {
  const currentText = current?.trim();
  const incomingText = incoming?.trim();
  if (currentText && incomingText && currentText !== incomingText) {
    return `${currentText}\n\nAtualizacao recebida pelo formulario:\n${incomingText}`;
  }
  return incomingText || currentText || null;
}

function mergePersonData(existing: Person, pending: Person, status: PersonStatus) {
  return {
    name: textOrCurrent(pending.name, existing.name) ?? existing.name,
    preferred_name: textOrCurrent(pending.preferred_name, existing.preferred_name),
    phone: textOrCurrent(pending.phone, existing.phone) ?? existing.phone,
    email: textOrCurrent(pending.email, existing.email),
    birth_date: textOrCurrent(pending.birth_date, existing.birth_date),
    birth_day: existing.birth_day ?? pending.birth_day,
    birth_month: existing.birth_month ?? pending.birth_month,
    hide_birth_year: Boolean(existing.hide_birth_year || pending.hide_birth_year),
    birth_city: textOrCurrent(pending.birth_city, existing.birth_city),
    marital_status: textOrCurrent(pending.marital_status, existing.marital_status),
    family_members: mergeFamilyMembers(existing.family_members, pending.family_members),
    status,
    notes: mergeNotes(existing.notes, pending.notes),
    last_contact_at: textOrCurrent(pending.last_contact_at, existing.last_contact_at),
    family_group: textOrCurrent(pending.family_group, existing.family_group),
    family_group_leader: textOrCurrent(pending.family_group_leader, existing.family_group_leader),
    assigned_leader: textOrCurrent(existing.assigned_leader, pending.assigned_leader),
    is_baptized: Boolean(existing.is_baptized || pending.is_baptized),
    baptism_date: textOrCurrent(pending.baptism_date, existing.baptism_date),
    baptism_church: textOrCurrent(pending.baptism_church, existing.baptism_church),
    baptizing_pastor: textOrCurrent(pending.baptizing_pastor, existing.baptizing_pastor),
    roles: mergeList(existing.roles, pending.roles),
    administrative_roles: mergeList(existing.administrative_roles, pending.administrative_roles),
    ecclesiastical_roles: mergeList(existing.ecclesiastical_roles, pending.ecclesiastical_roles),
    department_roles: mergeList(existing.department_roles, pending.department_roles),
    departments: mergeList(existing.departments, pending.departments),
    desired_departments: mergeList(existing.desired_departments, pending.desired_departments),
    visitor_origin: textOrCurrent(pending.visitor_origin, existing.visitor_origin),
    visitor_status: textOrCurrent(pending.visitor_status, existing.visitor_status),
    privacy_consent: Boolean(existing.privacy_consent || pending.privacy_consent),
    privacy_consent_at: textOrCurrent(pending.privacy_consent_at, existing.privacy_consent_at),
    privacy_consent_version: textOrCurrent(pending.privacy_consent_version, existing.privacy_consent_version),
    pending_approval: false,
  };
}

export default function AprovacoesPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [existingPeople, setExistingPeople] = useState<Person[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<Record<string, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<Record<string, PersonStatus>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    if (!supabase || !membrosDb) return;
    const [{ data }, { data: allData }] = await Promise.all([
      membrosDb
        .from("people")
        .select("*")
        .eq("pending_approval", true)
        .order("created_at", { ascending: false }),
      membrosDb
        .from("people")
        .select("*")
        .or("pending_approval.is.false,pending_approval.is.null")
        .order("name", { ascending: true }),
    ]);
    setPeople((data ?? []) as Person[]);
    setExistingPeople((allData ?? []) as Person[]);
    setLoading(false);
  }

  useEffect(() => {
    async function check() {
      const ctx = await getAccessContext();
      if (!ctx.isAdminLike) {
        window.location.href = "/";
        return;
      }
      load();
    }
    check();
  }, []);

  function showMessage(text: string, duration = 3000) {
    setMessage(text);
    setTimeout(() => setMessage(""), duration);
  }

  async function approve(person: Person, status: PersonStatus) {
    if (!membrosDb) return;
    const { error } = await membrosDb
      .from("people")
      .update({ pending_approval: false, status })
      .eq("id", person.id);

    if (error) {
      showMessage(error.message, 4000);
      return;
    }

    showMessage(`${person.preferred_name || person.name} aprovado como ${personStatusLabels[status]}.`);
    load();
  }

  async function mergeWithExisting(person: Person) {
    if (!membrosDb) return;
    const targetId = selectedExisting[person.id];
    const target = existingPeople.find((item) => item.id === targetId);
    if (!target) {
      showMessage("Escolha o cadastro existente antes de vincular.");
      return;
    }

    const status = selectedStatus[person.id] ?? target.status;
    const mergedData = mergePersonData(target, person, status);

    const { error: updateError } = await membrosDb.from("people").update(mergedData).eq("id", target.id);
    if (updateError) {
      showMessage(updateError.message, 4000);
      return;
    }

    await membrosDb.from("user_profiles").update({ person_id: target.id }).eq("person_id", person.id);

    const { error: deleteError } = await membrosDb.from("people").delete().eq("id", person.id);
    if (deleteError) {
      showMessage(`Dados vinculados, mas o cadastro duplicado nao foi excluido: ${deleteError.message}`, 5000);
      load();
      return;
    }

    showMessage(`${person.preferred_name || person.name} foi vinculado ao cadastro de ${target.name}.`, 4000);
    load();
  }

  async function reject(person: Person) {
    if (!membrosDb) return;
    if (!window.confirm(`Rejeitar e excluir o cadastro de ${person.name}?`)) return;
    await membrosDb.from("people").delete().eq("id", person.id);
    load();
  }

  return (
    <PageShell>
      <PageHeader
        title="Aprovações de cadastro"
        description="Cadastros enviados pelo formulário público aguardando aprovação."
      />

      {message && (
        <div className="fixed left-1/2 top-6 z-[9999] w-[min(92vw,560px)] -translate-x-1/2 rounded-md bg-emerald-700 px-5 py-4 text-center text-base font-bold text-white shadow-2xl">
          {message}
        </div>
      )}

      {loading && <p className="text-sm text-ink/60">Carregando...</p>}

      {!loading && people.length === 0 && (
        <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <h3 className="font-semibold text-ink">Nenhum cadastro pendente</h3>
          <p className="mt-1 text-sm text-ink/60">Todos os cadastros já foram revisados.</p>
        </div>
      )}

      <div className="space-y-4">
        {people.map((person) => (
          <Card key={person.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink">{person.name}</h3>
                  {person.preferred_name && <span className="text-sm text-ink/60">({person.preferred_name})</span>}
                  <Badge>Pendente</Badge>
                </div>

                <div className="mt-2 grid gap-1 text-sm text-ink/70 sm:grid-cols-2">
                  <p>WhatsApp: {person.phone}</p>
                  {person.email && <p>E-mail: {person.email}</p>}
                  {person.birth_date && <p>Nascimento: {formatDate(person.birth_date)}</p>}
                  {person.birth_city && <p>Cidade natal: {person.birth_city}</p>}
                  {person.marital_status && <p>Situação conjugal: {person.marital_status}</p>}
                  {person.family_group && <p>Grupo familiar: {person.family_group}</p>}
                  <p>Batismo: {person.is_baptized ? "Sim" : "Não"}</p>
                  <p>Enviado em {formatDate(person.created_at)}</p>
                </div>

                {(person.departments ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(person.departments ?? []).map((dep) => (
                      <span key={dep} className="rounded-md bg-sage px-2 py-0.5 text-xs font-semibold text-moss">
                        {dep}
                      </span>
                    ))}
                  </div>
                )}

                {(person.family_members ?? []).length > 0 && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-semibold text-ink/60">Familiares:</p>
                    <div className="flex flex-wrap gap-2">
                      {(person.family_members ?? []).map((member, i) => (
                        <span key={`${member.name}-${i}`} className="rounded-md border border-line px-2 py-0.5 text-xs text-ink">
                          {member.name} - {member.relationship}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <p className="mb-1 text-xs font-semibold text-ink/60">Aprovar como novo:</p>
                <button
                  onClick={() => approve(person, "visitante")}
                  className="inline-flex items-center gap-2 rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                >
                  <Check className="h-4 w-4" /> Visitante
                </button>
                <button
                  onClick={() => approve(person, "frequentador")}
                  className="inline-flex items-center gap-2 rounded-md bg-moss/80 px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90"
                >
                  <Check className="h-4 w-4" /> Frequentador
                </button>
                <button
                  onClick={() => approve(person, "membro")}
                  className="inline-flex items-center gap-2 rounded-md bg-moss/60 px-3 py-2 text-sm font-semibold text-white hover:bg-moss/70"
                >
                  <Check className="h-4 w-4" /> Membro
                </button>
                <button
                  onClick={() => reject(person)}
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" /> Rejeitar
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-line bg-sage/30 p-3">
              <p className="text-sm font-semibold text-ink">Já existe cadastro dessa pessoa?</p>
              <p className="mt-1 text-xs text-ink/60">
                Use quando um líder ou membro preencheu o formulário, mas já estava cadastrado. O sistema completa o cadastro antigo e remove o duplicado.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
                <select
                  value={selectedExisting[person.id] ?? ""}
                  onChange={(event) =>
                    setSelectedExisting((current) => ({ ...current, [person.id]: event.target.value }))
                  }
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss"
                >
                  <option value="">Escolha o cadastro existente</option>
                  {existingPeople.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.phone}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus[person.id] ?? person.status}
                  onChange={(event) =>
                    setSelectedStatus((current) => ({
                      ...current,
                      [person.id]: event.target.value as PersonStatus,
                    }))
                  }
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-moss"
                >
                  {Object.entries(personStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => mergeWithExisting(person)}
                  className="rounded-md border border-moss px-3 py-2 text-sm font-semibold text-moss hover:bg-white"
                >
                  Vincular
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
