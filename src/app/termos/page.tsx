import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="section-shell py-12 sm:py-16">
      <div className="card-surface mx-auto max-w-3xl p-6 sm:p-8">
        <Link href="/" className="text-sm font-semibold text-brand-blue">
          ← Voltar
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Termos de Uso</h1>
        <div className="mt-6 space-y-4 text-base leading-7 text-slate-600">
          <p>
            Ao utilizar o site Minha Figurinha da Copa 2026, voce concorda com o envio dos dados
            informados para gerar a figurinha personalizada e processar o pagamento.
          </p>
          <p>
            O arquivo gerado fica disponivel temporariamente para visualizacao e download, podendo
            ser removido apos o periodo de armazenamento definido pela aplicacao.
          </p>
          <p>
            O conteudo enviado deve respeitar direitos de imagem, privacidade e legislacao vigente.
          </p>
        </div>
      </div>
    </main>
  );
}
