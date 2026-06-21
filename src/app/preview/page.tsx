import Link from "next/link";
import { Suspense } from "react";

import { PreviewClient } from "@/components/preview-client";

export default function PreviewPage() {
  return (
    <main className="bg-radial-brand min-h-screen">
      <section className="section-shell py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-brand-blue">
            ← Voltar para a home
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-green">
            Preview da figurinha
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <PreviewClient />
      </Suspense>
    </main>
  );
}
