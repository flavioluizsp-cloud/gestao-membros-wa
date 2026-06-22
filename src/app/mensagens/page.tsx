"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { templateLabels } from "@/lib/labels";
import { membrosDb, supabase } from "@/lib/supabase";
import { buildWhatsAppUrl, renderTemplate } from "@/lib/whatsapp";
import type { Interaction, MessageTemplate, Person, TemplateKey } from "@/lib/types";

export default function MessagesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [body, setBody] = useState("");
  const person = people.find((p) => p.id === personId);

  async function load() {
    if (!supabase || !membrosDb) return;
    const [templateResult, peopleResult] = await Promise.all([
      membrosDb.from("message_templates").select("*").order("name"),
      membrosDb.from("people").select("*").order("name")
    ]);
    setTemplates((templateResult.data ?? []) as MessageTemplate[]);
    setPeople((peopleResult.data ?? []) as Person[]);
  }

  useEffect(() => { load(); }, []);

  function chooseTemplate(id: string) {
    setTemplateId(id);
    const selected = templates.find((template) => template.id === id);
    setBody(selected?.body ?? "");
  }

  async function saveTemplate() {
    if (!supabase || !membrosDb || !templateId) return;
    await membrosDb.from("message_templates").update({ body }).eq("id", templateId);
    load();
  }

  async function registerSent() {
    if (!supabase || !membrosDb || !person) return;
    await membrosDb.from("interactions").insert({ person_id: person.id, type: "whatsapp", notes: body });
    await membrosDb.from("people").update({ last_contact_at: new Date().toISOString() }).eq("id", person.id);
  }

  const rendered = person ? renderTemplate(body, { nome: person.name, telefone: person.phone }) : body;

  return (
    <PageShell>
      <PageHeader title="Mensagens WhatsApp" description="Templates editaveis e envio por link wa.me, sem API paga no MVP." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <div className="space-y-3">
            <Field label="Pessoa"><select className={inputClass} value={personId} onChange={(e) => setPersonId(e.target.value)}><option value="">Selecione</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Template"><select className={inputClass} value={templateId} onChange={(e) => chooseTemplate(e.target.value)}><option value="">Selecione</option>{templates.map((t) => <option key={t.id} value={t.id}>{templateLabels[t.key as TemplateKey] ?? t.name}</option>)}</select></Field>
            <Field label="Mensagem"><textarea className={inputClass} rows={8} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
            <Button className="w-full" onClick={saveTemplate} disabled={!templateId}>Salvar template</Button>
            <a onClick={registerSent} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" target="_blank" href={person ? buildWhatsAppUrl(person.phone, rendered) : "#"}>
              <MessageCircle className="h-4 w-4" />Enviar WhatsApp
            </a>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">Previa</h3>
          <p className="mt-3 whitespace-pre-wrap rounded-md border border-line bg-sage/40 p-4 text-sm">{rendered || "Escolha um template para visualizar a mensagem."}</p>
          <p className="mt-4 text-sm text-ink/60">Variaveis disponiveis: {"{{nome}}"}, {"{{telefone}}"}.</p>
        </Card>
      </div>
    </PageShell>
  );
}
