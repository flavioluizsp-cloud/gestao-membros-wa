"use client";

import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button, Card, Field, inputClass, PageHeader, PageShell, Badge } from "@/components/ui";
import { departmentOptions, familyGroupOptions } from "@/lib/labels";
import { getAccessContext } from "@/lib/access";
import { supabase } from "@/lib/supabase";
import type { AccessContext, Person, ScopeType, UserProfile, UserRole, UserScope } from "@/lib/types";

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  pastor: "Pastor / lider global",
  lider: "Lider",
  membro: "Membro"
};

export default function PermissionsPage() {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [scopes, setScopes] = useState<UserScope[]>([]);
  const [form, setForm] = useState({ auth_user_id: "", person_id: "", role: "membro" as UserRole, is_global_leader: false });
  const [scopeForm, setScopeForm] = useState({ user_profile_id: "", scope_type: "grupo_familiar" as ScopeType, scope_value: "" });
  const [message, setMessage] = useState("");

  async function load() {
    if (!supabase) return;
    const accessContext = await getAccessContext();
    setAccess(accessContext);
    const [peopleResult, profilesResult, scopesResult] = await Promise.all([
      supabase.from("people").select("*").order("name"),
      supabase.from("user_profiles").select("*, people(id, name, phone)").order("created_at", { ascending: false }),
      supabase.from("user_scopes").select("*").order("created_at", { ascending: false })
    ]);
    setPeople((peopleResult.data ?? []) as Person[]);
    setProfiles((profilesResult.data ?? []) as UserProfile[]);
    setScopes((scopesResult.data ?? []) as UserScope[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("user_profiles").upsert({
      auth_user_id: form.auth_user_id,
      person_id: form.person_id || null,
      role: form.role,
      is_global_leader: form.is_global_leader
    }, { onConflict: "auth_user_id" });
    setMessage(error ? error.message : "Permissao salva.");
    if (!error) setForm({ auth_user_id: "", person_id: "", role: "membro", is_global_leader: false });
    load();
  }

  async function saveScope(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("user_scopes").upsert(scopeForm, { onConflict: "user_profile_id,scope_type,scope_value" });
    setMessage(error ? error.message : "Escopo salvo.");
    if (!error) setScopeForm({ user_profile_id: "", scope_type: "grupo_familiar", scope_value: "" });
    load();
  }

  async function removeScope(id: string) {
    if (!supabase) return;
    await supabase.from("user_scopes").delete().eq("id", id);
    load();
  }

  async function removeProfile(id: string) {
    if (!supabase || !window.confirm("Excluir esta permissao?")) return;
    await supabase.from("user_profiles").delete().eq("id", id);
    load();
  }

  if (access && !access.isAdminLike) {
    return (
      <PageShell>
        <PageHeader title="Permissoes" description="Acesso restrito ao admin e pastor global." />
        <Card>Voce nao tem permissao para gerenciar usuarios.</Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader title="Permissoes" description="Vincule usuarios do Supabase a pessoas e defina o que cada lider pode ver." />
      {message ? <div className="mb-4 rounded-md bg-sage px-4 py-3 text-sm font-semibold text-moss">{message}</div> : null}
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <Card>
            <h3 className="mb-3 font-semibold">Criar ou atualizar permissao</h3>
            <form onSubmit={saveProfile} className="space-y-3">
              <Field label="ID do usuario Supabase Auth">
                <input className={inputClass} required value={form.auth_user_id} onChange={(e) => setForm({ ...form, auth_user_id: e.target.value })} placeholder="UUID do usuario em Authentication" />
              </Field>
              <Field label="Pessoa vinculada">
                <select className={inputClass} value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value })}>
                  <option value="">Sem pessoa vinculada</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </select>
              </Field>
              <Field label="Papel">
                <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                  {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
                <input type="checkbox" checked={form.is_global_leader} onChange={(e) => setForm({ ...form, is_global_leader: e.target.checked })} />
                Lider global
              </label>
              <Button className="w-full gap-2"><Save className="h-4 w-4" />Salvar permissao</Button>
            </form>
          </Card>
          <Card>
            <h3 className="mb-3 font-semibold">Adicionar escopo ao lider</h3>
            <form onSubmit={saveScope} className="space-y-3">
              <Field label="Usuario">
                <select className={inputClass} required value={scopeForm.user_profile_id} onChange={(e) => setScopeForm({ ...scopeForm, user_profile_id: e.target.value })}>
                  <option value="">Selecione</option>
                  {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.people?.name ?? profile.auth_user_id} - {roleLabels[profile.role]}</option>)}
                </select>
              </Field>
              <Field label="Tipo">
                <select className={inputClass} value={scopeForm.scope_type} onChange={(e) => setScopeForm({ ...scopeForm, scope_type: e.target.value as ScopeType, scope_value: "" })}>
                  <option value="grupo_familiar">Grupo Familiar</option>
                  <option value="departamento">Departamento</option>
                </select>
              </Field>
              <Field label="Valor">
                <select className={inputClass} required value={scopeForm.scope_value} onChange={(e) => setScopeForm({ ...scopeForm, scope_value: e.target.value })}>
                  <option value="">Selecione</option>
                  {(scopeForm.scope_type === "grupo_familiar" ? familyGroupOptions.filter((group) => group.value) : departmentOptions.map((department) => ({ value: department, label: department }))).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
              <Button className="w-full gap-2"><Save className="h-4 w-4" />Salvar escopo</Button>
            </form>
          </Card>
        </div>
        <Card>
          <h3 className="mb-3 font-semibold">Usuarios configurados</h3>
          <div className="space-y-3">
            {profiles.map((profile) => {
              const profileScopes = scopes.filter((scope) => scope.user_profile_id === profile.id);
              return (
                <div key={profile.id} className="rounded-md border border-line p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{profile.people?.name ?? "Sem pessoa vinculada"}</p>
                        <Badge>{roleLabels[profile.role]}</Badge>
                        {profile.is_global_leader ? <Badge tone="good">Global</Badge> : null}
                      </div>
                      <p className="mt-1 text-xs text-ink/50">{profile.auth_user_id}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profileScopes.map((scope) => (
                          <button key={scope.id} onClick={() => removeScope(scope.id)} className="inline-flex items-center gap-1 rounded-md bg-sage px-2 py-1 text-xs font-semibold text-moss">
                            {scope.scope_type}: {scope.scope_value} <Trash2 className="h-3 w-3" />
                          </button>
                        ))}
                        {profileScopes.length === 0 ? <span className="text-sm text-ink/50">Sem escopos</span> : null}
                      </div>
                    </div>
                    <button className="rounded-md border border-line px-3 py-2 text-sm" onClick={() => removeProfile(profile.id)}>Excluir</button>
                  </div>
                </div>
              );
            })}
            {profiles.length === 0 ? <p className="text-sm text-ink/60">Nenhuma permissao configurada. Enquanto isso, o primeiro usuario logado atua como admin inicial.</p> : null}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
