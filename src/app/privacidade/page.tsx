import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="section-shell py-12 sm:py-16">
      <div className="card-surface mx-auto max-w-3xl p-6 sm:p-8">
        <Link href="/" className="text-sm font-semibold text-brand-blue">
          ← Voltar
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Politica de Privacidade</h1>
        <div className="mt-6 space-y-4 text-base leading-7 text-slate-600">
          <p>
            Os dados preenchidos no formulario e a foto enviada sao usados apenas para gerar a
            figurinha personalizada e processar o pagamento relacionado ao pedido.
          </p>
          <p>
            Os arquivos sao armazenados temporariamente em ambiente local para permitir preview,
            pagamento e download posterior.
          </p>
          <p>
            Nenhum dado sensivel e compartilhado fora dos provedores tecnicos necessarios para
            geracao e pagamento.
          </p>
        </div>
      </div>
    </main>
  );
}
