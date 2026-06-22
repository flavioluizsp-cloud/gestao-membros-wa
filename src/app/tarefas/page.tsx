"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, inputClass, PageHeader, PageShell, Badge } from "@/components/ui";
import { membrosDb, supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/date";
import { taskStatusLabels, taskTypeLabels } from "@/lib/labels";
import type { PastoralTask, Person, TaskType } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<PastoralTask[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [form, setForm] = useState({ title: "", person_id: "", type: "ligar" as TaskType, responsible: "", due_date: "", notes: "" });

  async function load() {
    if (!supabase || !membrosDb) return;
    const [taskResult, peopleResult] = await Promise.all([
      membrosDb.from("pastoral_tasks").select("*, people(name, phone)").order("status").order("due_date"),
      membrosDb.from("people").select("*").order("name")
    ]);
    setTasks((taskResult.data ?? []) as PastoralTask[]);
    setPeople((peopleResult.data ?? []) as Person[]);
  }

  useEffect(() => { load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !membrosDb) return;
    await membrosDb.from("pastoral_tasks").insert({ ...form, person_id: form.person_id || null, due_date: form.due_date || null, responsible: form.responsible || null, notes: form.notes || null });
    setForm({ title: "", person_id: "", type: "ligar", responsible: "", due_date: "", notes: "" });
    load();
  }

  async function toggle(task: PastoralTask) {
    if (!supabase || !membrosDb) return;
    await membrosDb.from("pastoral_tasks").update({ status: task.status === "pendente" ? "concluido" : "pendente" }).eq("id", task.id);
    load();
  }

  return (
    <PageShell>
      <PageHeader title="Acompanhamento pastoral" description="Tarefas simples, responsaveis, prazos e historico manual de cuidado." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <form onSubmit={save} className="space-y-3">
            <Field label="Tarefa"><input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Pessoa"><select className={inputClass} value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value })}><option value="">Sem vinculo</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Tipo"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TaskType })}>{Object.entries(taskTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Responsavel"><input className={inputClass} value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} /></Field>
            <Field label="Prazo"><input className={inputClass} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></Field>
            <Field label="Historico / observacoes"><textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button className="w-full">Salvar tarefa</Button>
          </form>
        </Card>
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{task.title}</h3><Badge tone={task.status === "pendente" ? "warn" : "good"}>{taskStatusLabels[task.status]}</Badge></div>
                  <p className="mt-1 text-sm text-ink/65">{taskTypeLabels[task.type]} · {task.people?.name ?? "sem pessoa"} · prazo {formatDate(task.due_date)} · {task.responsible ?? "sem responsavel"}</p>
                  {task.notes ? <p className="mt-2 text-sm">{task.notes}</p> : null}
                </div>
                <Button className="bg-ink" onClick={() => toggle(task)}>{task.status === "pendente" ? "Concluir" : "Reabrir"}</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
