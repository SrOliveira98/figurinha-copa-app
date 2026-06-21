import Link from "next/link";

import { CreateForm } from "@/components/create-form";
import { StickerCard } from "@/components/sticker-card";

export default function CreatePage() {
  return (
    <main className="bg-radial-brand">
      <section className="section-shell py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-brand-blue">
            ← Voltar para a home
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-green">
            Minha Figurinha da Copa 2026
          </p>
        </div>
      </section>

      <section className="section-shell pb-14 pt-4 sm:pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <CreateForm />

          <div className="space-y-5 lg:sticky lg:top-6">
            <div className="card-surface interactive-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
                Resultado esperado
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Sua figurinha sera criada no estilo do album 2026
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Envie uma boa foto de rosto para melhorar o recorte e deixar a figurinha mais
                parecida com um mockup oficial.
              </p>
            </div>

            <StickerCard
              name="GABRIEL"
              stats="10-6-1999 | 1,75m | 70 kg"
              team="BRASIL"
              theme="gold"
              watermark
            />
          </div>
        </div>
      </section>
    </main>
  );
}
