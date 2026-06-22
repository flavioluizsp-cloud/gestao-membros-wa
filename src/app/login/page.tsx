"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, inputClass, PageHeader, PageShell } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return setMessage("Configure as variaveis do Supabase primeiro.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/");
  }

  return (
    <PageShell>
      <PageHeader title="Entrar" description="Use um usuario criado em Authentication no Supabase." />
      <Card className="max-w-md">
        <form onSubmit={login} className="space-y-3">
          <Field label="E-mail"><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Field label="Senha"><input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          {message ? <p className="text-sm text-amber-700">{message}</p> : null}
          <Button className="w-full">Entrar</Button>
        </form>
      </Card>
    </PageShell>
  );
}
