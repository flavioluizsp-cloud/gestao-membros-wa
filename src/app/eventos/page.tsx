"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/date";
import type { Attendance, ChurchEvent, Person } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [form, setForm] = useState({ name: "", event_date: "", location: "", notes: "" });

  async function load() {
    if (!supabase) return;
    const [eventResult, peopleResult, attendanceResult] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: false }),
      supabase.from("people").select("*").order("name"),
      supabase.from("attendance").select("*, people(name, status), events(name, event_date)")
    ]);
    setEvents((eventResult.data ?? []) as ChurchEvent[]);
    setPeople((peopleResult.data ?? []) as Person[]);
    setAttendance((attendanceResult.data ?? []) as Attendance[]);
  }

  useEffect(() => { load(); }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from("events").insert({ ...form, location: form.location || null, notes: form.notes || null });
    setForm({ name: "", event_date: "", location: "", notes: "" });
    load();
  }

  async function mark(personId: string, present: boolean) {
    if (!supabase || !selectedEvent) return;
    await supabase.from("attendance").upsert({ event_id: selectedEvent, person_id: personId, present }, { onConflict: "event_id,person_id" });
    load();
  }

  return (
    <PageShell>
      <PageHeader title="Eventos e presenca" description="Crie eventos e registre presenca manualmente." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <form onSubmit={save} className="space-y-3">
            <Field label="Nome do evento"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Data"><input required className={inputClass} type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></Field>
            <Field label="Local"><input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Observacoes"><textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button className="w-full">Criar evento</Button>
          </form>
        </Card>
        <div className="space-y-5">
          <Card>
            <Field label="Evento para registrar presenca">
              <select className={inputClass} value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                <option value="">Selecione</option>
                {events.map((event) => <option key={event.id} value={event.id}>{event.name} - {formatDate(event.event_date)}</option>)}
              </select>
            </Field>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {people.map((person) => {
                const row = attendance.find((item) => item.event_id === selectedEvent && item.person_id === person.id);
                return (
                  <div key={person.id} className="flex items-center justify-between rounded-md border border-line p-3">
                    <span className="text-sm font-medium">{person.name}</span>
                    <Button className={row?.present ? "bg-emerald-700" : "bg-ink"} onClick={() => mark(person.id, !row?.present)}>{row?.present ? "Presente" : "Marcar"}</Button>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h3 className="mb-3 font-semibold">Historico recente</h3>
            <div className="space-y-2">
              {attendance.filter((item) => item.present).slice(0, 12).map((item) => <p key={item.id} className="text-sm">{item.people?.name} em {item.events?.name} · {formatDate(item.events?.event_date)}</p>)}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
