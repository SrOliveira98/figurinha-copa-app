"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

const STEPS = [
  "Qual e o nome do craque?",
  "Quando nasceu o craque?",
  "Qual a altura e peso?",
  "Qual e o time do coracao?",
  "Agora envie a foto do craque!",
] as const;

const POPULAR_TEAMS = [
  "Flamengo",
  "Corinthians",
  "Palmeiras",
  "Sao Paulo",
  "Santos",
  "Vasco",
  "Fluminense",
  "Gremio",
  "Internacional",
  "Atletico-MG",
];

type FormState = {
  firstName: string;
  lastName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  heightCm: string;
  weightKg: string;
  team: string;
};

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  heightCm: "",
  weightKg: "",
  team: "",
};

const SUBMIT_STAGES = [
  {
    title: "Enviando a foto",
    description: "Estamos preparando sua imagem para a geracao.",
    progress: 18,
  },
  {
    title: "Criando com IA",
    description: "A OpenAI esta montando sua figurinha personalizada.",
    progress: 48,
  },
  {
    title: "Ajustando detalhes",
    description: "Aplicando nome, stats e visual final da figurinha.",
    progress: 76,
  },
  {
    title: "Finalizando preview",
    description: "Gerando a versao com marca d'agua para exibicao.",
    progress: 92,
  },
] as const;

export function CreateForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStageIndex, setSubmitStageIndex] = useState(0);

  const progress = ((step + 1) / STEPS.length) * 100;
  const submitStage = SUBMIT_STAGES[submitStageIndex];

  const birthYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 80 }, (_, index) => String(currentYear - index));
  }, []);

  useEffect(() => {
    if (!isSubmitting) {
      setSubmitStageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setSubmitStageIndex((current) => Math.min(current + 1, SUBMIT_STAGES.length - 1));
    }, 2600);

    return () => window.clearInterval(interval);
  }, [isSubmitting]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function validateCurrentStep() {
    if (step === 0) {
      return form.firstName.trim() && form.lastName.trim();
    }

    if (step === 1) {
      return form.birthDay && form.birthMonth && form.birthYear;
    }

    if (step === 2) {
      return Number(form.heightCm) >= 60 && Number(form.weightKg) >= 10;
    }

    if (step === 3) {
      return form.team.trim().length >= 2;
    }

    return !!photoFile;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      setError("Preencha os campos antes de continuar.");
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
    setError("");
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Envie uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("A imagem deve ter no maximo 10MB.");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleGenerate() {
    if (!validateCurrentStep() || !photoFile) {
      setError("Envie a foto para gerar a figurinha.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = new FormData();
      payload.append("firstName", form.firstName);
      payload.append("lastName", form.lastName);
      payload.append("birthDay", form.birthDay);
      payload.append("birthMonth", form.birthMonth);
      payload.append("birthYear", form.birthYear);
      payload.append("heightCm", form.heightCm);
      payload.append("weightKg", form.weightKg);
      payload.append("team", form.team);
      payload.append("photo", photoFile);

      const response = await fetch("/api/generate", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Nao foi possivel gerar a figurinha.");
      }

      router.push(`/preview?id=${result.id}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Falha ao gerar a figurinha.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-500">
          <span>Etapa {step + 1}/5</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-brand-green via-brand-yellow to-brand-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green">
            Criar figurinha
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {STEPS[step]}
          </h1>
        </div>

        <div className="space-y-5">
          {step === 0 ? (
            <div className="grid gap-4">
              <Field label="Nome">
                <input
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  placeholder="Ex: Gabriel"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
              <Field label="Sobrenome">
                <input
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  placeholder="Ex: Silva"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Dia">
                <input
                  value={form.birthDay}
                  onChange={(event) => updateField("birthDay", event.target.value)}
                  placeholder="10"
                  inputMode="numeric"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
              <Field label="Mes">
                <input
                  value={form.birthMonth}
                  onChange={(event) => updateField("birthMonth", event.target.value)}
                  placeholder="6"
                  inputMode="numeric"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
              <Field label="Ano">
                <select
                  value={form.birthYear}
                  onChange={(event) => updateField("birthYear", event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                >
                  <option value="">Selecione</option>
                  {birthYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Altura (cm)">
                <input
                  value={form.heightCm}
                  onChange={(event) => updateField("heightCm", event.target.value)}
                  placeholder="Ex: 175"
                  inputMode="numeric"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
              <Field label="Peso (kg)">
                <input
                  value={form.weightKg}
                  onChange={(event) => updateField("weightKg", event.target.value)}
                  placeholder="Ex: 70"
                  inputMode="numeric"
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <Field label="Time do coracao">
                <input
                  value={form.team}
                  onChange={(event) => updateField("team", event.target.value)}
                  placeholder="Ex: Flamengo, Corinthians..."
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-base"
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TEAMS.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => updateField("team", team)}
                    className={cn(
                      "min-h-12 rounded-full border px-4 py-2 text-sm font-semibold transition",
                      form.team === team
                        ? "border-brand-green bg-brand-green text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-blue/30",
                    )}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-dashed border-brand-blue/25 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">
                  Use uma foto de rosto, com boa iluminacao, fundo limpo e sem oculos escuros.
                </p>
                <label className="mt-4 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-slate-200 bg-white p-6 text-center">
                  <span className="text-4xl">📸</span>
                  <span className="mt-3 text-base font-semibold text-slate-900">
                    Toque para selecionar ou arraste a foto
                  </span>
                  <span className="mt-2 text-sm text-slate-500">JPG, PNG ou WEBP ate 10MB</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {photoPreview ? (
                <div className="rounded-[24px] border border-slate-200 bg-white p-3">
                  <Image
                    src={photoPreview}
                    alt="Preview da foto enviada"
                    width={800}
                    height={800}
                    unoptimized
                    className="h-72 w-full rounded-[18px] object-cover"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {isSubmitting ? (
            <div className="rounded-[24px] border border-brand-green/15 bg-brand-green/5 p-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
                <div className="flex-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-green">
                    Gerando figurinha
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-950">{submitStage.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{submitStage.description}</p>
                  <div className="mt-4 h-2.5 rounded-full bg-white">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-brand-green via-brand-yellow to-brand-blue transition-all duration-700"
                      style={{ width: `${submitStage.progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    Isso pode levar de 20 a 60 segundos, dependendo da fila da IA.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || isSubmitting}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Voltar
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext} className="btn-primary">
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isSubmitting}
                className="btn-primary disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting ? `${submitStage.title}...` : "Gerar minha figurinha! 🎴"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
