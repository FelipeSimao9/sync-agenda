"use client";

import { animate, motion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * <img> que cai num fallback quando o arquivo não existe — inclusive quando
 * o erro acontece antes da hidratação (checa naturalWidth no mount).
 */
export function SafeImg({
  src,
  alt = "",
  className,
  style,
  fallback = null,
}: {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBroken(true);
  }, [src]);
  if (!src || broken) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setBroken(true)}
    />
  );
}

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
  return (
    <div className="flex flex-col items-center gap-4">
      <SafeImg
        src="/brand/symbol.png"
        style={{ width: symbolSize, height: symbolSize }}
        className="object-contain"
        fallback={
          <span
            aria-hidden
            className="flex items-center justify-center rounded-full border-[3px] border-lime font-bold text-lime"
            style={{
              width: symbolSize,
              height: symbolSize,
              fontSize: symbolSize * 0.42,
            }}
          >
            S
          </span>
        }
      />
      <SafeImg
        src="/brand/wordmark.png"
        alt="Sync"
        style={{ height: wordmarkHeight }}
        className="object-contain"
        fallback={
          <span
            className="font-bold lowercase tracking-tight text-lime"
            style={{ fontSize: wordmarkHeight * 0.9, lineHeight: 1 }}
          >
            sync
          </span>
        }
      />
    </div>
  );
}

export const EASE = [0.22, 1, 0.36, 1] as const;
