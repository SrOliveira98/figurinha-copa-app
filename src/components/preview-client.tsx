"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type PreviewResponse = {
  id: string;
  fullName: string;
  team: string;
  paid: boolean;
  previewUrl: string;
  cleanUrl: string;
};

export function PreviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [sticker, setSticker] = useState<PreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSticker() {
      if (!id) {
        router.replace("/");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/stickers/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Nao foi possivel carregar a figurinha.");
        }

        setSticker(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Falha ao carregar.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSticker();
  }, [id, router]);

  async function startCheckout() {
    if (!sticker) {
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setError("");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stickerId: sticker.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Nao foi possivel iniciar o pagamento.");
      }

      window.location.href = result.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Falha ao iniciar o checkout do Stripe.",
      );
      setIsCheckoutLoading(false);
    }
  }

  if (isLoading) {
    return (
      <section className="section-shell py-12 sm:py-16">
        <div className="card-surface grid min-h-[520px] place-items-center px-6 py-12 text-center">
          <div>
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
            <h1 className="mt-8 text-3xl font-bold text-slate-950">
              Estamos criando sua figurinha... ✨
            </h1>
            <p className="mt-3 text-base text-slate-600">Isso pode levar alguns segundos.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!sticker) {
    return (
      <section className="section-shell py-12 sm:py-16">
        <div className="card-surface px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-950">Nao encontramos sua figurinha.</h1>
          <p className="mt-3 text-slate-600">{error || "Tente criar novamente."}</p>
          <a href="/criar" className="btn-primary mt-8">
            Criar minha figurinha
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="card-surface p-4 sm:p-6">
          <Image
            src={sticker.previewUrl}
            alt={`Preview da figurinha de ${sticker.fullName}`}
            width={800}
            height={1120}
            unoptimized
            className="mx-auto w-full max-w-md rounded-[24px]"
          />
        </div>

        <div className="card-surface p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green">
            Preview liberado
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Sua figurinha da Copa 2026 ja esta pronta.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Gostou? Remova a marca d&apos;agua por apenas R$9,90 e baixe a versao final em alta
            resolucao.
          </p>

          <div className="mt-8 rounded-[24px] border border-brand-blue/10 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Jogador</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{sticker.fullName}</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.24em] text-brand-blue">
              {sticker.team}
            </p>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={startCheckout}
            disabled={isCheckoutLoading}
            className="btn-primary mt-8 w-full disabled:cursor-wait disabled:opacity-70"
          >
            {isCheckoutLoading ? "Abrindo checkout..." : "💳 Pagar R$9,90 e baixar"}
          </button>
          <p className="mt-3 text-center text-sm text-slate-500">
            Pagamento seguro via Stripe • Acesso imediato apos confirmacao
          </p>

          <a href="/criar" className="btn-secondary mt-4 w-full">
            Criar outra figurinha
          </a>
        </div>
      </div>
    </section>
  );
}
