"use client";

import { useEffect, useState } from "react";

type CountUpProps = {
  end: number;
  durationMs?: number;
};

export function CountUp({ end, durationMs = 1400 }: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(end * progress));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [durationMs, end]);

  return <>{value.toLocaleString("pt-BR")}</>;
}
