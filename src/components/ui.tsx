"use client";

import { animate, motion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Número que anima ao mudar (400ms), com dígitos tabulares. */
export function AnimNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const controls = animate(prev.current, value, {
      duration: 0.4,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);
  return <span className="tabular">{display}</span>;
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`flex h-[52px] w-full items-center justify-center rounded-full bg-lime px-8 font-bold text-ink-deep transition-opacity disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function GlassCard({
  children,
  className = "",
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={`rounded-[26px] border border-white/10 bg-white/[0.06] backdrop-blur-xl ${className}`}
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Símbolo + wordmark do Sync; cai em texto se os PNGs não existirem. */
export function Brand({
  symbolSize = 72,
  wordmarkHeight = 44,
}: {
  symbolSize?: number;
  wordmarkHeight?: number;
}) {
  const [symbolBroken, setSymbolBroken] = useState(false);
  const [wordBroken, setWordBroken] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      {!symbolBroken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/symbol.png"
          alt=""
          style={{ width: symbolSize, height: symbolSize }}
          className="object-contain"
          onError={() => setSymbolBroken(true)}
        />
      )}
      {wordBroken ? (
        <span
          className="font-bold lowercase tracking-tight text-lime"
          style={{ fontSize: wordmarkHeight * 0.9, lineHeight: 1 }}
        >
          sync
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/wordmark.png"
          alt="Sync"
          style={{ height: wordmarkHeight }}
          className="object-contain"
          onError={() => setWordBroken(true)}
        />
      )}
    </div>
  );
}

export const EASE = [0.22, 1, 0.36, 1] as const;
