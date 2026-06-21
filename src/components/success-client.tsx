"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type SuccessClientProps = {
  stickerId: string;
  fullName: string;
  cleanUrl: string;
  initialPremiumStatus: "not_started" | "processing" | "ready" | "failed";
  initialPremiumError?: string;
};

type StickerStatusResponse = {
  id: string;
  fullName: string;
  team: string;
  paid: boolean;
  premiumStatus: "not_started" | "processing" | "ready" | "failed";
  premiumError: string | null;
  previewUrl: string;
  cleanUrl: string;
};

const LOADING_STEPS = [
  "Recebemos seu pagamento com sucesso.",
  "Estamos enviando seus dados para a IA premium.",
  "Gerando a versao final sem marca d'agua.",
  "Fazendo os ultimos ajustes para liberar o download.",
];

export function SuccessClient({
  stickerId,
  fullName,
  cleanUrl,
  initialPremiumStatus,
  initialPremiumError,
}: SuccessClientProps) {
  const [premiumStatus, setPremiumStatus] = useState(initialPremiumStatus);
  const [premiumError, setPremiumError] = useState(initialPremiumError ?? "");
  const [pollTick, setPollTick] = useState(0);

  const loadingMessage = useMemo(
    () => LOADING_STEPS[Math.min(pollTick, LOADING_STEPS.length - 1)],
    [pollTick],
  );

  useEffect(() => {
    let cancelled = false;

    async function finalizeSticker() {
      if (premiumStatus !== "not_started") {
        return;
      }

      try {
        const response = await fetch(`/api/stickers/${stickerId}/finalize`, {
          method: "POST",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Nao foi possivel iniciar a finalizacao premium.");
        }

        if (!cancelled) {
          setPremiumStatus(result.status);
        }
      } catch (error) {
        if (!cancelled) {
          setPremiumStatus("failed");
          setPremiumError(
            error instanceof Error ? error.message : "Falha ao finalizar sua figurinha premium.",
          );
        }
      }
    }

    void finalizeSticker();

    return () => {
      cancelled = true;
    };
  }, [premiumStatus, stickerId]);

  useEffect(() => {
    if (premiumStatus !== "processing") {
      return;
    }

    const interval = window.setInterval(() => {
      setPollTick((current) => current + 1);
      void fetch(`/api/stickers/${stickerId}`)
        .then((response) => response.json())
        .then((result: StickerStatusResponse) => {
          setPremiumStatus(result.premiumStatus);
          setPremiumError(result.premiumError ?? "");
        })
        .catch(() => {
          // Ignore transient polling failures while waiting.
        });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [premiumStatus, stickerId]);

  const canDownload = premiumStatus === "ready" || premiumStatus === "failed";

  return (
    <main className="bg-radial-brand min-h-screen">
      <section className="section-shell py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="card-surface p-4 sm:p-6">
            {canDownload ? (
              <Image
                src={cleanUrl}
                alt={`Figurinha pronta de ${fullName}`}
                width={800}
                height={1120}
                unoptimized
                className="mx-auto w-full max-w-md rounded-[24px]"
              />
            ) : (
              <div className="grid min-h-[560px] place-items-center rounded-[24px] bg-slate-50 p-8 text-center">
                <div>
                  <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
                  <p className="mt-6 text-lg font-bold text-slate-950">
                    Finalizando sua figurinha premium
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{loadingMessage}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card-surface p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green">
              Pagamento confirmado
            </p>

            {canDownload ? (
              <>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  🎉 Pagamento confirmado! Sua figurinha esta pronta.
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  {premiumStatus === "failed"
                    ? "A finalizacao premium da IA falhou, mas deixamos a versao local pronta para voce baixar agora."
                    : "A figurinha foi liberada sem marca d'agua e com resolucao de 800x1120px para download imediato."}
                </p>
                {premiumError ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    {premiumError}
                  </div>
                ) : null}
                <a href={cleanUrl} download className="btn-primary mt-8 w-full">
                  ⬇️ Baixar minha figurinha (PNG)
                </a>
              </>
            ) : (
              <>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  🎉 Pagamento confirmado! Estamos finalizando sua figurinha premium...
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Seu preview ja foi aprovado. Agora estamos gerando a versao final com OpenAI,
                  sem marca d&apos;agua e com acabamento premium.
                </p>
                <div className="mt-8 rounded-[24px] border border-brand-blue/10 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Etapa atual</p>
                  <p className="mt-2 text-xl font-bold text-slate-950">{loadingMessage}</p>
                  <div className="mt-4 h-2.5 rounded-full bg-white">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-brand-green via-brand-yellow to-brand-blue transition-all duration-700"
                      style={{ width: `${Math.min(92, 30 + pollTick * 16)}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <Link href="/criar" className="btn-secondary mt-4 w-full">
              Criar outra figurinha
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
