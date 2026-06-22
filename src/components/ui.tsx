import Link from "next/link";
import { clsx } from "clsx";
import { AuthButton } from "./auth-button";

export function PageShell({ children }: { children: React.ReactNode }) {
  const nav = [
    ["Dashboard", "/"],
    ["Pessoas", "/pessoas"],
    ["Visitantes", "/visitantes"],
    ["Tarefas", "/tarefas"],
    ["Mensagens", "/mensagens"],
    ["Eventos", "/eventos"],
    ["Relatorios", "/relatorios"],
    ["Permissoes", "/permissoes"]
  ];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 lg:block">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">Igreja CRM</p>
          <h1 className="mt-1 text-xl font-bold text-ink">Gestao Membros WA</h1>
        </div>
        <nav className="space-y-1">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-sage">
              {label}
            </Link>
          ))}
        </nav>
        <AuthButton />
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-line bg-white px-4 py-3 lg:hidden">
          <p className="font-bold text-ink">Gestao Membros WA</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded-md border border-line px-3 py-1.5 text-sm">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink/65">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("rounded-lg border border-line bg-white p-4 shadow-soft", className)}>{children}</section>;
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx("inline-flex items-center justify-center rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, href, className = "" }: { children: React.ReactNode; href: string; className?: string }) {
  return (
    <Link href={href} className={clsx("inline-flex items-center justify-center rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90", className)}>
      {children}
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus-ring";

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink/60">{text}</p>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" }) {
  const tones = {
    neutral: "bg-sage text-moss",
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700"
  };
  return <span className={clsx("inline-flex rounded-md px-2 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
