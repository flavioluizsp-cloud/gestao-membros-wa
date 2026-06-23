"use client";

import { useState } from "react";
import { Card, Field, inputClass } from "@/components/ui";
import { departmentOptions, familyGroupOptions } from "@/lib/labels";
import { membrosDb } from "@/lib/supabase";
import type { FamilyMember, MaritalStatus } from "@/lib/types";

const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
  { value: "", label: "Nao informado" },
  { value: "solteiro", label: "Solteiro" },
  { value: "casado", label: "Casado" },
  { value: "uniao_estavel", label: "Uniao estavel" },
  { value: "juntos_sem_casar", label: "Juntos sem casar" }
];

const relationshipOptions = ["Conjuge", "Filho(a)", "Pai", "Mae", "Irmao(a)", "Outro"];
const emptyMember: FamilyMember = { name: "", relationship: "Filho(a)", birth_date: "" };

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((i) => i !== value) : [...values, value];
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
  const selected = familyGroupOptions.find((o) => o.value === group);
  if (!selected?.leader) return "";
  return selected.coLeader ? `${selected.leader} / ${selected.coLeader}` : selected.leader;
}

function formatDateBR(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!day) return "";
  return `${day}/${month}/${year}`;
}

export default function CadastroPage() {
  const [form, setForm] = useState({
    name: "",
    preferred_name: "",
    phone: "",
    email: "",
    birth_date: "",
    birth_city: "",
    marital_status: "" as MaritalStatus,
    family_members: [] as FamilyMember[],
    is_baptized: false,
    baptism_date: "",
    baptism_church: "",
    baptizing_pastor: "",
    family_group: "",
    departments: [] as string[],
    desired_departments: [] as string[],
  });

  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [newMember, setNewMember] = useState<FamilyMember>(emptyMember);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function confirmNewMember() {
    if (!newMember.name.trim()) return;
    setForm({ ...form, family_members: [...form.family_members, newMember] });
    setNewMember(emptyMember);
    setShowFamilyForm(false);
  }

  function removeFamilyMember(index: number) {
    setForm({ ...form, family_members: form.family_members.filter((_, i) => i !== index) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!membrosDb) return;
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      preferred_name: form.preferred_name || null,
      phone: form.phone,
      email: form.email || null,
      birth_date: form.birth_date || null,
      birth_city: form.birth_city || null,
      marital_status: form.marital_status || null,
      family_members: form.family_members.filter((m) => m.name.trim()),
      is_baptized: form.is_baptized,
      baptism_date: form.baptism_date || null,
      baptism_church: form.baptism_church || null,
      baptizing_pastor: form.baptizing_pastor || null,
      family_group: form.family_group || null,
      family_group_leader: getFamilyGroupLeader(form.family_group) || null,
      departments: form.departments,
      desired_departments: form.desired_departments,
      status: "visitante" as const,
      pending_approval: true,
    };

    const { error: err } = await membrosDb.from("people").insert(payload);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sage px-4">
        <div className="w-full max-w-md rounded-xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-4xl">🎉</div>
          <h2 className="text-xl font-bold text-ink">Cadastro enviado!</h2>
          <p className="mt-2 text-sm text-ink/60">Suas informações foram recebidas e serão analisadas pela liderança. Em breve você receberá um retorno.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-moss">IGREJA BATISTA INDEPENDENTE</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-moss/70">ABELARDO LUZ</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">Cadastro de Membro</h1>
          <p className="mt-1 text-sm text-ink/60">Preencha seus dados para fazer parte da nossa comunidade.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <h3 className="mb-4 text-lg font-semibold">1. Dados pessoais</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Como e conhecido"><input className={inputClass} value={form.preferred_name} onChange={(e) => setForm({ ...form, preferred_name: e.target.value })} /></Field>
              <Field label="Numero WhatsApp"><input required className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="E-mail"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Data de nascimento"><input className={inputClass} type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></Field>
              <Field label="Cidade natal"><input className={inputClass} value={form.birth_city} onChange={(e) => setForm({ ...form, birth_city: e.target.value })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Situacao conjugal">
                  <select className={inputClass} value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value as MaritalStatus })}>
                    {maritalStatusOptions.map((o) => <option key={o.value || "empty"} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-line p-3">
              <h4 className="font-semibold text-ink">Dados da familia</h4>
              <p className="mt-1 text-sm text-ink/60">Cadastre conjuge, filhos ou outros familiares ligados a voce.</p>

              {form.family_members.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.family_members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border border-line bg-white px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-ink">{member.name}</p>
                        <p className="text-xs text-ink/60">{member.relationship}{member.birth_date ? ` · ${formatDateBR(member.birth_date)}` : ""}</p>
                      </div>
                      <button type="button" onClick={() => removeFamilyMember(index)} className="ml-3 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700">Remover</button>
                    </div>
                  ))}
                </div>
              )}

              {showFamilyForm ? (
                <div className="mt-3 rounded-md border border-line bg-sage p-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Nome"><input className={inputClass} value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} autoFocus /></Field>
                    <Field label="Parentesco">
                      <select className={inputClass} value={newMember.relationship} onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}>
                        {relationshipOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Data nascimento"><input className={inputClass} type="date" value={newMember.birth_date ?? ""} onChange={(e) => setNewMember({ ...newMember, birth_date: e.target.value })} /></Field>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={confirmNewMember} className="rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white">Confirmar</button>
                    <button type="button" onClick={() => { setShowFamilyForm(false); setNewMember(emptyMember); }} className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowFamilyForm(true)} className="mt-3 w-full rounded-md border border-line bg-sage px-3 py-2.5 text-sm font-semibold text-ink">
                  {form.family_members.length === 0 ? "Adicionar familiar" : "Adicionar outro familiar"}
                </button>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold">2. Dados da igreja</h3>
            <div className="grid gap-4">
              <Field label="Voce e batizado?">
                <select className={inputClass} value={form.is_baptized ? "sim" : "nao"} onChange={(e) => setForm({ ...form, is_baptized: e.target.value === "sim" })}>
                  <option value="nao">Nao</option>
                  <option value="sim">Sim</option>
                </select>
              </Field>
              {form.is_baptized && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Data do batismo"><input className={inputClass} type="date" value={form.baptism_date} onChange={(e) => setForm({ ...form, baptism_date: e.target.value })} /></Field>
                  <Field label="Igreja do batismo"><input className={inputClass} value={form.baptism_church} onChange={(e) => setForm({ ...form, baptism_church: e.target.value })} /></Field>
                  <Field label="Pastor que batizou"><input className={inputClass} value={form.baptizing_pastor} onChange={(e) => setForm({ ...form, baptizing_pastor: e.target.value })} /></Field>
                </div>
              )}
              <Field label="Grupo Familiar">
                <select className={inputClass} value={form.family_group} onChange={(e) => setForm({ ...form, family_group: e.target.value })}>
                  {familyGroupOptions.map((o) => {
                    const leader = getFamilyGroupLeader(o.value);
                    return <option key={o.label} value={o.value}>{leader ? `${o.label} - ${leader}` : o.label}</option>;
                  })}
                </select>
              </Field>
              <Field label="Departamentos que participa">
                <CheckboxGroup options={departmentOptions} values={form.departments} onChange={(values) => setForm({ ...form, departments: values })} />
              </Field>
              <Field label="Departamentos que gostaria de participar">
                <CheckboxGroup options={departmentOptions} values={form.desired_departments} onChange={(values) => setForm({ ...form, desired_departments: values })} />
              </Field>
            </div>
          </Card>

          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white hover:bg-moss/90 disabled:opacity-50">
            {loading ? "Enviando..." : "Enviar cadastro"}
          </button>
        </form>
      </div>
    </div>
  );
}