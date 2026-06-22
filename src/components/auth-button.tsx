"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setEmail(null);
  }

  if (!email) {
    return (
      <Link href="/login" className="mt-6 flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-sage">
        <LogIn className="h-4 w-4" />Entrar
      </Link>
    );
  }

  return (
    <button onClick={logout} className="mt-6 flex w-full items-center gap-2 rounded-md border border-line px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-sage">
      <LogOut className="h-4 w-4" />Sair
    </button>
  );
}
