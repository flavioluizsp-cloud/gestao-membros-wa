import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-sage px-4 py-8">
      <article className="mx-auto max-w-3xl rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-moss">IGREJA BATISTA INDEPENDENTE</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-moss/70">ABELARDO LUZ</p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-ink/60">Versão 2026-06-23</p>

        <div className="mt-6 space-y-5 text-sm leading-6 text-ink/75">
          <section>
            <h2 className="font-semibold text-ink">1. Finalidade</h2>
            <p>Coletamos e tratamos dados pessoais para cadastro, cuidado pastoral, comunicação, organização de grupos familiares, departamentos, eventos, presença, acompanhamento e integração na vida comunitária da igreja.</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink">2. Dados coletados</h2>
            <p>Podemos coletar nome, telefone, e-mail, data de nascimento, cidade natal, situação familiar, informações de batismo, grupo familiar, departamentos, pedidos de oração e histórico de acompanhamento informado manualmente.</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink">3. Quem acessa</h2>
            <p>O acesso é limitado conforme a função no sistema: membros acessam o próprio perfil, líderes acessam apenas pessoas vinculadas ao seu grupo ou departamento, e pastor/admin acessam os dados necessários para gestão e cuidado pastoral.</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink">4. Compartilhamento</h2>
            <p>Os dados não são vendidos. O compartilhamento interno acontece apenas quando necessário para cuidado pastoral, comunicação, organização de atividades e administração da igreja.</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink">5. Direitos do titular</h2>
            <p>Você pode pedir acesso, correção, atualização ou exclusão dos seus dados, observadas as necessidades administrativas, legais e pastorais da igreja.</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink">6. Segurança</h2>
            <p>Usamos controle de acesso por perfil e buscamos limitar os dados ao mínimo necessário. Líderes e administradores devem manter sigilo e usar os dados apenas para finalidades da igreja.</p>
          </section>

          <section>
            <h2 className="font-semibold text-ink">7. Contato</h2>
            <p>Para dúvidas, correções ou solicitações sobre seus dados, procure a liderança da Igreja Batista Independente de Abelardo Luz.</p>
          </section>
        </div>

        <Link href="/" className="mt-6 inline-flex rounded-md bg-moss px-3 py-2 text-sm font-semibold text-white hover:bg-moss/90">
          Voltar
        </Link>
      </article>
    </main>
  );
}
