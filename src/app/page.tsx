import Link from "next/link";

import { CountUp } from "@/components/count-up";
import { ExampleStickerImage } from "@/components/example-sticker-image";

const EXAMPLES = [
  {
    name: "Figurinha 1",
    src: "/reais/1.png",
  },
  {
    name: "Figurinha 2",
    src: "/reais/2.png",
  },
  {
    name: "Figurinha 3",
    src: "/reais/3.png",
  },
  {
    name: "Figurinha 4",
    src: "/reais/4.png",
  },
  {
    name: "Figurinha 5",
    src: "/reais/5.png",
  },
];

const STEPS = [
  {
    emoji: "📸",
    title: "Envie sua foto e dados",
    description: "Preencha nome, data de nascimento, altura, peso e time.",
  },
  {
    emoji: "🎨",
    title: "Veja sua figurinha",
    description: "A IA gera sua figurinha personalizada na hora.",
  },
  {
    emoji: "⬇️",
    title: "Baixe sua figurinha",
    description: "Depois do preview, voce libera a versao final sem marca d'agua.",
  },
];

export default function Home() {
  return (
    <main className="bg-radial-brand">
      <section className="section-shell py-6">
        <div className="flex items-center justify-between rounded-full border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="font-display text-xl uppercase tracking-wide text-brand-blue">
              Minha Figurinha
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-green">
              Copa do Mundo 2026
            </p>
          </div>
          <Link href="/criar" className="btn-primary px-5 py-2 text-sm">
            Criar agora
          </Link>
        </div>
      </section>

      <section className="section-shell pb-14 pt-6 sm:pb-20 sm:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-brand-green/15 bg-brand-green/10 px-4 py-2 text-sm font-semibold text-brand-green">
              Edicao personalizada no estilo album 2026
            </div>
            <h1 className="mt-6 text-balance text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Transforme voce (ou seu filho) em uma figurinha da Copa do Mundo 2026!
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Crie uma figurinha exclusiva e personalizada no estilo Panini. Veja o resultado
              antes de pagar.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/criar" className="btn-primary text-center text-lg">
                Criar minha figurinha agora →
              </Link>
              <a href="#como-funciona" className="btn-secondary text-center">
                Ver como funciona
              </a>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600">
              ✅ Mais de 2.500 figurinhas ja criadas!
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="card-surface interactive-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green">
                  Mobile first
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fluxo pensado para conversao em celular, com etapas simples e toque rapido.
                </p>
              </div>
              <div className="card-surface interactive-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
                  Preview instantaneo
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  O usuario ve a figurinha com marca d&apos;agua antes de pagar.
                </p>
              </div>
              <div className="card-surface interactive-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-yellow">
                  Download premium
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Liberacao automatica da versao sem marca d&apos;agua apos o Stripe.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md items-center justify-center lg:justify-start">
            <div className="relative flex min-h-[360px] w-full items-center justify-center lg:-ml-20">
              <ExampleStickerImage
                src="/reais/1.png"
                alt="Exemplo real de figurinha 1"
                priority
                className="absolute left-1/2 top-10 w-full max-w-[180px] -translate-x-[56%] rotate-[-10deg] sm:max-w-[210px]"
              />
              <ExampleStickerImage
                src="/reais/2.png"
                alt="Exemplo real de figurinha 2"
                priority
                className="absolute left-1/2 top-2 z-20 w-full max-w-[180px] -translate-x-[48%] rotate-[8deg] sm:max-w-[210px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16 sm:pb-20">
        <div className="card-surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-blue">
                Galeria de exemplos
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                Figurinhas reais de exemplo para inspirar a criacao
              </h2>
            </div>
            <Link href="/criar" className="hidden text-sm font-semibold text-brand-green sm:block">
              Quero a minha →
            </Link>
          </div>

          <div className="mt-8 grid justify-center gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {EXAMPLES.map((example) => (
              <ExampleStickerImage
                key={example.name}
                src={example.src}
                alt={`Exemplo de figurinha ${example.name}`}
                className="mx-auto w-full max-w-[190px] sm:max-w-[210px]"
              />
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="section-shell pb-16 sm:pb-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green">
            Como funciona
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            Um fluxo simples para gerar sua figurinha em minutos
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((item, index) => (
            <div key={item.title} className="card-surface interactive-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-2xl">
                {item.emoji}
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Passo {index + 1}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell pb-16 sm:pb-20">
        <div className="card-surface relative overflow-hidden bg-[linear-gradient(135deg,#001940_0%,#002776_58%,#004cb3_100%)] p-8 text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,223,0,0.18),transparent_25%),radial-gradient(circle_at_left,rgba(0,156,59,0.20),transparent_30%)]" />
          <p className="relative text-sm font-semibold uppercase tracking-[0.24em] text-brand-yellow">
            Prova social
          </p>
          <div className="relative mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-white sm:text-5xl">
                +<CountUp end={2500} /> figurinhas criadas
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-100">
                Criadores no Brasil e em varios paises ja transformaram filhos, amigos e ate o
                time inteiro em figurinhas personalizadas.
              </p>
            </div>
            <p className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-4xl shadow-[0_14px_40px_rgba(0,0,0,0.16)] backdrop-blur">
              🇧🇷🇦🇷🇫🇷🇩🇪🇪🇸
            </p>
          </div>
        </div>
      </section>

      <footer className="section-shell pb-10">
        <div className="flex flex-col gap-3 border-t border-slate-200 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Minha Figurinha. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/termos">Termos de Uso</Link>
            <Link href="/privacidade">Politica de Privacidade</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
