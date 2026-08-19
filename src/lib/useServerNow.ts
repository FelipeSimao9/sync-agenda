"use client";

import { useEffect, useState } from "react";

/**
 * Relógio confiável: offset calculado contra /api/time no primeiro load;
 * o cliente usa Date.now() + offset. Re-renderiza a cada `tickMs`.
 */
export function useServerNow(tickMs: number): number {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const before = Date.now();
        const res = await fetch("/api/time", { cache: "no-store" });
        const { now: serverNow } = await res.json();
        const rtt = Date.now() - before;
        if (!cancelled) setOffset(serverNow + rtt / 2 - Date.now());
      } catch {
        // sem servidor, fica no relógio local
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setNow(Date.now() + offset);
    const t = setInterval(() => setNow(Date.now() + offset), tickMs);
    return () => clearInterval(t);
  }, [offset, tickMs]);

  return now;
}
